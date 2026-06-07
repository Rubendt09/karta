package com.bisoshi.karta.modules.permission.controller;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.permission.dto.GrantAccessRequest;
import com.bisoshi.karta.modules.permission.dto.ProjectAccessResponse;
import com.bisoshi.karta.modules.permission.dto.UpdateAccessRequest;
import com.bisoshi.karta.modules.permission.service.PermissionService;
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
@RequestMapping("/api/v1/projects/{projectId}/access")
@RequiredArgsConstructor
@Tag(name = "Permission Management", description = "Endpoints for project access management")
public class PermissionController {
    
    private final PermissionService permissionService;
    
    @GetMapping
    @Operation(summary = "Get all accesses for a project", description = "Get all accesses for a project")
    public ResponseEntity<ResponseDto<List<ProjectAccessResponse>>> getProjectAccesses(@PathVariable @NonNull UUID projectId, Authentication authentication) {
        List<ProjectAccessResponse> accesses = permissionService.getProjectAccesses(projectId, authentication);
        return ResponseEntity.ok(ResponseDto.success("Accesses retrieved successfully", accesses));
    }
    
    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user access for a project", description = "Get user access for a project")
    public ResponseEntity<ResponseDto<ProjectAccessResponse>> getUserAccess(@PathVariable @NonNull UUID projectId, @PathVariable @NonNull UUID userId, Authentication authentication) {
        ProjectAccessResponse access = permissionService.getUserAccess(projectId, userId, authentication);
        return ResponseEntity.ok(ResponseDto.success("Access retrieved successfully", access));
    }
    
    @PostMapping
    @Operation(summary = "Grant access to a project", description = "Grant access to a project")
    public ResponseEntity<ResponseDto<ProjectAccessResponse>> grantAccess(@PathVariable @NonNull UUID projectId, @Valid @RequestBody GrantAccessRequest request, Authentication authentication) {
        ProjectAccessResponse access = permissionService.grantAccess(projectId, request, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.ACCESS_GRANTED_SUCCESSFULLY, access));
    }
    
    @PutMapping("/users/{userId}")
    @Operation(summary = "Update user access for a project", description = "Update user access for a project")
    public ResponseEntity<ResponseDto<ProjectAccessResponse>> updateAccess(@PathVariable @NonNull UUID projectId, @PathVariable @NonNull UUID userId, @RequestBody UpdateAccessRequest request, Authentication authentication) {
        ProjectAccessResponse access = permissionService.updateAccess(projectId, userId, request, authentication);
        return ResponseEntity.ok(ResponseDto.success("Access updated successfully", access));
    }
    
    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Revoke user access from a project", description = "Revoke user access from a project")
    public ResponseEntity<ResponseDto<Void>> revokeAccess(@PathVariable @NonNull UUID projectId, @PathVariable @NonNull UUID userId, Authentication authentication) {
        permissionService.revokeAccess(projectId, userId, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.ACCESS_REVOKED_SUCCESSFULLY));
    }
}
