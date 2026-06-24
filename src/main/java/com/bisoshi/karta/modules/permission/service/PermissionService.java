package com.bisoshi.karta.modules.permission.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.audit.dto.ActivityLogRequest;
import com.bisoshi.karta.modules.audit.service.ActivityLogService;
import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.modules.permission.dto.GrantAccessRequest;
import com.bisoshi.karta.modules.permission.dto.ProjectAccessResponse;
import com.bisoshi.karta.modules.permission.dto.UpdateAccessRequest;
import com.bisoshi.karta.modules.permission.dto.UserPermissionsResponse;
import com.bisoshi.karta.modules.permission.model.ProjectAccess;
import com.bisoshi.karta.modules.permission.repository.ProjectAccessRepository;
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
public class PermissionService {
    
    private final ProjectAccessRepository projectAccessRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    
    public List<ProjectAccessResponse> getProjectAccesses(@NonNull UUID projectId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        return projectAccessRepository.findByProjectId(projectId).stream()
                .map(this::mapToProjectAccessResponse)
                .collect(Collectors.toList());
    }
    
    @SuppressWarnings("null")
    public ProjectAccessResponse grantAccess(@NonNull UUID projectId, GrantAccessRequest request, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        if (projectAccessRepository.findByProjectIdAndUserId(projectId, request.getUserId()).isPresent()) {
            throw new IllegalArgumentException("User already has access to this project");
        }
        
        ProjectAccess projectAccess = new ProjectAccess();
        projectAccess.setProjectId(projectId);
        projectAccess.setUserId(request.getUserId());
        projectAccess.setCanView(request.getCanView());
        projectAccess.setCanEdit(request.getCanEdit());
        projectAccess.setCanDelete(request.getCanDelete());
        projectAccess.setCanDeprioritize(request.getCanDeprioritize());
        projectAccess.setCanInvite(request.getCanInvite());
        projectAccess.setGrantedBy(userId);
        
        projectAccess = projectAccessRepository.save(projectAccess);

        User grantedUser = userRepository.findById(request.getUserId()).orElse(null);
        activityLogService.log(ActivityLogRequest.builder()
                .userId(userId)
                .userEmail(authentication.getName())
                .action("GRANT")
                .module("PERMISSION")
                .entityId(projectAccess.getId())
                .entityName(project.getName())
                .description("Otorgó acceso al proyecto '" + project.getName() + "' a " + (grantedUser != null ? grantedUser.getEmail() : request.getUserId()))
                .build());
        
        return mapToProjectAccessResponse(projectAccess);
    }
    
