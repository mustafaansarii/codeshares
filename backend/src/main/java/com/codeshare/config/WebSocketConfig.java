package com.codeshare.config;

import com.codeshare.websocket.CollabHandshakeInterceptor;
import com.codeshare.websocket.CollabWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.util.Arrays;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final CollabWebSocketHandler collabWebSocketHandler;
    private final CollabHandshakeInterceptor collabHandshakeInterceptor;
    private final AppProperties appProperties;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        String[] origins = Arrays.stream(appProperties.getCorsAllowedOrigins().split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);

        registry.addHandler(collabWebSocketHandler, "/ws/collab")
                .addInterceptors(collabHandshakeInterceptor)
                .setAllowedOriginPatterns(origins.length > 0 ? origins : new String[]{"*"});
    }
}
