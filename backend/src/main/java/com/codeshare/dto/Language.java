package com.codeshare.dto;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public enum Language {
    JAVA("java", "Main.java", true, 
         List.of("javac", "Main.java"),
         List.of("java", "Main")),

    C("c", "main.c", true,
      List.of("gcc", "main.c", "-O2", "-std=c17", "-o", "main.out"),
      List.of("./main.out")),

    CPP("cpp", "main.cpp", true,
        List.of("g++", "main.cpp", "-O2", "-std=c++17", "-o", "main.out"),
        List.of("./main.out")),

    PYTHON("python", "main.py", false,
           List.of(),
           List.of("python3", "main.py")),

    NODE("node", "main.js", false,
         List.of(),
         List.of("node", "main.js"));

    private final String name;
    private final String sourceFileName;
    private final boolean needsCompilation;
    private final List<String> compileCommand;
    private final List<String> runCommand;

    Language(String name, String sourceFileName, boolean needsCompilation,
             List<String> compileCommand, List<String> runCommand) {
        this.name = name;
        this.sourceFileName = sourceFileName;
        this.needsCompilation = needsCompilation;
        this.compileCommand = compileCommand;
        this.runCommand = runCommand;
    }

    public String getName() {
        return name;
    }

    public String getSourceFileName() {
        return sourceFileName;
    }

    public boolean needsCompilation() {
        return needsCompilation;
    }

    public List<String> getCompileCommand() {
        return compileCommand;
    }

    public List<String> getRunCommand() {
        return runCommand;
    }

    public static Optional<Language> fromString(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }

        String normalized = value.toLowerCase(Locale.ROOT).trim();
        return switch (normalized) {
            case "java" -> Optional.of(JAVA);
            case "c" -> Optional.of(C);
            case "c++", "cpp" -> Optional.of(CPP);
            case "python", "python3", "py" -> Optional.of(PYTHON);
            case "javascript", "js", "node", "nodejs" -> Optional.of(NODE);
            default -> Optional.empty();
        };
    }

    public static boolean isSupported(String language) {
        return fromString(language).isPresent();
    }

    public static Language getOrThrow(String language) {
        return fromString(language)
                .orElseThrow(() -> new IllegalArgumentException("Unsupported language: " + language));
    }

    @Override
    public String toString() {
        return name;
    }
}
