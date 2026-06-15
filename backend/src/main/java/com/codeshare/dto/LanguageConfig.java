package com.codeshare.dto;

import java.util.List;

public record LanguageConfig(
        String language,
        String sourceFileName,
        String extension,
        List<String> compileCommand,
        List<String> runCommand,
        boolean needsCompilation
) { }
