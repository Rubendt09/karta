package com.bisoshi.karta.modules.project.repository;

import com.bisoshi.karta.modules.project.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    List<Incident> findByProjectIdOrderByReportedAtDesc(UUID projectId);
}
