package com.codeshare.controller;

import com.codeshare.dto.ApiResponse;
import com.codeshare.dto.CodeRunRequestForm;
import com.codeshare.dto.CodeRunResponseForm;
import com.codeshare.dto.UserSolutionRequestDto;
import com.codeshare.dto.UserSolutionResponseDto;
import com.codeshare.entity.AuthUser;
import com.codeshare.service.CodeExecutionService;
import com.codeshare.service.UserSolutionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CodeRunController {

    private final CodeExecutionService codeExecutionService;
    private final UserSolutionService userSolutionService;

    @PostMapping("/run")
    public ResponseEntity<ApiResponse<CodeRunResponseForm>> runCode(
            @Valid @RequestBody CodeRunRequestForm request,
            HttpServletRequest httpRequest) {

        Long userId = (Long) httpRequest.getAttribute("userId");
        CodeRunResponseForm result = codeExecutionService.execute(request);

        log.info("Code execution: user={}, language={}, status={}",
                userId, request.getLanguage(), result.getStatus());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/problems/run")
    public ResponseEntity<ApiResponse<UserSolutionResponseDto>> runSampleTestCases(
            @Valid @RequestBody UserSolutionRequestDto request,
            HttpServletRequest httpRequest) {

        AuthUser user = (AuthUser) httpRequest.getAttribute("user");
        UserSolutionResponseDto result = userSolutionService.runSampleTestCases(user, request);

        log.info("Sample test execution: user={}, problem={}, status={}, passed={}/{}",
                user.getId(), request.getProblemId(), result.getStatus(),
                result.getPassedTestCases(), result.getTotalTestCases());

        return ResponseEntity.ok(ApiResponse.success(result, "Sample test cases executed"));
    }

    @PostMapping("/problems/submit")
    public ResponseEntity<ApiResponse<UserSolutionResponseDto>> submitSolution(
            @Valid @RequestBody UserSolutionRequestDto request,
            HttpServletRequest httpRequest) {

        AuthUser user = (AuthUser) httpRequest.getAttribute("user");
        UserSolutionResponseDto result = userSolutionService.submitSolution(user, request);

        log.info("Solution submitted: user={}, problem={}, status={}, accuracy={}%",
                user.getId(), request.getProblemId(), result.getStatus(), 
                String.format("%.2f", result.getAccuracy()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Solution submitted and evaluated"));
    }

    @PostMapping("/problems/user-solution")
    public ResponseEntity<ApiResponse<UserSolutionResponseDto>> getUserSolution(
            @Valid @RequestBody UserSolutionRequestDto request,
            HttpServletRequest httpRequest) {

        AuthUser user = (AuthUser) httpRequest.getAttribute("user");
        UserSolutionResponseDto result = userSolutionService.getUserSolution(user.getId(), request.getProblemId());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /** Current user's attempted/solved status across all problems. */
    @GetMapping("/problems/progress")
    public ResponseEntity<ApiResponse<java.util.List<com.codeshare.dto.ProblemProgressDto>>> progress(
            HttpServletRequest httpRequest) {
        AuthUser user = (AuthUser) httpRequest.getAttribute("user");
        return ResponseEntity.ok(ApiResponse.success(userSolutionService.getProgress(user.getId())));
    }
}
