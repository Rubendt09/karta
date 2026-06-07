package com.bisoshi.karta.modules.project.dto;

import com.bisoshi.karta.modules.project.model.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class ProjectResponse {
    private UUID id;
    private String name;
    private String description;
    private UUID ownerId;
    private ProjectStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
