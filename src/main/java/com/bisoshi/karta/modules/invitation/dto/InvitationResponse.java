package com.bisoshi.karta.modules.invitation.dto;

import com.bisoshi.karta.modules.invitation.model.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class InvitationResponse {
    private UUID id;
    private String email;
    private UUID projectId;
    private UUID invitedBy;
    private InvitationStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private Boolean canView;
    private Boolean canEdit;
    private Boolean canDelete;
    private Boolean canDeprioritize;
    private Boolean canInvite;
}
