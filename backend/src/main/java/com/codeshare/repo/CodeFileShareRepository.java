package com.codeshare.repo;

import com.codeshare.entity.CodeFile;
import com.codeshare.entity.CodeFileShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodeFileShareRepository extends JpaRepository<CodeFileShare, Long> {

    List<CodeFileShare> findByFile(CodeFile file);

    Optional<CodeFileShare> findByFileAndEmail(CodeFile file, String email);

    void deleteByFileAndEmail(CodeFile file, String email);

    void deleteByFile(CodeFile file);

    /** Files shared with a given user, most-recently-updated first. */
    List<CodeFileShare> findByEmailOrderByFileUpdatedAtDesc(String email);
}
