package com.codeshare.dto.file;

import com.codeshare.dto.constants.FileAccess;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ShareRequest(
        @NotBlank @Email @JsonProperty("email") String email,
        @NotNull @JsonProperty("access") FileAccess access
) {
}