    @SuppressWarnings("null")
    public ProjectAccessResponse updateAccess(@NonNull UUID projectId, @NonNull UUID userId, UpdateAccessRequest request, Authentication authentication) {
        UUID currentUserId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(currentUserId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        ProjectAccess projectAccess = projectAccessRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Access not found"));
        
        if (request.getCanView() != null) {
            projectAccess.setCanView(request.getCanView());
        }
        if (request.getCanEdit() != null) {
            projectAccess.setCanEdit(request.getCanEdit());
        }
        if (request.getCanDelete() != null) {
            projectAccess.setCanDelete(request.getCanDelete());
        }
        if (request.getCanDeprioritize() != null) {
            projectAccess.setCanDeprioritize(request.getCanDeprioritize());
        }
        if (request.getCanInvite() != null) {
            projectAccess.setCanInvite(request.getCanInvite());
        }
        
        projectAccess = projectAccessRepository.save(projectAccess);

        User targetUser = userRepository.findById(userId).orElse(null);
        activityLogService.log(ActivityLogRequest.builder()
                .userId(currentUserId)
                .userEmail(authentication.getName())
                .action("UPDATE")
                .module("PERMISSION")
                .entityId(projectAccess.getId())
                .entityName(project.getName())
                .description("Modificó permisos de " + (targetUser != null ? targetUser.getEmail() : userId) + " en el proyecto '" + project.getName() + "'")
                .build());
        
        return mapToProjectAccessResponse(projectAccess);
    }
    
    @SuppressWarnings("null")
    public void revokeAccess(@NonNull UUID projectId, @NonNull UUID userId, Authentication authentication) {
        UUID currentUserId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(currentUserId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        ProjectAccess projectAccess = projectAccessRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Access not found"));

        User targetUser = userRepository.findById(userId).orElse(null);
        activityLogService.log(ActivityLogRequest.builder()
                .userId(currentUserId)
                .userEmail(authentication.getName())
                .action("REVOKE")
                .module("PERMISSION")
                .entityId(projectAccess.getId())
                .entityName(project.getName())
                .description("Revocó acceso al proyecto '" + project.getName() + "' de " + (targetUser != null ? targetUser.getEmail() : userId))
                .build());
        
        projectAccessRepository.delete(projectAccess);
    }

    public ProjectAccessResponse getUserAccess(@NonNull UUID projectId, @NonNull UUID userId, Authentication authentication) {
        UUID currentUserId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(currentUserId) && !currentUserId.equals(userId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        ProjectAccess projectAccess = projectAccessRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Access not found"));
        
        return mapToProjectAccessResponse(projectAccess);
    }
    
    public UserPermissionsResponse getUserPermissions(@NonNull UUID projectId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        // Si es el owner o admin, retorna permisos completos
        if (role == Role.ADMIN || project.getOwnerId().equals(userId)) {
            return new UserPermissionsResponse(
                    true,  // canView
                    true,  // canEdit
                    true,  // canDelete
                    true,  // canDeprioritize
                    true,  // canInvite
                    true   // canGrantAccess
            );
        }

        // Si no es owner, busca el acceso específico
        ProjectAccess projectAccess = projectAccessRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Access not found"));

        // canGrantAccess es true solo si el usuario tiene permiso canInvite
        // Según la documentación: DAR_QUITAR_ACCESO solo para creador del proyecto
        return new UserPermissionsResponse(
                projectAccess.getCanView(),
                projectAccess.getCanEdit(),
                projectAccess.getCanDelete(),
                projectAccess.getCanDeprioritize(),
                projectAccess.getCanInvite(),
                false  // canGrantAccess - solo el owner puede dar/quitar accesos
        );
    }

    @SuppressWarnings("null")
    public ProjectAccessResponse getMyAccess(@NonNull UUID projectId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        // Si es el owner o admin, retorna acceso completo
        if (role == Role.ADMIN || project.getOwnerId().equals(userId)) {
            User currentUser = userRepository.findById(userId).orElse(null);
            return new ProjectAccessResponse(
                    null,
                    projectId,
                    userId,
                    currentUser != null ? currentUser.getName() : null,
                    currentUser != null ? currentUser.getEmail() : null,
                    currentUser != null ? currentUser.getRole().name() : null,
                    true,  // canView
                    true,  // canEdit
                    true,  // canDelete
                    true,  // canDeprioritize
                    true,  // canInvite
                    userId,
                    currentUser != null ? currentUser.getName() : null,
                    project.getCreatedAt()
            );
        }

        // Si no es owner, busca el acceso específico
        ProjectAccess projectAccess = projectAccessRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Access not found"));

        return mapToProjectAccessResponse(projectAccess);
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
    
    
    @SuppressWarnings("null")
    private ProjectAccessResponse mapToProjectAccessResponse(ProjectAccess projectAccess) {
        // Get user information
        User user = userRepository.findById(projectAccess.getUserId()).orElse(null);
        User grantedByUser = userRepository.findById(projectAccess.getGrantedBy()).orElse(null);

        return new ProjectAccessResponse(
                projectAccess.getId(),
                projectAccess.getProjectId(),
                projectAccess.getUserId(),
                user != null ? user.getName() : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getRole().name() : null,
                projectAccess.getCanView(),
                projectAccess.getCanEdit(),
                projectAccess.getCanDelete(),
                projectAccess.getCanDeprioritize(),
                projectAccess.getCanInvite(),
                projectAccess.getGrantedBy(),
                grantedByUser != null ? grantedByUser.getName() : null,
                projectAccess.getGrantedAt()
        );
    }
}
