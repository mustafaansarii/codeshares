package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Admin pre-save check: run a reference solution against candidate test cases. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateRequest {

    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Language is required")
    private String language;

    @NotEmpty(message = "At least one test case is required")
    @Valid
    @JsonProperty("test_cases")
    private List<TestCaseDto> testCases;
}
