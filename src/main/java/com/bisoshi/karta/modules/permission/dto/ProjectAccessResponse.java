package com.bisoshi.karta.modules.permission.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class ProjectAccessResponse {
    private UUID id;
    private UUID projectId;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private Boolean canView;
    private Boolean canEdit;
    private Boolean canDelete;
    private Boolean canDeprioritize;
    private Boolean canInvite;
    private UUID grantedBy;
    private String grantedByName;
    private LocalDateTime grantedAt;
}
