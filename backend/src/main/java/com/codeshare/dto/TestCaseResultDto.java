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
public class TestCaseResultDto {
    private Long testCaseId;
    private String status;

    @JsonProperty("expected_output")
    private String expectedOutput;

    @JsonProperty("actual_output")
    private String actualOutput;

    @JsonProperty("error_message")
    private String errorMessage;

    @JsonProperty("execution_time_ms")
    private int executionTimeMs;

    @JsonProperty("memory_used_mb")
    private int memoryUsedMb;

    public boolean isPassed() {
        return "PASSED".equals(status);
    }
}
