package com.codeshare.entity;

import com.codeshare.dto.constants.FileVisibility;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "code_file", indexes = {
        @Index(name = "idx_code_file_file_id", columnList = "fileId", unique = true),
        @Index(name = "idx_code_file_owner", columnList = "ownerEmail")
})
public class CodeFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Public, URL-shareable identifier (also used as the collab room key: {@code file:<fileId>}). */
    @Column(nullable = false, unique = true, updatable = false)
    private String fileId;

    @Column(nullable = false)
    private String ownerEmail;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String language;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileVisibility visibility = FileVisibility.PRIVATE;

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
