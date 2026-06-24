package com.bisoshi.karta.modules.audit.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ActivityLogFilter {

    private UUID userId;
    private String module;
    private String action;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
