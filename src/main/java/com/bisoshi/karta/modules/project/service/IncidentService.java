package com.bisoshi.karta.modules.project.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.modules.permission.model.ProjectAccess;
import com.bisoshi.karta.modules.permission.repository.ProjectAccessRepository;
import com.bisoshi.karta.modules.project.dto.CreateIncidentRequest;
import com.bisoshi.karta.modules.project.dto.IncidentResponse;
import com.bisoshi.karta.modules.project.model.Incident;
import com.bisoshi.karta.modules.project.model.Project;
import com.bisoshi.karta.modules.project.repository.IncidentRepository;
import com.bisoshi.karta.modules.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAccessRepository projectAccessRepository;
    private final UserRepository userRepository;

    public IncidentResponse createIncident(@NonNull UUID projectId, CreateIncidentRequest request, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            ProjectAccess access = projectAccessRepository.findByProjectIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED));

            if (!access.getCanEdit()) {
                throw new IllegalArgumentException(AppConstants.INSUFFICIENT_PERMISSIONS);
            }
        }

        Incident incident = new Incident();
        incident.setProjectId(projectId);
        incident.setDocumentId(request.getDocumentId());
        incident.setIncidentType(request.getIncidentType());
        incident.setReportedBy(userId);

        Incident saved = incidentRepository.save(incident);
        return mapToIncidentResponse(saved);
    }

    public List<IncidentResponse> getProjectIncidents(@NonNull UUID projectId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            ProjectAccess access = projectAccessRepository.findByProjectIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED));

            if (!access.getCanView()) {
                throw new IllegalArgumentException(AppConstants.INSUFFICIENT_PERMISSIONS);
            }
        }

        return incidentRepository.findByProjectIdOrderByReportedAtDesc(projectId).stream()
                .map(this::mapToIncidentResponse)
                .collect(Collectors.toList());
    }

    private IncidentResponse mapToIncidentResponse(Incident incident) {
        return new IncidentResponse(
                incident.getId(),
                incident.getProjectId(),
                incident.getDocumentId(),
                incident.getIncidentType(),
                incident.getReportedBy(),
                incident.getReportedAt()
        );
    }

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        return user.getId();
    }

    private Role getRoleFromAuthentication(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> {
                    String roleName = authority.getAuthority();
                    if (roleName.startsWith("ROLE_")) {
                        return Role.valueOf(roleName.substring(5));
                    }
                    return Role.valueOf(roleName);
                })
                .orElse(Role.INVITADO);
    }
}
