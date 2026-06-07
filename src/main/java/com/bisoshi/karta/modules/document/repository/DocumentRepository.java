package com.bisoshi.karta.modules.document.repository;

import com.bisoshi.karta.modules.document.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    
    List<Document> findByProjectId(UUID projectId);
    
    List<Document> findByUploadedBy(UUID uploadedBy);
    
    Optional<Document> findByIdAndProjectId(UUID id, UUID projectId);
}
