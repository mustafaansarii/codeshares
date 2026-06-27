package com.codeshare.service;

import com.codeshare.dto.CodeRunRequestForm;
import com.codeshare.dto.ExecutionResult;
import com.codeshare.dto.ProblemRequestDto;
import com.codeshare.dto.ProblemResponseDto;
import com.codeshare.dto.PaginatedResponse;
import com.codeshare.dto.ProblemFilterRequestDto;
import com.codeshare.dto.TestCaseDto;
import com.codeshare.dto.TestCaseResultDto;
import com.codeshare.dto.ValidateRequest;
import com.codeshare.dto.ValidateResponseDto;
import com.codeshare.entity.Problem;
import com.codeshare.entity.TestCase;
import com.codeshare.repository.ProblemRepository;
import com.codeshare.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final CodeExecutionService codeExecutionService;

    public ValidateResponseDto validateSolution(ValidateRequest request) {
        List<TestCaseResultDto> results = new ArrayList<>();
        int passed = 0;

        for (TestCaseDto tc : request.getTestCases()) {
            CodeRunRequestForm form = CodeRunRequestForm.builder()
                    .code(request.getCode())
                    .language(request.getLanguage())
                    .input(tc.getInputData())
                    .timeLimit(15000)
                    .build();

            ExecutionResult result =
                    codeExecutionService.executeForComparison(form, tc.getExpectedOutput());

            String status;
            if (result.timedOut()) {
                status = "TIMEOUT";
            } else if (result.exitCode() != 0) {
                status = "RUNTIME_ERROR";
            } else {
                status = UserSolutionService.outputsMatch(result.stdout(), tc.getExpectedOutput())
                        ? "PASSED" : "WRONG_ANSWER";
            }
            if ("PASSED".equals(status)) {
                passed++;
            }

            results.add(TestCaseResultDto.builder()
                    .status(status)
                    .expectedOutput(tc.getExpectedOutput())
                    .actualOutput(result.stdout())
                    .errorMessage(result.stderr())
                    .executionTimeMs(result.durationMs())
                    .build());
        }

        int total = request.getTestCases().size();
        return ValidateResponseDto.builder()
                .passedTestCases(passed)
                .totalTestCases(total)
                .allPassed(passed == total && total > 0)
                .testResults(results)
                .build();
    }

    @Transactional
    public ProblemResponseDto createProblem(ProblemRequestDto requestDto) {
        Problem problem = new Problem();
        mapRequestToEntity(requestDto, problem);
        Problem savedProblem = problemRepository.save(problem);
        saveTestCases(requestDto, savedProblem);
        return mapToResponseDto(savedProblem);
    }

    public ProblemResponseDto getProblemById(Long problemId) {
        Problem problem = getProblemOrThrow(problemId);
        return mapToResponseDto(problem);
    }

    public PaginatedResponse<ProblemResponseDto> getAllProblems(ProblemFilterRequestDto filterDto) {
        return searchProblems(filterDto.getKeyword(), filterDto.getSheetName(),
                filterDto.getPage(), filterDto.getSize());
    }

    private PaginatedResponse<ProblemResponseDto> searchProblems(String keyword, String sheetName, int page, int size) {
        // Never pass null — '%' wildcard catches all; '' skips the sheet filter via ':sn = '''' check
        String kw = (keyword == null || keyword.isBlank()) ? "%" : "%" + keyword.trim().toLowerCase() + "%";
        String sn = (sheetName == null || sheetName.isBlank()) ? "" : sheetName.trim().toLowerCase();

        Page<Problem> result = problemRepository.search(kw, sn, PageRequest.of(page, size));
        
        List<ProblemResponseDto> content = result.getContent().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
        return PaginatedResponse.<ProblemResponseDto>builder()
                .status("success")
                .data(content)
                .count(content.size())
                .totalItems(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .page(result.getNumber())
                .pageSize(result.getSize())
                .code(200)
                .build();
    }

    @Transactional
    public ProblemResponseDto updateProblem(Long problemId, ProblemRequestDto requestDto) {
        Problem problem = getProblemOrThrow(problemId);
        mapRequestToEntity(requestDto, problem);
        updateTestCases(requestDto, problem);
        Problem updatedProblem = problemRepository.save(problem);
        return mapToResponseDto(updatedProblem);
    }

    @Transactional
    public void deleteProblem(Long problemId) {
        Problem problem = getProblemOrThrow(problemId);
        problemRepository.delete(problem);
    }



    private Problem getProblemOrThrow(Long problemId) {
        return problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + problemId));
    }

    private void mapRequestToEntity(ProblemRequestDto requestDto, Problem problem) {
        problem.setTitle(requestDto.getTitle());
        problem.setDifficulty(requestDto.getDifficulty());
        problem.setDescription(requestDto.getDescription());
        problem.setConstraints(requestDto.getConstraints());
        problem.setTimeLimit(requestDto.getTimeLimit());
        problem.setMemoryLimit(requestDto.getMemoryLimit());
        problem.setSheetName(requestDto.getSheetName());
    }

    private void saveTestCases(ProblemRequestDto requestDto, Problem problem) {
        if (requestDto.getTestCases() == null || requestDto.getTestCases().isEmpty()) {
            return;
        }

        List<TestCase> testCases = requestDto.getTestCases().stream()
                .map(tcDto -> createTestCaseEntity(tcDto, problem))
                .collect(Collectors.toList());

        List<TestCase> savedTestCases = testCaseRepository.saveAll(testCases);
        problem.setTestCases(savedTestCases);
    }

    private void updateTestCases(ProblemRequestDto requestDto, Problem problem) {
        if (requestDto.getTestCases() == null) {
            return;
        }

        testCaseRepository.deleteAll(problem.getTestCases());
        problem.getTestCases().clear();
        saveTestCases(requestDto, problem);
    }

    private TestCase createTestCaseEntity(TestCaseDto tcDto, Problem problem) {
        TestCase testCase = new TestCase();
        testCase.setProblem(problem);
        testCase.setInputData(tcDto.getInputData());
        testCase.setExpectedOutput(tcDto.getExpectedOutput());
        testCase.setIsSample(tcDto.getIsSample() != null ? tcDto.getIsSample() : false);
        testCase.setWeight(tcDto.getWeight() != null ? tcDto.getWeight() : 1);
        return testCase;
    }

    private ProblemResponseDto mapToResponseDto(Problem problem) {
        ProblemResponseDto dto = new ProblemResponseDto();
        dto.setId(problem.getId());
        dto.setTitle(problem.getTitle());
        dto.setDifficulty(problem.getDifficulty());
        dto.setDescription(problem.getDescription());
        dto.setConstraints(problem.getConstraints());
        dto.setTimeLimit(problem.getTimeLimit());
        dto.setMemoryLimit(problem.getMemoryLimit());
        dto.setSheetName(problem.getSheetName());
        dto.setCreatedAt(problem.getCreatedAt());
        dto.setUpdatedAt(problem.getUpdatedAt());
        dto.setTestCases(mapTestCasesToDtoList(problem.getTestCases()));
        return dto;
    }

    private List<TestCaseDto> mapTestCasesToDtoList(List<TestCase> testCases) {
        if (testCases == null) {
            return List.of();
        }
        return testCases.stream()
                .map(this::mapTestCaseToDto)
                .collect(Collectors.toList());
    }

    private TestCaseDto mapTestCaseToDto(TestCase testCase) {
        return new TestCaseDto(
                testCase.getId(),
                testCase.getInputData(),
                testCase.getExpectedOutput(),
                testCase.getIsSample(),
                testCase.getWeight()
        );
    }
}
