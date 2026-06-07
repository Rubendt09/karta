package com.bisoshi.karta.modules.admin.service;

import com.bisoshi.karta.modules.admin.dto.DashboardMetrics;
import com.bisoshi.karta.modules.admin.dto.ProjectSummary;
import com.bisoshi.karta.modules.admin.dto.UserActivity;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.modules.document.repository.DocumentRepository;
import com.bisoshi.karta.modules.permission.repository.ProjectAccessRepository;
import com.bisoshi.karta.modules.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final DocumentRepository documentRepository;
    private final ProjectAccessRepository projectAccessRepository;
    
    public DashboardMetrics getDashboardMetrics() {
        DashboardMetrics metrics = new DashboardMetrics();
        metrics.setTotalUsers(userRepository.count());
        metrics.setTotalProjects(projectRepository.count());
        metrics.setTotalDocuments(documentRepository.count());
        metrics.setStorageUsed(documentRepository.findAll().stream()
                .mapToLong(doc -> doc.getFileSize() != null ? doc.getFileSize() : 0)
                .sum());
        return metrics;
    }
    
    public List<UserActivity> getUserActivity() {
        // Simplified implementation - in a real system, this would query an activity log
        return userRepository.findAll().stream()
                .map(user -> new UserActivity(
                        user.getId(),
                        user.getEmail(),
                        0L,
                        user.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }
    
    public List<ProjectSummary> getProjectSummary() {
        return projectRepository.findAll().stream()
                .map(project -> {
                    Long documentCount = documentRepository.findByProjectId(project.getId()).size() != 0 ? 
                            (long) documentRepository.findByProjectId(project.getId()).size() : 0L;
                    Long accessCount = projectAccessRepository.findByProjectId(project.getId()).size() != 0 ?
                            (long) projectAccessRepository.findByProjectId(project.getId()).size() : 0L;
                    return new ProjectSummary(
                            project.getId(),
                            project.getName(),
                            documentCount,
                            accessCount,
                            project.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }
}
