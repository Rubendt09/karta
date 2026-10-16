package com.bisoshi.karta.modules.survey.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitSurveyRequest {

    @NotNull(message = "Response JSON is required")
    private String responseJson;
}
