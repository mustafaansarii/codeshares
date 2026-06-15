package com.codeshare.service;

import com.codeshare.config.AppProperties;
import com.codeshare.dto.request.DeviceMetadata;
import com.codeshare.entity.AuthUser;
import com.codeshare.entity.UserSession;
import com.codeshare.exception.ApiException;
import com.codeshare.repo.AuthUserRepository;
import com.codeshare.repo.UserSessionRepository;
import com.codeshare.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AppProperties appProperties;

    public record LoginResult(AuthUser user, String accessToken) {
    }

    @Transactional
    public LoginResult loginWithOAuth(String email, String fullName, String provider, DeviceMetadata device) {
        AuthUser user = authUserRepository.findByEmail(email).orElseGet(AuthUser::new);
        boolean isNew = Objects.isNull(user.getId());
        if (isNew) {
            user.setEmail(email);
            user.setFullName(Objects.requireNonNullElse(fullName, email));
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        }
        user.setVerified(true);
        user.setProvider(provider);
        AuthUser saved = authUserRepository.save(user);

        String tokenId = createSession(saved.getEmail(), device);
        List<String> roleNames = saved.getRoles().stream().map(Enum::name).toList();
        String token = jwtService.generate(saved.getEmail(), tokenId, roleNames);
        return new LoginResult(saved, token);
    }

    @Transactional
    public void revokeSession(String tokenId) {
        if (Objects.nonNull(tokenId)) {
            userSessionRepository.deleteByTokenId(tokenId);
        }
    }

    @Transactional
    public boolean validateAndTouchSession(String tokenId) {
        if (Objects.isNull(tokenId)) {
            return false;
        }
        UserSession session = userSessionRepository.findByTokenId(tokenId).orElse(null);
        if (Objects.isNull(session)) {
            return false;
        }
        if (Objects.nonNull(session.getExpiresAt()) && session.getExpiresAt().isBefore(Instant.now())) {
            userSessionRepository.delete(session);
            return false;
        }
        session.setExpiresAt(Instant.now().plus(appProperties.getSessionExpiryMs(), ChronoUnit.MILLIS));
        userSessionRepository.save(session);
        return true;
    }

    @Transactional(readOnly = true)
    public AuthUser getActiveUser(String email) {
        return authUserRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Session is no longer valid"));
    }

    @Transactional
    public AuthUser updateProfile(String email, String profileJson) {
        AuthUser user = getActiveUser(email);
        user.setProfileData(profileJson);
        return authUserRepository.save(user);
    }

//-----------------------------------private methods-----------------------------------

    private String createSession(String email, DeviceMetadata device) {
        UserSession session = new UserSession();
        session.setTokenId(UUID.randomUUID().toString());
        session.setUserEmail(email);
        session.setUserAgent(device.userAgent());
        session.setIpAddress(device.ipAddress());
        session.setExpiresAt(Instant.now().plus(appProperties.getSessionExpiryMs(), ChronoUnit.MILLIS));
        userSessionRepository.save(session);
        return session.getTokenId();
    }
}
