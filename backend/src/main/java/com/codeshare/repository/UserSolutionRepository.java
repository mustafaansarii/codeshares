package com.codeshare.repository;

import com.codeshare.entity.UserSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSolutionRepository extends JpaRepository<UserSolution, Long> {
    Optional<UserSolution> findByUserIdAndProblemId(Long userId, Long problemId);

    List<UserSolution> findByUserId(Long userId);

    List<UserSolution> findByProblemId(Long problemId);

    List<UserSolution> findByUserIdAndStatus(Long userId, String status);

    long countByUserIdAndStatus(Long userId, String status);

    long countByProblemIdAndStatus(Long problemId, String status);
}
