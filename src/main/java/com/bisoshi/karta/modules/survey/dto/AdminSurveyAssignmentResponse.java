package com.bisoshi.karta.modules.survey.dto;

import com.bisoshi.karta.modules.survey.model.SurveyStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AdminSurveyAssignmentResponse {
    private UUID id;
    private UUID surveyId;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private SurveyStatus status;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
    private String responseJson;
}
