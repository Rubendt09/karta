package com.bisoshi.karta.modules.project.repository;

import com.bisoshi.karta.modules.project.model.Project;
import com.bisoshi.karta.modules.project.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findByOwnerId(UUID ownerId);

    List<Project> findByStatus(ProjectStatus status);

    Optional<Project> findByIdAndOwnerId(UUID id, UUID ownerId);
}
