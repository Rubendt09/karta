package com.bisoshi.karta.modules.admin.service;

import com.bisoshi.karta.modules.admin.dto.DashboardMetrics;
import com.bisoshi.karta.modules.admin.dto.ProjectSummary;
import com.bisoshi.karta.modules.admin.dto.UserActivity;
import com.bisoshi.karta.modules.audit.model.ActivityLog;
import com.bisoshi.karta.modules.audit.repository.ActivityLogRepository;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.modules.document.repository.DocumentRepository;
import com.bisoshi.karta.modules.permission.repository.ProjectAccessRepository;
import com.bisoshi.karta.modules.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final DocumentRepository documentRepository;
    private final ProjectAccessRepository projectAccessRepository;
    private final ActivityLogRepository activityLogRepository;
    
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
        return userRepository.findAll().stream()
                .map(user -> {
                    List<ActivityLog> userLogs = activityLogRepository.findByUserIdOrderByTimestampDesc(user.getId());
                    LocalDateTime lastActivity = userLogs.isEmpty()
                            ? user.getUpdatedAt()
                            : userLogs.get(0).getTimestamp();
                    return new UserActivity(
                            user.getId(),
                            user.getEmail(),
                            (long) userLogs.size(),
                            lastActivity
                    );
                })
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
