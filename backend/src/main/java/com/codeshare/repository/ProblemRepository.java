package com.codeshare.repository;

import com.codeshare.entity.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findByTitle(String title);

    @Query("""
            SELECT p FROM Problem p
            WHERE (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                    OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:sheetName IS NULL OR LOWER(p.sheetName) = LOWER(:sheetName))
            """)
    Page<Problem> search(
            @Param("keyword") String keyword,
            @Param("sheetName") String sheetName,
            Pageable pageable);
}

