package com.bisoshi.karta.modules.permission.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_access")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectAccess {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "project_id", nullable = false)
    private UUID projectId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "can_view", nullable = false)
    private Boolean canView = false;
    
    @Column(name = "can_edit", nullable = false)
    private Boolean canEdit = false;
    
    @Column(name = "can_delete", nullable = false)
    private Boolean canDelete = false;
    
    @Column(name = "can_deprioritize", nullable = false)
    private Boolean canDeprioritize = false;
    
    @Column(name = "can_invite", nullable = false)
    private Boolean canInvite = false;
    
    @Column(name = "granted_by", nullable = false)
    private UUID grantedBy;
    
    @Column(name = "granted_at", nullable = false, updatable = false)
    private LocalDateTime grantedAt;
    
    @PrePersist
    protected void onCreate() {
        grantedAt = LocalDateTime.now();
    }
}
