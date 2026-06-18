package com.codeshare.dto.file;

import com.codeshare.entity.CodeFileShare;
import com.fasterxml.jackson.annotation.JsonProperty;

public record FileShareResponse(
        @JsonProperty("email") String email,
        @JsonProperty("access") String access
) {
    public static FileShareResponse from(CodeFileShare share) {
        return new FileShareResponse(share.getEmail(), share.getAccess().name());
    }
}
