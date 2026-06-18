package com.codeshare.websocket;

import com.codeshare.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * Authenticates the collab WebSocket handshake using a short-lived ticket passed as a
 * query parameter ({@code ?ticket=...&session=...}). Populates session attributes that the
 * handler reads to identify the participant and the room.
 */
@Component
@RequiredArgsConstructor
public class CollabHandshakeInterceptor implements HandshakeInterceptor {

    public static final String ATTR_EMAIL = "email";
    public static final String ATTR_SESSION_ID = "sessionId";

    private final JwtService jwtService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        Map<String, List<String>> params = UriComponentsBuilder
                .fromUri(request.getURI()).build().getQueryParams();

        String ticket = firstParam(params, "ticket");
        String sessionId = firstParam(params, "session");

        if (ticket == null || sessionId == null || !jwtService.valid(ticket)) {
            return false; // 403 — reject handshake
        }

        attributes.put(ATTR_EMAIL, jwtService.getEmail(ticket));
        attributes.put(ATTR_SESSION_ID, sessionId);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }

    private String firstParam(Map<String, List<String>> params, String key) {
        List<String> values = params.get(key);
        return (values == null || values.isEmpty()) ? null : values.get(0);
    }
}
