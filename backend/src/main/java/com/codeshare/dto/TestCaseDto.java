package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseDto {
    private Long id;

    @JsonProperty("input_data")
    private String inputData;

    @JsonProperty("expected_output")
    private String expectedOutput;

    @JsonProperty("is_sample")
    private Boolean isSample;

    private Integer weight;
}
