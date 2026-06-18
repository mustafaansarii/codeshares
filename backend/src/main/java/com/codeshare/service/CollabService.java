package com.codeshare.service;

import com.codeshare.dto.collab.CollabSessionResponse;
import com.codeshare.dto.collab.CreateCollabRequest;
import com.codeshare.entity.CollabSession;
import com.codeshare.repo.CollabSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollabService {

    private final CollabSessionRepository collabSessionRepository;

    public CollabSessionResponse createSession(String ownerEmail, CreateCollabRequest request) {
        CollabSession entity = new CollabSession();
        entity.setSessionId(newSessionId());
        entity.setProblemId(request.problemId());
        entity.setLanguage(request.language() == null ? "Java" : request.language());
        entity.setOwnerEmail(ownerEmail);
        return CollabSessionResponse.from(collabSessionRepository.save(entity));
    }

    public CollabSessionResponse getSession(String sessionId) {
        return collabSessionRepository.findBySessionId(sessionId)
                .map(CollabSessionResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Collab session not found"));
    }

    private String newSessionId() {
        String candidate;
        do {
            candidate = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        } while (collabSessionRepository.existsBySessionId(candidate));
        return candidate;
    }
}
