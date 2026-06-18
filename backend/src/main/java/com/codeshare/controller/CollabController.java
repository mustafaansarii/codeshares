package com.codeshare.controller;

import com.codeshare.dto.ApiResponse;
import com.codeshare.dto.collab.CollabSessionResponse;
import com.codeshare.dto.collab.CreateCollabRequest;
import com.codeshare.dto.collab.WsTicketResponse;
import com.codeshare.security.JwtService;
import com.codeshare.service.CollabService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/collab")
@RequiredArgsConstructor
public class CollabController {

    private final CollabService collabService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ApiResponse<CollabSessionResponse>> createSession(
            Authentication authentication, @Valid @RequestBody CreateCollabRequest request) {
        CollabSessionResponse response = collabService.createSession(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Collab session created"));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<CollabSessionResponse>> getSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(ApiResponse.success(collabService.getSession(sessionId)));
    }

    /**
     * Mints a short-lived ticket the client uses to authenticate the collab WebSocket,
     * which connects directly to the backend (Vercel can't proxy WS, so the auth cookie
     * is unavailable on that connection).
     */
    @GetMapping("/ws-ticket")
    public ResponseEntity<ApiResponse<WsTicketResponse>> wsTicket(Authentication authentication) {
        String ticket = jwtService.generateTicket(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(new WsTicketResponse(ticket)));
    }
}
