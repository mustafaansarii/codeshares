package com.codeshare.repository;

import com.codeshare.entity.TestCaseExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseExecutionRepository extends JpaRepository<TestCaseExecution, Long> {
    List<TestCaseExecution> findBySolutionId(Long solutionId);

    long countByTestCaseIdAndStatus(Long testCaseId, String status);
}
