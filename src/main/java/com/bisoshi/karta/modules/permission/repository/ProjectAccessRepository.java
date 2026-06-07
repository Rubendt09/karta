package com.bisoshi.karta.modules.permission.repository;

import com.bisoshi.karta.modules.permission.model.ProjectAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectAccessRepository extends JpaRepository<ProjectAccess, UUID> {
    
    List<ProjectAccess> findByProjectId(UUID projectId);
    
    List<ProjectAccess> findByUserId(UUID userId);
    
    Optional<ProjectAccess> findByProjectIdAndUserId(UUID projectId, UUID userId);
    
    void deleteByProjectIdAndUserId(UUID projectId, UUID userId);
}
