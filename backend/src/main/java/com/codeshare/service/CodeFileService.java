package com.codeshare.service;

import com.codeshare.dto.constants.FileAccess;
import com.codeshare.dto.constants.FileVisibility;
import com.codeshare.dto.file.CreateFileRequest;
import com.codeshare.dto.file.FileListResponse;
import com.codeshare.dto.file.FileResponse;
import com.codeshare.dto.file.FileShareResponse;
import com.codeshare.dto.file.ShareRequest;
import com.codeshare.dto.file.UpdateFileRequest;
import com.codeshare.entity.CodeFile;
import com.codeshare.entity.CodeFileShare;
import com.codeshare.exception.ApiException;
import com.codeshare.repo.AuthUserRepository;
import com.codeshare.repo.CodeFileRepository;
import com.codeshare.repo.CodeFileShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CodeFileService {

    private final CodeFileRepository fileRepository;
    private final CodeFileShareRepository shareRepository;
    private final AuthUserRepository authUserRepository;

    // ── create / list / get ─────────────────────────────────────────────────────

    @Transactional
    public FileResponse create(String ownerEmail, CreateFileRequest request) {
        CodeFile file = new CodeFile();
        file.setFileId(newFileId());
        file.setOwnerEmail(ownerEmail);
        file.setName(request.name());
        file.setLanguage(request.language());
        file.setContent(request.content() == null ? "" : request.content());
        file.setVisibility(request.visibility() == null ? FileVisibility.PRIVATE : request.visibility());
        return FileResponse.detail(fileRepository.save(file), FileAccess.OWNER, List.of());
    }

    @Transactional(readOnly = true)
    public FileListResponse listForUser(String email) {
        List<FileResponse> owned = fileRepository.findByOwnerEmailOrderByUpdatedAtDesc(email).stream()
                .map(file -> FileResponse.summary(file, FileAccess.OWNER))
                .toList();

        List<FileResponse> shared = shareRepository.findByEmailOrderByFileUpdatedAtDesc(email).stream()
                .map(share -> FileResponse.summary(share.getFile(), share.getAccess()))
                .toList();

        return new FileListResponse(owned, shared);
    }

    @Transactional(readOnly = true)
    public FileResponse get(String fileId, String requesterEmail) {
        CodeFile file = requireFile(fileId);
        FileAccess access = accessFor(file, requesterEmail);
        if (!access.canView()) {
            throw ApiException.forbidden("You don't have access to this file");
        }
        List<FileShareResponse> shares = access == FileAccess.OWNER
                ? shareRepository.findByFile(file).stream().map(FileShareResponse::from).toList()
                : null;
        return FileResponse.detail(file, access, shares);
    }

    // ── mutations ───────────────────────────────────────────────────────────────

    @Transactional
    public FileResponse updateContent(String fileId, String email, String content) {
        CodeFile file = requireFile(fileId);
        if (!accessFor(file, email).canEdit()) {
            throw ApiException.forbidden("You don't have edit access to this file");
        }
        file.setContent(content == null ? "" : content);
        fileRepository.save(file);
        return FileResponse.summary(file, accessFor(file, email));
    }

    @Transactional
    public FileResponse updateMeta(String fileId, String email, UpdateFileRequest request) {
        CodeFile file = requireOwned(fileId, email);
        if (request.name() != null && !request.name().isBlank()) {
            file.setName(request.name());
        }
        if (request.language() != null && !request.language().isBlank()) {
            file.setLanguage(request.language());
        }
        if (request.visibility() != null) {
            file.setVisibility(request.visibility());
        }
        fileRepository.save(file);
        return FileResponse.detail(file, FileAccess.OWNER,
                shareRepository.findByFile(file).stream().map(FileShareResponse::from).toList());
    }

    @Transactional
    public void delete(String fileId, String email) {
        CodeFile file = requireOwned(fileId, email);
        shareRepository.deleteByFile(file);
        fileRepository.delete(file);
    }

    // ── sharing ─────────────────────────────────────────────────────────────────

    @Transactional
    public List<FileShareResponse> addShare(String fileId, String ownerEmail, ShareRequest request) {
        CodeFile file = requireOwned(fileId, ownerEmail);
        String target = request.email().trim().toLowerCase();

        if (target.equalsIgnoreCase(ownerEmail)) {
            throw ApiException.badData("You already own this file");
        }
        if (!authUserRepository.existsByEmail(target)) {
            throw ApiException.badData("No registered user with that email");
        }
        if (request.access() != FileAccess.VIEW && request.access() != FileAccess.EDIT) {
            throw ApiException.badData("Access must be VIEW or EDIT");
        }

        CodeFileShare share = shareRepository.findByFileAndEmail(file, target)
                .orElseGet(() -> {
                    CodeFileShare s = new CodeFileShare();
                    s.setFile(file);
                    s.setEmail(target);
                    return s;
                });
        share.setAccess(request.access());
        shareRepository.save(share);

        return shareRepository.findByFile(file).stream().map(FileShareResponse::from).toList();
    }

    @Transactional
    public List<FileShareResponse> removeShare(String fileId, String ownerEmail, String email) {
        CodeFile file = requireOwned(fileId, ownerEmail);
        shareRepository.deleteByFileAndEmail(file, email.trim().toLowerCase());
        return shareRepository.findByFile(file).stream().map(FileShareResponse::from).toList();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    public FileAccess accessFor(CodeFile file, String email) {
        if (file.getOwnerEmail().equalsIgnoreCase(email)) {
            return FileAccess.OWNER;
        }
        return shareRepository.findByFileAndEmail(file, email == null ? "" : email.toLowerCase())
                .map(CodeFileShare::getAccess)
                .orElse(file.getVisibility() == FileVisibility.PUBLIC ? FileAccess.VIEW : FileAccess.NONE);
    }

    private CodeFile requireFile(String fileId) {
        return fileRepository.findByFileId(fileId)
                .orElseThrow(() -> ApiException.notFound("File not found"));
    }

    private CodeFile requireOwned(String fileId, String email) {
        CodeFile file = requireFile(fileId);
        if (!file.getOwnerEmail().equalsIgnoreCase(email)) {
            throw ApiException.forbidden("Only the owner can do that");
        }
        return file;
    }

    private String newFileId() {
        String candidate;
        do {
            candidate = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        } while (fileRepository.existsByFileId(candidate));
        return candidate;
    }
}
