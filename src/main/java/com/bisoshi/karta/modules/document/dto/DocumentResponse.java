package com.bisoshi.karta.modules.document.dto;

import com.bisoshi.karta.modules.document.model.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class DocumentResponse {
    private UUID id;
    private UUID projectId;
    private String name;
    private String description;
    private Long fileSize;
    private String mimeType;
    private UUID uploadedBy;
    private LocalDateTime createdAt;
    private Priority priority;
}
