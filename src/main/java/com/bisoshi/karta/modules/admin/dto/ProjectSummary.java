package com.bisoshi.karta.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class ProjectSummary {
    private UUID projectId;
    private String name;
    private Long documentCount;
    private Long accessCount;
    private LocalDateTime createdAt;
}
