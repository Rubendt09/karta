package com.bisoshi.karta.modules.project.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
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
    
    public List<ProjectResponse> getAllProjects(Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        if (role == Role.ADMIN) {
            return projectRepository.findAll().stream()
                    .map(this::mapToProjectResponse)
                    .collect(Collectors.toList());
        }
        
        return projectRepository.findByOwnerId(userId).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }
    
    public ProjectResponse getProjectById(@NonNull UUID id, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        return mapToProjectResponse(project);
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
        
        return mapToProjectResponse(project);
    }
    
    public ProjectResponse updateProject(@NonNull UUID id, UpdateProjectRequest request, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        
        project = projectRepository.save(project);
        
        return mapToProjectResponse(project);
    }
    
    @SuppressWarnings("null")
    public void deleteProject(@NonNull UUID id, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        projectRepository.delete(project);
    }
    
    public ProjectResponse updateProjectStatus(@NonNull UUID id, com.bisoshi.karta.modules.project.model.ProjectStatus status, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        project.setStatus(status);
        project = projectRepository.save(project);
        
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
