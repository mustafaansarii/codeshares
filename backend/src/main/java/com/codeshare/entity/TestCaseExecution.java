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
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "test_case_execution")
public class TestCaseExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "solution_id", nullable = false, foreignKey = @ForeignKey(name = "fk_execution_solution"))
    private UserSolution solution;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_case_id", nullable = false, foreignKey = @ForeignKey(name = "fk_execution_test_case"))
    private TestCase testCase;

    @Column(nullable = false)
    private String status; // PASSED, FAILED, TIMEOUT, RUNTIME_ERROR

    @Column(columnDefinition = "TEXT")
    private String actualOutput;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "execution_time_ms")
    private int executionTimeMs;

    @Column(name = "memory_used_mb")
    private int memoryUsedMb;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public boolean isPassed() {
        return "PASSED".equals(status);
    }
}
