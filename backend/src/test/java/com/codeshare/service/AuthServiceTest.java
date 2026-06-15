package com.codeshare.service;

import com.codeshare.config.AppProperties;
import com.codeshare.dto.constants.Role;
import com.codeshare.dto.request.DeviceMetadata;
import com.codeshare.entity.AuthUser;
import com.codeshare.entity.UserSession;
import com.codeshare.exception.ApiException;
import com.codeshare.repo.AuthUserRepository;
import com.codeshare.repo.UserSessionRepository;
import com.codeshare.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private static final DeviceMetadata DEVICE = new DeviceMetadata("JUnit", "127.0.0.1");

    private AuthUserRepository userRepo;
    private UserSessionRepository sessionRepo;
    private PasswordEncoder encoder;
    private JwtService jwtService;
    private AuthService service;

    @BeforeEach
    void setUp() {
        userRepo = mock(AuthUserRepository.class);
        sessionRepo = mock(UserSessionRepository.class);
        encoder = new BCryptPasswordEncoder();
        AppProperties props = new AppProperties();
        props.setJwtSecret("0123456789012345678901234567890123456789");
        props.setJwtExpiryMs(3600000L);
        props.setSessionExpiryMs(2592000000L);
        jwtService = new JwtService(props);

        service = new AuthService();
        ReflectionTestUtils.setField(service, "authUserRepository", userRepo);
        ReflectionTestUtils.setField(service, "userSessionRepository", sessionRepo);
        ReflectionTestUtils.setField(service, "passwordEncoder", encoder);
        ReflectionTestUtils.setField(service, "jwtService", jwtService);
        ReflectionTestUtils.setField(service, "appProperties", props);
    }

    private AuthUser verifiedUser() {
        AuthUser user = new AuthUser();
        user.setEmail("user@example.com");
        user.setFullName("User");
        user.setPassword(encoder.encode("secret123"));
        user.setVerified(true);
        return user;
    }

    // ── loginWithOAuth ────────────────────────────────────────────────────────

    @Test
    void loginWithOAuthCreatesAccountWhenMissing() {
        when(userRepo.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(userRepo.save(any(AuthUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(sessionRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthService.LoginResult result =
                service.loginWithOAuth("new@example.com", "New User", "GOOGLE", DEVICE);

        AuthUser user = result.user();
        assertThat(user.getEmail()).isEqualTo("new@example.com");
        assertThat(user.getFullName()).isEqualTo("New User");
        assertThat(user.isVerified()).isTrue();
        assertThat(user.getProvider()).isEqualTo("GOOGLE");
        assertThat(user.getRoles()).containsExactly(Role.USER);
        assertThat(jwtService.valid(result.accessToken())).isTrue();
        assertThat(jwtService.getEmail(result.accessToken())).isEqualTo("new@example.com");
        verify(sessionRepo).save(any());
    }

    @Test
    void loginWithOAuthLogsInExistingUserAndLinksProvider() {
        AuthUser existing = verifiedUser();
        existing.setId(7L);
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(existing));
        when(userRepo.save(any(AuthUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(sessionRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthService.LoginResult result =
                service.loginWithOAuth("user@example.com", "Ignored Name", "GITHUB", DEVICE);

        assertThat(result.user().getId()).isEqualTo(7L);
        assertThat(result.user().getFullName()).isEqualTo("User");
        assertThat(result.user().getProvider()).isEqualTo("GITHUB");
        assertThat(jwtService.valid(result.accessToken())).isTrue();
        verify(sessionRepo).save(any());
    }

    @Test
    void loginWithOAuthFallsBackToEmailWhenNameIsNull() {
        when(userRepo.findByEmail("noname@example.com")).thenReturn(Optional.empty());
        when(userRepo.save(any(AuthUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(sessionRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthService.LoginResult result =
                service.loginWithOAuth("noname@example.com", null, "GOOGLE", DEVICE);

        assertThat(result.user().getFullName()).isEqualTo("noname@example.com");
    }

    // ── revokeSession ─────────────────────────────────────────────────────────

    @Test
    void revokeSessionDeletesByTokenId() {
        service.revokeSession("jti-1");
        verify(sessionRepo).deleteByTokenId("jti-1");
    }

    @Test
    void revokeSessionNoOpsOnNull() {
        service.revokeSession(null);
        verify(sessionRepo, never()).deleteByTokenId(any());
    }

    // ── validateAndTouchSession ───────────────────────────────────────────────

    @Test
    void validateAndTouchSessionSlidesActiveSession() {
        UserSession session = new UserSession();
        session.setTokenId("jti-1");
        session.setExpiresAt(Instant.now().plusSeconds(60));
        when(sessionRepo.findByTokenId("jti-1")).thenReturn(Optional.of(session));

        boolean active = service.validateAndTouchSession("jti-1");

        assertThat(active).isTrue();
        assertThat(session.getExpiresAt()).isAfter(Instant.now().plusSeconds(86400));
        verify(sessionRepo).save(session);
        verify(sessionRepo, never()).delete(any());
    }

    @Test
    void validateAndTouchSessionRejectsAndDeletesExpired() {
        UserSession session = new UserSession();
        session.setTokenId("jti-1");
        session.setExpiresAt(Instant.now().minusSeconds(10));
        when(sessionRepo.findByTokenId("jti-1")).thenReturn(Optional.of(session));

        boolean active = service.validateAndTouchSession("jti-1");

        assertThat(active).isFalse();
        verify(sessionRepo).delete(session);
        verify(sessionRepo, never()).save(any());
    }

    @Test
    void validateAndTouchSessionRejectsMissingSession() {
        when(sessionRepo.findByTokenId("jti-x")).thenReturn(Optional.empty());

        assertThat(service.validateAndTouchSession("jti-x")).isFalse();
        assertThat(service.validateAndTouchSession(null)).isFalse();
    }

    // ── getActiveUser ─────────────────────────────────────────────────────────

    @Test
    void getActiveUserReturnsFoundUser() {
        AuthUser user = verifiedUser();
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        AuthUser result = service.getActiveUser("user@example.com");

        assertThat(result.getEmail()).isEqualTo("user@example.com");
    }

    @Test
    void getActiveUserThrowsWhenNotFound() {
        when(userRepo.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getActiveUser("ghost@example.com"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("no longer valid");
    }
}
