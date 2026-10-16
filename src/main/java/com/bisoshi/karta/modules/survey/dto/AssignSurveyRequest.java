package com.bisoshi.karta.modules.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignSurveyRequest {

    private Boolean assignToAll;

    private List<UUID> userIds;
}
