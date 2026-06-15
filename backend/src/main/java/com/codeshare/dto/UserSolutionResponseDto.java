package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSolutionResponseDto {
    private Long id;

    @JsonProperty("problem_id")
    private Long problemId;

    private String code;
    private String language;
    private String status;

    @JsonProperty("total_test_cases")
    private int totalTestCases;

    @JsonProperty("passed_test_cases")
    private int passedTestCases;

    @JsonProperty("failed_test_cases")
    private int failedTestCases;

    @JsonProperty("execution_time_ms")
    private int executionTimeMs;

    @JsonProperty("memory_used_mb")
    private int memoryUsedMb;

    @JsonProperty("last_error")
    private String lastError;

    private double accuracy;
    private boolean solved;

    @JsonProperty("test_results")
    private List<TestCaseResultDto> testResults;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;
}
