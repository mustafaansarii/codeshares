package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateResponseDto {

    @JsonProperty("passed_test_cases")
    private int passedTestCases;

    @JsonProperty("total_test_cases")
    private int totalTestCases;

    @JsonProperty("all_passed")
    private boolean allPassed;

    @JsonProperty("test_results")
    private List<TestCaseResultDto> testResults;
}
