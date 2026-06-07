package com.bisoshi.karta.modules.project.controller;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.project.dto.CreateProjectRequest;
import com.bisoshi.karta.modules.project.dto.ProjectResponse;
import com.bisoshi.karta.modules.project.dto.UpdateProjectRequest;
import com.bisoshi.karta.modules.project.model.ProjectStatus;
import com.bisoshi.karta.modules.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Project Management", description = "Endpoints for project management")
public class ProjectController {
    
    private final ProjectService projectService;
    
    @GetMapping
    @Operation(summary = "Get all projects", description = "Get all projects")
    public ResponseEntity<ResponseDto<List<ProjectResponse>>> getAllProjects(Authentication authentication) {
        List<ProjectResponse> projects = projectService.getAllProjects(authentication);
        return ResponseEntity.ok(ResponseDto.success("Projects retrieved successfully", projects));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID", description = "Get project by ID")
    public ResponseEntity<ResponseDto<ProjectResponse>> getProjectById(@PathVariable @NonNull UUID id, Authentication authentication) {
        ProjectResponse project = projectService.getProjectById(id, authentication);
        return ResponseEntity.ok(ResponseDto.success("Project retrieved successfully", project));
    }
    
    @PostMapping
    @Operation(summary = "Create new project", description = "Create new project")
    public ResponseEntity<ResponseDto<ProjectResponse>> createProject(@Valid @RequestBody CreateProjectRequest request, Authentication authentication) {
        ProjectResponse project = projectService.createProject(request, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.PROJECT_CREATED_SUCCESSFULLY, project));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update project", description = "Update project")
    public ResponseEntity<ResponseDto<ProjectResponse>> updateProject(@PathVariable @NonNull UUID id, @Valid @RequestBody UpdateProjectRequest request, Authentication authentication) {
        ProjectResponse project = projectService.updateProject(id, request, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.PROJECT_UPDATED_SUCCESSFULLY, project));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project", description = "Delete project")
    public ResponseEntity<ResponseDto<Void>> deleteProject(@PathVariable @NonNull UUID id, Authentication authentication) {
        projectService.deleteProject(id, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.PROJECT_DELETED_SUCCESSFULLY));
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update project status", description = "Update project status")
    public ResponseEntity<ResponseDto<ProjectResponse>> updateProjectStatus(@PathVariable @NonNull UUID id, @RequestParam ProjectStatus status, Authentication authentication) {
        ProjectResponse project = projectService.updateProjectStatus(id, status, authentication);
        return ResponseEntity.ok(ResponseDto.success("Project status updated successfully", project));
    }
}
