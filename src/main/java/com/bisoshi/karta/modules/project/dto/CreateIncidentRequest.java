package com.bisoshi.karta.modules.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateIncidentRequest {

    @NotNull(message = "El ID del proyecto es obligatorio")
    private UUID projectId;

    @NotNull(message = "El documento afectado es obligatorio")
    private UUID documentId;

    @NotBlank(message = "El tipo de incidente es obligatorio")
    private String incidentType;
}
