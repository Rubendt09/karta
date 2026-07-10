package com.bisoshi.karta.modules.project.controller;

import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.project.dto.CreateIncidentRequest;
import com.bisoshi.karta.modules.project.dto.IncidentResponse;
import com.bisoshi.karta.modules.project.service.IncidentService;
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
@RequestMapping("/api/v1/projects/{projectId}/incidents")
@RequiredArgsConstructor
@Tag(name = "Incident Management", description = "Endpoints for project document incidents")
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    @Operation(summary = "Get all incidents for a project", description = "Get all incidents for a project")
    public ResponseEntity<ResponseDto<List<IncidentResponse>>> getProjectIncidents(
            @PathVariable @NonNull UUID projectId,
            Authentication authentication) {
        List<IncidentResponse> incidents = incidentService.getProjectIncidents(projectId, authentication);
        return ResponseEntity.ok(ResponseDto.success("Incidents retrieved successfully", incidents));
    }

    @PostMapping
    @Operation(summary = "Register a new incident", description = "Register a new incident for a project document")
    public ResponseEntity<ResponseDto<IncidentResponse>> createIncident(
            @PathVariable @NonNull UUID projectId,
            @Valid @RequestBody CreateIncidentRequest request,
            Authentication authentication) {
        request.setProjectId(projectId);
        IncidentResponse incident = incidentService.createIncident(projectId, request, authentication);
        return ResponseEntity.ok(ResponseDto.success("Incident registered successfully", incident));
    }
}
