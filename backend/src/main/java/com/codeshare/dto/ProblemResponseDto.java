package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemResponseDto {
    private Long id;
    private String title;
    private String difficulty;
    private String description;
    private String constraints;

    @JsonProperty("time_limit")
    private Integer timeLimit;

    @JsonProperty("memory_limit")
    private Integer memoryLimit;

    @JsonProperty("sheet_name")
    private String sheetName;

    @JsonProperty("test_cases")
    private List<TestCaseDto> testCases;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;
}
