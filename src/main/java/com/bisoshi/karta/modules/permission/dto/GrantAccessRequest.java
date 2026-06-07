package com.bisoshi.karta.modules.permission.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class GrantAccessRequest {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    private Boolean canView = true;
    
    private Boolean canEdit = false;
    
    private Boolean canDelete = false;
    
    private Boolean canDeprioritize = false;
    
    private Boolean canInvite = false;
}
