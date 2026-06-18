package com.codeshare.entity;

import com.codeshare.dto.constants.FileAccess;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Data
@Entity
@Table(name = "code_file_share",
        uniqueConstraints = @UniqueConstraint(name = "uk_file_share", columnNames = {"file_id", "email"}),
        indexes = {
                @Index(name = "idx_file_share_email", columnList = "email"),
                @Index(name = "idx_file_share_file", columnList = "file_id")
        })
public class CodeFileShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "file_id", nullable = false, foreignKey = @ForeignKey(name = "fk_file_share_file"))
    private CodeFile file;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileAccess access; // VIEW or EDIT
}
