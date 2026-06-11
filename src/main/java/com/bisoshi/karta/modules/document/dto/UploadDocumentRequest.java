package com.bisoshi.karta.modules.document.dto;

import com.bisoshi.karta.modules.document.model.Priority;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UploadDocumentRequest {
    
    @NotBlank(message = "Document name is required")
    private String name;
    
    private Priority priority = Priority.MEDIA;
    
    private String description;
}
