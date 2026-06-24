package com.bisoshi.karta.modules.project.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.audit.dto.ActivityLogRequest;
import com.bisoshi.karta.modules.audit.service.ActivityLogService;
import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.modules.project.dto.CreateProjectRequest;
import com.bisoshi.karta.modules.project.dto.ProjectResponse;
import com.bisoshi.karta.modules.project.dto.UpdateProjectRequest;
import com.bisoshi.karta.modules.project.model.Project;
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
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final com.bisoshi.karta.modules.permission.repository.ProjectAccessRepository projectAccessRepository;
    private final ActivityLogService activityLogService;
    
    @SuppressWarnings("null")
    public List<ProjectResponse> getAllProjects(Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        if (role == Role.ADMIN) {
            return projectRepository.findAll().stream()
                    .map(this::mapToProjectResponse)
                    .collect(Collectors.toList());
        }

        // Get projects where user is owner
        List<ProjectResponse> ownerProjects = projectRepository.findByOwnerId(userId).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());

        // Get projects where user has access through ProjectAccess
        List<com.bisoshi.karta.modules.permission.model.ProjectAccess> projectAccessList =
                projectAccessRepository.findByUserId(userId);

        List<ProjectResponse> accessibleProjects = projectAccessList.stream()
                .map(access -> projectRepository.findById(access.getProjectId()))
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());

        // Combine both lists and remove duplicates
        return java.util.stream.Stream.concat(ownerProjects.stream(), accessibleProjects.stream())
                .distinct()
                .collect(Collectors.toList());
    }
    
    public ProjectResponse getProjectById(@NonNull UUID id, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        // Admin can access any project
        if (role == Role.ADMIN) {
            return mapToProjectResponse(project);
        }

        // Owner can access their own project
        if (project.getOwnerId().equals(userId)) {
            return mapToProjectResponse(project);
        }

        // Check if user has access through ProjectAccess
        if (projectAccessRepository.findByProjectIdAndUserId(id, userId).isPresent()) {
            return mapToProjectResponse(project);
        }

        throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
    }
    
    public ProjectResponse createProject(CreateProjectRequest request, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        if (role != Role.ADMIN && role != Role.ASESOR) {
            throw new IllegalArgumentException(AppConstants.INSUFFICIENT_PERMISSIONS);
        }
        
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwnerId(userId);
        project.setStatus(com.bisoshi.karta.modules.project.model.ProjectStatus.ACTIVO);
        
        project = projectRepository.save(project);

        activityLogService.log(ActivityLogRequest.builder()
                .userId(userId)
                .userEmail(authentication.getName())
                .action("CREATE")
                .module("PROJECT")
                .entityId(project.getId())
                .entityName(project.getName())
                .description("Creó el proyecto '" + project.getName() + "'")
                .build());
        
        return mapToProjectResponse(project);
    }
    
    public ProjectResponse updateProject(@NonNull UUID id, UpdateProjectRequest request, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        // Admin can edit any project
        if (role == Role.ADMIN) {
            return updateProjectFields(project, request, authentication);
        }

        // Owner can edit their own project
        if (project.getOwnerId().equals(userId)) {
            return updateProjectFields(project, request, authentication);
        }

        // Check if user has EDIT permission through ProjectAccess
        java.util.Optional<com.bisoshi.karta.modules.permission.model.ProjectAccess> projectAccess =
                projectAccessRepository.findByProjectIdAndUserId(id, userId);

        if (projectAccess.isPresent() && projectAccess.get().getCanEdit()) {
            return updateProjectFields(project, request, authentication);
        }

        throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
    }

    private ProjectResponse updateProjectFields(Project project, UpdateProjectRequest request, Authentication authentication) {
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        project = projectRepository.save(project);

        activityLogService.log(ActivityLogRequest.builder()
                .userId(getUserIdFromAuthentication(authentication))
                .userEmail(authentication.getName())
                .action("UPDATE")
                .module("PROJECT")
                .entityId(project.getId())
                .entityName(project.getName())
                .description("Editó el proyecto '" + project.getName() + "'")
                .build());

        return mapToProjectResponse(project);
    }
    
    @SuppressWarnings("null")
    public void deleteProject(@NonNull UUID id, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        // Admin can delete any project
        if (role == Role.ADMIN) {
            logProjectDelete(project, authentication);
            projectRepository.delete(project);
            return;
        }

        // Owner can delete their own project
        if (project.getOwnerId().equals(userId)) {
            logProjectDelete(project, authentication);
            projectRepository.delete(project);
            return;
        }

        // Invited users cannot delete projects (even with DELETE permission)
        throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
    }

    private void logProjectDelete(Project project, Authentication authentication) {
        activityLogService.log(ActivityLogRequest.builder()
                .userId(getUserIdFromAuthentication(authentication))
                .userEmail(authentication.getName())
                .action("DELETE")
                .module("PROJECT")
                .entityId(project.getId())
                .entityName(project.getName())
                .description("Eliminó el proyecto '" + project.getName() + "'")
                .build());
    }
    
    public ProjectResponse updateProjectStatus(@NonNull UUID id, com.bisoshi.karta.modules.project.model.ProjectStatus status, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        // Admin can update status of any project
        if (role == Role.ADMIN) {
            return updateProjectStatusField(project, status, authentication);
        }

        // Owner can update status of their own project
        if (project.getOwnerId().equals(userId)) {
            return updateProjectStatusField(project, status, authentication);
        }

        // Check if user has DEPRIORITIZE permission through ProjectAccess
        java.util.Optional<com.bisoshi.karta.modules.permission.model.ProjectAccess> projectAccess =
                projectAccessRepository.findByProjectIdAndUserId(id, userId);

        if (projectAccess.isPresent() && projectAccess.get().getCanDeprioritize()) {
            return updateProjectStatusField(project, status, authentication);
        }

        throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
    }

    private ProjectResponse updateProjectStatusField(Project project, com.bisoshi.karta.modules.project.model.ProjectStatus status, Authentication authentication) {
        project.setStatus(status);
        project = projectRepository.save(project);

        activityLogService.log(ActivityLogRequest.builder()
                .userId(getUserIdFromAuthentication(authentication))
                .userEmail(authentication.getName())
                .action("STATUS_CHANGE")
                .module("PROJECT")
                .entityId(project.getId())
                .entityName(project.getName())
                .description("Cambió estado del proyecto '" + project.getName() + "' a " + status.name())
                .build());

        return mapToProjectResponse(project);
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
    
    private ProjectResponse mapToProjectResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwnerId(),
                project.getStatus(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
