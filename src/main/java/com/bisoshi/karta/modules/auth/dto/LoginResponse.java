package com.bisoshi.karta.modules.auth.dto;

import com.bisoshi.karta.modules.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private UUID userId;
    private String email;
    private String name;
    private Role role;
}
