package com.codeshare.dto.file;

import com.codeshare.dto.constants.FileAccess;
import com.codeshare.entity.CodeFile;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;

/**
 * Unified file payload. For list views {@code content} and {@code shares} are omitted;
 * for the detail view they are populated ({@code shares} only when the requester is the owner).
 */
public record FileResponse(
        @JsonProperty("file_id") String fileId,
        @JsonProperty("name") String name,
        @JsonProperty("language") String language,
        @JsonProperty("content") String content,
        @JsonProperty("visibility") String visibility,
        @JsonProperty("owner_email") String ownerEmail,
        @JsonProperty("access") String access,
        @JsonProperty("shares") List<FileShareResponse> shares,
        @JsonProperty("updated_at") Instant updatedAt
) {
    public static FileResponse summary(CodeFile file, FileAccess access) {
        return new FileResponse(
                file.getFileId(), file.getName(), file.getLanguage(), null,
                file.getVisibility().name(), file.getOwnerEmail(), access.name(), null,
                file.getUpdatedAt());
    }

    public static FileResponse detail(CodeFile file, FileAccess access, List<FileShareResponse> shares) {
        return new FileResponse(
                file.getFileId(), file.getName(), file.getLanguage(), file.getContent(),
                file.getVisibility().name(), file.getOwnerEmail(), access.name(), shares,
                file.getUpdatedAt());
    }
}
