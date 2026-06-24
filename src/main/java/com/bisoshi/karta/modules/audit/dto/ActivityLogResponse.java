package com.bisoshi.karta.modules.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {

    private UUID id;
    private LocalDateTime timestamp;
    private UUID userId;
    private String userEmail;
    private String action;
    private String module;
    private UUID entityId;
    private String entityName;
    private String description;
    private String ipAddress;
    private String userAgent;
}
