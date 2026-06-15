package com.codeshare.service;

import com.codeshare.dto.CodeRunRequestForm;
import com.codeshare.dto.CodeRunResponseForm;
import com.codeshare.exception.CodeExecutionException;
import com.codeshare.exception.UnsupportedLanguageException;
import com.codeshare.dto.ExecutionResult;
import com.codeshare.dto.Language;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class CodeExecutionService {

    private static final int DEFAULT_TIME_LIMIT_MS = 5000;
    private static final int MAX_TIME_LIMIT_MS = 15000;
    private static final int MAX_OUTPUT_SIZE = 32 * 1024;

    public CodeRunResponseForm execute(CodeRunRequestForm request) {
        try {
            validateRequest(request);
            Language language = parseLanguage(request.getLanguage());
            int timeLimitMs = validateAndClampTimeLimit(request.getTimeLimit());

            Path tempDir = Files.createTempDirectory("code-run-");
            try {
                return executeWithTemporaryDirectory(request, language, timeLimitMs, tempDir);
            } finally {
                deleteRecursively(tempDir);
            }
        } catch (UnsupportedLanguageException e) {
            return buildErrorResponse(e.getMessage(), -1, 0);
        } catch (CodeExecutionException e) {
            return buildErrorResponse(e.getMessage(), -1, 0);
        } catch (IOException e) {
            return buildErrorResponse("Execution failed: " + e.getMessage(), -1, 0);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return buildErrorResponse("Execution interrupted", -1, 0);
        }
    }

    public ExecutionResult executeForComparison(CodeRunRequestForm request, String expectedOutput) {
        try {
            validateRequest(request);
            Language language = parseLanguage(request.getLanguage());
            int timeLimitMs = validateAndClampTimeLimit(request.getTimeLimit());

            Path tempDir = Files.createTempDirectory("code-run-");
            try {
                Path sourceFile = writeSourceFile(tempDir, language, request.getCode());
                ExecutionResult compileResult = compileIfNeeded(language, sourceFile, timeLimitMs);

                if (compileResult != null && isCompilationFailed(compileResult)) {
                    return compileResult;
                }

                int remainingTimeMs = calculateRemainingTime(timeLimitMs, compileResult);
                return executeProgram(language, tempDir, request.getInput(), remainingTimeMs);
            } finally {
                deleteRecursively(tempDir);
            }
        } catch (IOException e) {
            return ExecutionResult.builder()
                    .exitCode(-1)
                    .stdout("")
                    .stderr("Execution failed: " + e.getMessage())
                    .durationMs(0)
                    .timedOut(false)
                    .build();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ExecutionResult.builder()
                    .exitCode(-1)
                    .stdout("")
                    .stderr("Execution interrupted")
                    .durationMs(0)
                    .timedOut(false)
                    .build();
        }
    }

// ============== Main Execution Logic ==============

    private CodeRunResponseForm executeWithTemporaryDirectory(
            CodeRunRequestForm request, Language language, int timeLimitMs, Path tempDir)
            throws IOException, InterruptedException {

        Path sourceFile = writeSourceFile(tempDir, language, request.getCode());
        ExecutionResult compileResult = compileIfNeeded(language, sourceFile, timeLimitMs);

        if (compileResult != null && isCompilationFailed(compileResult)) {
            return buildCompilationErrorResponse(compileResult);
        }

        int remainingTimeMs = calculateRemainingTime(timeLimitMs, compileResult);
        ExecutionResult runResult = executeProgram(language, tempDir, request.getInput(), remainingTimeMs);

        return buildSuccessResponse(compileResult, runResult);
    }

// ============== Validation ==============

    private void validateRequest(CodeRunRequestForm request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new CodeExecutionException("Code is required");
        }
        if (request.getLanguage() == null || request.getLanguage().isBlank()) {
            throw new CodeExecutionException("Language is required");
        }
    }

    private int validateAndClampTimeLimit(int timeLimit) {
        return clamp(
                timeLimit > 0 ? timeLimit : DEFAULT_TIME_LIMIT_MS,
                1_000,
                MAX_TIME_LIMIT_MS
        );
    }

// ============== Language & Build Commands ==============

    private Language parseLanguage(String languageStr) {
        return Language.fromString(languageStr)
                .orElseThrow(() -> new UnsupportedLanguageException(languageStr));
    }

    private Path writeSourceFile(Path dir, Language language, String code) throws IOException {
        Path file = dir.resolve(language.getSourceFileName());
        Files.writeString(file, code, StandardCharsets.UTF_8);
        return file;
    }

    private List<String> buildCompileCommand(Language language, String sourceFileName) {
        List<String> cmd = new ArrayList<>(language.getCompileCommand());
        cmd.set(1, sourceFileName);
        return cmd;
    }

    private List<String> buildRunCommand(Language language) {
        return new ArrayList<>(language.getRunCommand());
    }

