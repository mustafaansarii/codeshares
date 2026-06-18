package com.codeshare.controller;

import com.codeshare.dto.ApiResponse;
import com.codeshare.dto.file.CreateFileRequest;
import com.codeshare.dto.file.FileListResponse;
import com.codeshare.dto.file.FileResponse;
import com.codeshare.dto.file.FileShareResponse;
import com.codeshare.dto.file.ShareRequest;
import com.codeshare.dto.file.UpdateContentRequest;
import com.codeshare.dto.file.UpdateFileRequest;
import com.codeshare.service.CodeFileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class CodeFileController {

    private final CodeFileService codeFileService;

    @PostMapping
    public ResponseEntity<ApiResponse<FileResponse>> create(
            Authentication auth, @Valid @RequestBody CreateFileRequest request) {
        FileResponse response = codeFileService.create(auth.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response, "File created"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<FileListResponse>> list(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(codeFileService.listForUser(auth.getName())));
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<ApiResponse<FileResponse>> get(Authentication auth, @PathVariable String fileId) {
        return ResponseEntity.ok(ApiResponse.success(codeFileService.get(fileId, auth.getName())));
    }

    @PutMapping("/{fileId}")
    public ResponseEntity<ApiResponse<FileResponse>> updateContent(
            Authentication auth, @PathVariable String fileId, @RequestBody UpdateContentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                codeFileService.updateContent(fileId, auth.getName(), request.content()), "Saved"));
    }

    @PatchMapping("/{fileId}")
    public ResponseEntity<ApiResponse<FileResponse>> updateMeta(
            Authentication auth, @PathVariable String fileId, @RequestBody UpdateFileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                codeFileService.updateMeta(fileId, auth.getName(), request), "File updated"));
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication auth, @PathVariable String fileId) {
        codeFileService.delete(fileId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "File deleted"));
    }

    @PostMapping("/{fileId}/shares")
    public ResponseEntity<ApiResponse<List<FileShareResponse>>> addShare(
            Authentication auth, @PathVariable String fileId, @Valid @RequestBody ShareRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                codeFileService.addShare(fileId, auth.getName(), request), "Shared"));
    }

    @DeleteMapping("/{fileId}/shares/{email}")
    public ResponseEntity<ApiResponse<List<FileShareResponse>>> removeShare(
            Authentication auth, @PathVariable String fileId, @PathVariable String email) {
        return ResponseEntity.ok(ApiResponse.success(
                codeFileService.removeShare(fileId, auth.getName(), email), "Share removed"));
    }
}
