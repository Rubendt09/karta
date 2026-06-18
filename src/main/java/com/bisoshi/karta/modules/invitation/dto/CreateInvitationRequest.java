package com.bisoshi.karta.modules.invitation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateInvitationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String message;

    @NotNull(message = "Expiration days is required")
    private Integer expirationDays;

    private Boolean canView = true;

    private Boolean canEdit = false;

    private Boolean canDelete = false;

    private Boolean canDeprioritize = false;

    private Boolean canInvite = false;
}
