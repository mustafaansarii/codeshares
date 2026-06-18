package com.codeshare.dto.collab;

import com.codeshare.entity.CollabSession;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CollabSessionResponse(
        @JsonProperty("session_id") String sessionId,
        @JsonProperty("problem_id") Long problemId,
        @JsonProperty("language") String language,
        @JsonProperty("owner_email") String ownerEmail
) {
    public static CollabSessionResponse from(CollabSession entity) {
        return new CollabSessionResponse(
                entity.getSessionId(),
                entity.getProblemId(),
                entity.getLanguage(),
                entity.getOwnerEmail()
        );
    }
}
