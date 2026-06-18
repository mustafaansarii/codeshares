package com.codeshare.repo;

import com.codeshare.entity.CodeFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodeFileRepository extends JpaRepository<CodeFile, Long> {

    Optional<CodeFile> findByFileId(String fileId);

    boolean existsByFileId(String fileId);

    List<CodeFile> findByOwnerEmailOrderByUpdatedAtDesc(String ownerEmail);
}
