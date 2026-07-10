package com.bisoshi.karta.modules.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class IncidentResponse {
    private UUID id;
    private UUID projectId;
    private UUID documentId;
    private String incidentType;
    private UUID reportedBy;
    private LocalDateTime reportedAt;
}
