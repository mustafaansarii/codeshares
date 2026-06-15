package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponseDto {
    private String status;
    private String message;
    private Integer code;

    @JsonProperty("timestamp")
    private Instant timestamp;

    public ErrorResponseDto(String message, Integer code) {
        this.status = "error";
        this.message = message;
        this.code = code;
        this.timestamp = Instant.now();
    }
}
