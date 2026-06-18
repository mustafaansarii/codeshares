package com.codeshare.dto.file;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record FileListResponse(
        @JsonProperty("owned") List<FileResponse> owned,
        @JsonProperty("shared") List<FileResponse> shared
) {
}
