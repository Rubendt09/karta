package com.bisoshi.karta.modules.permission.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserPermissionsResponse {
    private Boolean canView;
    private Boolean canEdit;
    private Boolean canDelete;
    private Boolean canDeprioritize;
    private Boolean canInvite;
    private Boolean canGrantAccess;
}
