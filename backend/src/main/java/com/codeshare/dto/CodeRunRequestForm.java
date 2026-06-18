package com.codeshare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeRunRequestForm {
    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Language is required")
    private String language;

    private String input;

    private int timeLimit;

    /**
     * When true the code is compiled/run as a complete standalone program (with its own
     * {@code main}), reading {@link #input} from stdin — used by the file playground.
     * When false (default) the code is wrapped in the Solution harness for the problem flow.
     */
    private boolean raw;
}
