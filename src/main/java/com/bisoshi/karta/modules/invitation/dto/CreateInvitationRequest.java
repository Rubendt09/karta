package com.bisoshi.karta.modules.invitation.dto;

import com.bisoshi.karta.modules.permission.dto.GrantAccessRequest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CreateInvitationRequest extends GrantAccessRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
