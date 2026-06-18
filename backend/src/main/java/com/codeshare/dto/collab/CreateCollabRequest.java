package com.codeshare.dto.collab;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public record CreateCollabRequest(
        @NotNull @JsonProperty("problem_id") Long problemId,
        @JsonProperty("language") String language
) {
}
