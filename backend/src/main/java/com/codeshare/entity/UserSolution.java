package com.codeshare.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "user_solution")
public class UserSolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_solution_user"))
    private AuthUser user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "problem_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_solution_problem"))
    private Problem problem;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String status; // SUBMITTED, RUNNING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT, RUNTIME_ERROR

    @Column(nullable = false)
    private int totalTestCases = 0;

    @Column(nullable = false)
    private int passedTestCases = 0;

    @Column(nullable = false)
    private int failedTestCases = 0;

    @Column(name = "execution_time_ms")
    private int executionTimeMs = 0;

    @Column(name = "memory_used_mb")
    private int memoryUsedMb = 0;

    @Column(columnDefinition = "TEXT")
    private String lastError;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isSolved() {
        return "ACCEPTED".equals(status) && failedTestCases == 0;
    }

    public double getAccuracy() {
        if (totalTestCases == 0) {
            return 0.0;
        }
        return (double) passedTestCases / totalTestCases * 100;
    }
}
