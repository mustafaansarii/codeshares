package com.codeshare.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "collab_session", indexes = {
        @Index(name = "idx_collab_session_session_id", columnList = "sessionId", unique = true),
        @Index(name = "idx_collab_session_owner", columnList = "ownerEmail")
})
public class CollabSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Public, URL-shareable room identifier. */
    @Column(nullable = false, unique = true, updatable = false)
    private String sessionId;

    @Column(nullable = false)
    private Long problemId;

    @Column(nullable = false)
    private String ownerEmail;

    @Column(nullable = false)
    private String language;

    /** Latest Yjs document snapshot (full encoded state) so sessions survive restarts and late joins. */
    @Column(columnDefinition = "BYTEA")
    private byte[] docState;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
