package com.bisoshi.karta.modules.permission.dto;

import lombok.Data;

@Data
public class UpdateAccessRequest {
    
    private Boolean canView;
    
    private Boolean canEdit;
    
    private Boolean canDelete;
    
    private Boolean canDeprioritize;
    
    private Boolean canInvite;
}
