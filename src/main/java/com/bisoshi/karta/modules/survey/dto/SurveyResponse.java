package com.bisoshi.karta.modules.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class SurveyResponse {
    private UUID id;
    private String name;
    private String description;
    private String formJson;
    private Boolean active;
    private LocalDateTime createdAt;
    private long totalAssigned;
    private long completedCount;
    private long pendingCount;
}
