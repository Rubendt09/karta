package com.bisoshi.karta.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserActivity {
    private UUID userId;
    private String email;
    private Long actionCount;
    private LocalDateTime lastActivity;
}
