package com.codeshare.repo;

import com.codeshare.entity.CollabSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CollabSessionRepository extends JpaRepository<CollabSession, Long> {

    Optional<CollabSession> findBySessionId(String sessionId);

    boolean existsBySessionId(String sessionId);
}
