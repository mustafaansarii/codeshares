package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeRunResponseForm {
    private String status;
    private String stdout;
    private String stderr;

    @JsonProperty("exit_code")
    private int exitCode;

    @JsonProperty("execution_time_ms")
    private int executionTimeMs;

    @JsonProperty("memory_used")
    private int memoryUsed;
}
