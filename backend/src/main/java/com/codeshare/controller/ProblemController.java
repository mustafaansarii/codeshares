package com.codeshare.controller;

import com.codeshare.dto.ApiResponse;
import com.codeshare.dto.PaginatedResponse;
import com.codeshare.dto.ProblemFilterRequestDto;
import com.codeshare.dto.ProblemRequestDto;
import com.codeshare.dto.ProblemResponseDto;
import com.codeshare.dto.ValidateRequest;
import com.codeshare.dto.ValidateResponseDto;
import com.codeshare.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProblemResponseDto>> createProblem(@Valid @RequestBody ProblemRequestDto requestDto) {
        ProblemResponseDto response = problemService.createProblem(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.created(response, "Problem created successfully")
        );
    }

    /** Admin pre-save check — runs a reference solution against the candidate test cases. */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidateResponseDto>> validate(@Valid @RequestBody ValidateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(problemService.validateSolution(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProblemResponseDto>> getProblem(@PathVariable Long id) {
        ProblemResponseDto response = problemService.getProblemById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<ProblemResponseDto>> getAllProblems(
            @ModelAttribute ProblemFilterRequestDto problemFilterRequestDto) {
        return ResponseEntity.ok(problemService.getAllProblems(problemFilterRequestDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProblemResponseDto>> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemRequestDto requestDto) {
        ProblemResponseDto response = problemService.updateProblem(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response, "Problem updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Problem deleted successfully"));
    }
}
