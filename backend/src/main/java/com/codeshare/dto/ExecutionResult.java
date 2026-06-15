package com.codeshare.dto;

import lombok.Builder;

@Builder
public record ExecutionResult(
        int exitCode,
        String stdout,
        String stderr,
        int durationMs,
        boolean timedOut
) { }
