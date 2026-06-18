package com.codeshare.dto.file;

import com.codeshare.dto.constants.FileVisibility;
import com.fasterxml.jackson.annotation.JsonProperty;

/** Owner-only metadata update — rename, change language, or change visibility. Null fields are left unchanged. */
public record UpdateFileRequest(
        @JsonProperty("name") String name,
        @JsonProperty("language") String language,
        @JsonProperty("visibility") FileVisibility visibility
) {
}
