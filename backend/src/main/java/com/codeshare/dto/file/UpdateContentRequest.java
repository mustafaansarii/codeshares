package com.codeshare.dto.file;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateContentRequest(
        @JsonProperty("content") String content
) {
}
