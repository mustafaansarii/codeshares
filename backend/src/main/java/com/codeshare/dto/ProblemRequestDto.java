package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemRequestDto {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @NotBlank(message = "Description is required")
    private String description;

    private String constraints;

    @JsonProperty("time_limit")
    private Integer timeLimit;

    @JsonProperty("memory_limit")
    private Integer memoryLimit;

    @JsonProperty("sheet_name")
    private String sheetName;

    /** Per-language visible helper snippet shown in the editor. */
    @JsonProperty("starter_code")
    private java.util.Map<String, String> starterCode;

    @NotEmpty(message = "At least one test case is required")
    @Valid
    private List<TestCaseDto> testCases;
}
