package com.bisoshi.karta.modules.auth.dto;

import com.bisoshi.karta.modules.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private Role role;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
