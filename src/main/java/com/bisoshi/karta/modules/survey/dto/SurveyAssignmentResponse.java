package com.bisoshi.karta.modules.survey.dto;

import com.bisoshi.karta.modules.survey.model.SurveyStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class SurveyAssignmentResponse {
    private UUID id;
    private UUID surveyId;
    private String surveyName;
    private String surveyDescription;
    private SurveyStatus status;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
    private String formJson;
    private String responseJson;
}
