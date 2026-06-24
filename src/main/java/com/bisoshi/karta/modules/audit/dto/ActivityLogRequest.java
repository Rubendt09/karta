package com.bisoshi.karta.modules.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogRequest {

    private UUID userId;
    private String userEmail;
    private String action;
    private String module;
    private UUID entityId;
    private String entityName;
    private String description;
}
