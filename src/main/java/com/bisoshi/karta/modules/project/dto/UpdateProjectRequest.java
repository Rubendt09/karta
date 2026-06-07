package com.bisoshi.karta.modules.project.dto;

import com.bisoshi.karta.modules.project.model.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProjectRequest {
    
    @NotBlank(message = "Project name is required")
    private String name;
    
    private String description;
    
    private ProjectStatus status;
}
