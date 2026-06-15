package com.codeshare.dtoApi;

import com.codeshare.dto.response.MessageResponse;
import com.codeshare.dto.response.UserResponse;
import com.codeshare.entity.AuthUser;
import com.codeshare.security.AuthCookies;
import com.codeshare.exception.ApiException;
import com.codeshare.service.AuthService;
import com.codeshare.util.AbstractDtoUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Objects;

@Component
public class AuthDtoApi extends AbstractDtoUtil {

    private static final Logger logger = LoggerFactory.getLogger(AuthDtoApi.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthCookies authCookies;

    @Autowired
    private ObjectMapper objectMapper;

    public MessageResponse logout(Authentication authentication, HttpServletResponse httpResponse) {
        authService.revokeSession(tokenIdOf(authentication));
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, authCookies.clear().toString());
        return MessageResponse.of("Logged out successfully");
    }

    public UserResponse me(Authentication authentication) {
        return toUserResponse(authService.getActiveUser(authentication.getName()));
    }

    public UserResponse updateProfile(Authentication authentication, Map<String, Object> profile) {
        String json;
        try {
            json = objectMapper.writeValueAsString(profile == null ? Map.of() : profile);
        } catch (Exception e) {
            logger.error("Failed to serialize profile data", e);
            throw ApiException.badData("Invalid profile data");
        }
        return toUserResponse(authService.updateProfile(authentication.getName(), json));
    }

//-----------------------------------private methods-----------------------------------
    private UserResponse toUserResponse(AuthUser user) {
        Object profile = null;
        if (user.getProfileData() != null && !user.getProfileData().isBlank()) {
            try {
                profile = objectMapper.readValue(user.getProfileData(), Object.class);
            } catch (Exception ignored) {
                logger.warn("Could not parse stored profileData for user {}", user.getEmail());
            }
        }
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .verified(user.isVerified())
                .roles(user.getRoles())
                .profileData(profile)
                .build();
    }

    private String tokenIdOf(Authentication authentication) {
        if (Objects.nonNull(authentication) && authentication.getCredentials() instanceof String tokenId) {
            return tokenId;
        }
        return null;
    }
}
