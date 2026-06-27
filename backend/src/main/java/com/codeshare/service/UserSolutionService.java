package com.codeshare.service;

import com.codeshare.dto.TestCaseResultDto;
import com.codeshare.dto.UserSolutionRequestDto;
import com.codeshare.dto.UserSolutionResponseDto;
import com.codeshare.dto.CodeRunRequestForm;
import com.codeshare.entity.AuthUser;
import com.codeshare.entity.Problem;
import com.codeshare.entity.TestCase;
import com.codeshare.entity.TestCaseExecution;
import com.codeshare.entity.UserSolution;
import com.codeshare.repository.ProblemRepository;
import com.codeshare.repository.TestCaseExecutionRepository;
import com.codeshare.repository.TestCaseRepository;
import com.codeshare.repository.UserSolutionRepository;
import com.codeshare.dto.ExecutionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserSolutionService {

    private final UserSolutionRepository solutionRepository;
    private final TestCaseExecutionRepository executionRepository;
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final CodeExecutionService codeExecutionService;

    @Transactional
    public UserSolutionResponseDto runSampleTestCases(
            AuthUser user, UserSolutionRequestDto requestDto) {

        Problem problem = getProblemOrThrow(requestDto.getProblemId());
        UserSolution solution = findOrCreateSolution(user, problem, requestDto);

        List<TestCase> sampleTestCases = testCaseRepository.findByProblemId(problem.getId())
                .stream()
                .filter(TestCase::getIsSample)
                .limit(3)                          // Run shows only first 3 samples
                .collect(Collectors.toList());

        return executeTestCases(solution, sampleTestCases, problem);
    }

    @Transactional
    public UserSolutionResponseDto submitSolution(
            AuthUser user, UserSolutionRequestDto requestDto) {

        Problem problem = getProblemOrThrow(requestDto.getProblemId());
        UserSolution solution = findOrCreateSolution(user, problem, requestDto);

        List<TestCase> allTestCases = testCaseRepository.findByProblemId(problem.getId());

        UserSolutionResponseDto response = executeTestCases(solution, allTestCases, problem);
        solution.setStatus(getSolutionStatus(solution));
        solutionRepository.save(solution);

        return response;
    }

    public UserSolutionResponseDto getUserSolution(Long userId, Long problemId) {
        UserSolution solution = solutionRepository.findByUserIdAndProblemId(userId, problemId)
                .orElseThrow(() -> new RuntimeException("Solution not found"));

        List<TestCaseExecution> executions = executionRepository.findBySolutionId(solution.getId());

        return mapToResponseDto(solution, executions);
    }

// ============== Private Helper Methods ==============

    private Problem getProblemOrThrow(Long problemId) {
        return problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + problemId));
    }

    private UserSolution findOrCreateSolution(AuthUser user, Problem problem, UserSolutionRequestDto requestDto) {
        UserSolution solution = solutionRepository.findByUserIdAndProblemId(user.getId(), problem.getId())
                .orElse(new UserSolution());

        solution.setUser(user);
        solution.setProblem(problem);
        solution.setCode(requestDto.getCode());
        solution.setLanguage(requestDto.getLanguage());
        solution.setStatus("RUNNING");

        // Must be persisted NOW so TestCaseExecution FK references a real ID.
        return solutionRepository.save(solution);
    }

    private UserSolutionResponseDto executeTestCases(UserSolution solution, List<TestCase> testCases, Problem problem) {
        clearPreviousExecutions(solution);

        int passedCount = 0;
        int totalTime = 0;

        for (TestCase testCase : testCases) {
            ExecutionResult result = executeTestCase(solution, testCase, problem);
            TestCaseExecution execution = saveTestCaseExecution(solution, testCase, result);

            if (execution.isPassed()) {
                passedCount++;
            }
            totalTime += execution.getExecutionTimeMs();
        }

        updateSolutionStats(solution, testCases.size(), passedCount, totalTime);
        solutionRepository.save(solution);

        List<TestCaseExecution> executions = executionRepository.findBySolutionId(solution.getId());
        return mapToResponseDto(solution, executions);
    }

    private ExecutionResult executeTestCase(UserSolution solution, TestCase testCase, Problem problem) {
        CodeRunRequestForm request = CodeRunRequestForm.builder()
                .code(solution.getCode())
                .language(solution.getLanguage())
                .input(testCase.getInputData())
                .timeLimit(problem.getTimeLimit() > 0 ? problem.getTimeLimit() : 5000)
                .build();

        return codeExecutionService.executeForComparison(request, testCase.getExpectedOutput());
    }

    private TestCaseExecution saveTestCaseExecution(UserSolution solution, TestCase testCase, ExecutionResult result) {
        TestCaseExecution execution = new TestCaseExecution();
        execution.setSolution(solution);
        execution.setTestCase(testCase);
        execution.setStatus(getExecutionStatus(result, testCase.getExpectedOutput()));
        execution.setActualOutput(result.stdout());
        execution.setExpectedOutput(testCase.getExpectedOutput());
        execution.setErrorMessage(result.stderr());
        execution.setExecutionTimeMs(result.durationMs());

        return executionRepository.save(execution);
    }

    private String getExecutionStatus(ExecutionResult result, String expectedOutput) {
        if (result.timedOut()) {
            return "TIMEOUT";
        }
        if (result.exitCode() != 0) {
            return "RUNTIME_ERROR";
        }
        // A run only PASSES when its output actually matches the expected output.
        return outputsMatch(result.stdout(), expectedOutput) ? "PASSED" : "WRONG_ANSWER";
    }

    /** Lenient comparison: ignores trailing whitespace on each line and surrounding blank lines. */
    static boolean outputsMatch(String actual, String expected) {
        return normalizeOutput(actual).equals(normalizeOutput(expected));
    }

    private static String normalizeOutput(String value) {
        if (value == null) {
            return "";
        }
        String[] lines = value.replace("\r\n", "\n").split("\n", -1);
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            sb.append(line.stripTrailing()).append('\n');
        }
        return sb.toString().strip();
    }

    private void updateSolutionStats(UserSolution solution, int totalTests, int passedTests, int totalTime) {
        solution.setTotalTestCases(totalTests);
        solution.setPassedTestCases(passedTests);
        solution.setFailedTestCases(totalTests - passedTests);
        solution.setExecutionTimeMs(totalTime);
    }

    private String getSolutionStatus(UserSolution solution) {
        if (solution.getFailedTestCases() == 0 && solution.getPassedTestCases() > 0) {
            return "ACCEPTED";
        }
        if (solution.getFailedTestCases() > 0) {
            return "WRONG_ANSWER";
        }
        return "SUBMITTED";
    }

    private void clearPreviousExecutions(UserSolution solution) {
        List<TestCaseExecution> previous = executionRepository.findBySolutionId(solution.getId());
        if (!previous.isEmpty()) {
            executionRepository.deleteAll(previous);
        }
    }

    private UserSolutionResponseDto mapToResponseDto(UserSolution solution, List<TestCaseExecution> executions) {
        List<TestCaseResultDto> testResults = executions.stream()
                .map(this::mapTestCaseExecutionToDto)
                .collect(Collectors.toList());

        return UserSolutionResponseDto.builder()
                .id(solution.getId())
                .problemId(solution.getProblem().getId())
                .code(solution.getCode())
                .language(solution.getLanguage())
                .status(solution.getStatus())
                .totalTestCases(solution.getTotalTestCases())
                .passedTestCases(solution.getPassedTestCases())
                .failedTestCases(solution.getFailedTestCases())
                .executionTimeMs(solution.getExecutionTimeMs())
                .memoryUsedMb(solution.getMemoryUsedMb())
                .lastError(solution.getLastError())
                .accuracy(solution.getAccuracy())
                .solved(solution.isSolved())
                .testResults(testResults)
                .createdAt(solution.getCreatedAt())
                .updatedAt(solution.getUpdatedAt())
                .build();
    }

    private TestCaseResultDto mapTestCaseExecutionToDto(TestCaseExecution execution) {
        return TestCaseResultDto.builder()
                .testCaseId(execution.getTestCase().getId())
                .status(execution.getStatus())
                .expectedOutput(execution.getExpectedOutput())
                .actualOutput(execution.getActualOutput())
                .errorMessage(execution.getErrorMessage())
                .executionTimeMs(execution.getExecutionTimeMs())
                .memoryUsedMb(execution.getMemoryUsedMb())
                .build();
    }
}
