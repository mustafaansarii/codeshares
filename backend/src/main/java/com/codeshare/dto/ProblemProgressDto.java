package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

/** A user's status on a single problem — attempted, solved, and when. */
public record ProblemProgressDto(
        @JsonProperty("problem_id") Long problemId,
        @JsonProperty("status") String status,
        @JsonProperty("solved") boolean solved,
        @JsonProperty("attempted") boolean attempted,
        @JsonProperty("updated_at") Instant updatedAt
) {
}
