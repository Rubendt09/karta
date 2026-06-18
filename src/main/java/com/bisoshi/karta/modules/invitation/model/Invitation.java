package com.bisoshi.karta.modules.invitation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invitation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(name = "project_id", nullable = false)
    private UUID projectId;
    
    @Column(name = "invited_by", nullable = false)
    private UUID invitedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDIENTE;
    
    @Column(name = "temporary_password")
    private String temporaryPassword;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "can_view")
    private Boolean canView = true;

    @Column(name = "can_edit")
    private Boolean canEdit = false;

    @Column(name = "can_delete")
    private Boolean canDelete = false;

    @Column(name = "can_deprioritize")
    private Boolean canDeprioritize = false;

    @Column(name = "can_invite")
    private Boolean canInvite = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusDays(7);
        }
    }
}