// ============== Execution ==============

    private ExecutionResult compileIfNeeded(Language language, Path sourceFile, int timeLimitMs)
            throws IOException, InterruptedException {
        if (!language.needsCompilation()) {
            return null;
        }

        List<String> compileCmd = buildCompileCommand(language, sourceFile.getFileName().toString());
        return runProcess(compileCmd, sourceFile.getParent(), null, timeLimitMs);
    }

    private ExecutionResult executeProgram(Language language, Path workingDir, String input, int timeLimitMs)
            throws IOException, InterruptedException {
        List<String> runCmd = buildRunCommand(language);
        return runProcess(runCmd, workingDir, input, timeLimitMs);
    }

    private ExecutionResult runProcess(List<String> command, Path workingDir, String input, int timeoutMs)
            throws IOException, InterruptedException {

        long start = System.nanoTime();
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(workingDir.toFile());
        Process process = pb.start();

        writeInputToProcess(process, input);

        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();
        Thread stdoutThread = captureStream(process.getInputStream(), stdout);
        Thread stderrThread = captureStream(process.getErrorStream(), stderr);

        boolean finished = process.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
        if (!finished) {
            process.destroyForcibly();
        }

        stdoutThread.join();
        stderrThread.join();

        int durationMs = (int) Duration.ofNanos(System.nanoTime() - start).toMillis();
        int exitCode = finished ? process.exitValue() : -1;

        return ExecutionResult.builder()
                .exitCode(exitCode)
                .stdout(stdout.toString())
                .stderr(stderr.toString())
                .durationMs(durationMs)
                .timedOut(!finished)
                .build();
    }

    private void writeInputToProcess(Process process, String input) throws IOException {
        if (input == null || input.isEmpty()) {
            process.getOutputStream().close();
            return;
        }

        try (BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8))) {
            writer.write(input);
            writer.flush();
        }
    }

    private Thread captureStream(InputStream stream, StringBuilder target) {
        Thread thread = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    target.append(line).append('\n');
                }
            } catch (IOException ignored) {
            }
        });
        thread.start();
        return thread;
    }

// ============== Response Building ==============

    private boolean isCompilationFailed(ExecutionResult result) {
        return result.timedOut() || result.exitCode() != 0;
    }

    private int calculateRemainingTime(int totalTimeMs, ExecutionResult compileResult) {
        if (compileResult == null) {
            return totalTimeMs;
        }
        return Math.max(100, totalTimeMs - compileResult.durationMs());
    }

    private CodeRunResponseForm buildCompilationErrorResponse(ExecutionResult compileResult) {
        return CodeRunResponseForm.builder()
                .status(compileResult.timedOut() ? "TIMEOUT" : "ERROR")
                .exitCode(compileResult.timedOut() ? -1 : compileResult.exitCode())
                .stdout(limitSize(compileResult.stdout(), MAX_OUTPUT_SIZE))
                .stderr(limitSize(compileResult.stderr(), MAX_OUTPUT_SIZE))
                .executionTimeMs(compileResult.durationMs())
                .memoryUsed(0)
                .build();
    }

    private CodeRunResponseForm buildSuccessResponse(ExecutionResult compileResult, ExecutionResult runResult) {
        String combinedStdout = (compileResult != null ? compileResult.stdout() : "") + runResult.stdout();
        String combinedStderr = (compileResult != null ? compileResult.stderr() : "") + runResult.stderr();
        int totalDuration = runResult.durationMs() + (compileResult != null ? compileResult.durationMs() : 0);

        String status = runResult.timedOut() ? "TIMEOUT" : (runResult.exitCode() == 0 ? "OK" : "ERROR");
        int exitCode = runResult.timedOut() ? -1 : runResult.exitCode();

        return CodeRunResponseForm.builder()
                .status(status)
                .exitCode(exitCode)
                .stdout(limitSize(combinedStdout, MAX_OUTPUT_SIZE))
                .stderr(limitSize(combinedStderr, MAX_OUTPUT_SIZE))
                .executionTimeMs(totalDuration)
                .memoryUsed(0)
                .build();
    }

    private CodeRunResponseForm buildErrorResponse(String errorMessage, int exitCode, int duration) {
        return CodeRunResponseForm.builder()
                .status("ERROR")
                .exitCode(exitCode)
                .stdout("")
                .stderr(errorMessage)
                .executionTimeMs(duration)
                .memoryUsed(0)
                .build();
    }

// ============== Utility Methods ==============

    private String limitSize(String text, int maxBytes) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        if (bytes.length <= maxBytes) {
            return text;
        }
        return new String(bytes, 0, maxBytes, StandardCharsets.UTF_8) + "\n...[truncated]...";
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private void deleteRecursively(Path root) {
        try {
            if (!Files.exists(root)) {
                return;
            }
            Files.walk(root)
                    .sorted((a, b) -> b.getNameCount() - a.getNameCount())
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                        }
                    });
        } catch (IOException e) {
            log.warn("Failed to delete temporary directory: {}", root, e);
        }
    }
}
