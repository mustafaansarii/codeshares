package com.codeshare.dto.file;

import com.codeshare.dto.constants.FileVisibility;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record CreateFileRequest(
        @NotBlank @JsonProperty("name") String name,
        @NotBlank @JsonProperty("language") String language,
        @JsonProperty("content") String content,
        @JsonProperty("visibility") FileVisibility visibility
) {
}
