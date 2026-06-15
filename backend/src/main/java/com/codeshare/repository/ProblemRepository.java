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

    /**
     * JPQL search — parameters are never null:
     *   kw  = "%" when no keyword filter (LIKE '%' matches everything)
     *   sn  = "" when no sheet filter  (skip via ':sn = \'\')
     * This avoids the PostgreSQL bytea type-inference error that occurs
     * when Hibernate sends a null String parameter.
     */
    @Query("""
            SELECT p FROM Problem p
            WHERE (LOWER(p.title) LIKE :kw OR LOWER(p.description) LIKE :kw)
              AND (:sn = '' OR LOWER(p.sheetName) = :sn)
            ORDER BY p.createdAt DESC
            """)
    Page<Problem> search(
            @Param("kw") String kw,
            @Param("sn") String sn,
            Pageable pageable);
}
