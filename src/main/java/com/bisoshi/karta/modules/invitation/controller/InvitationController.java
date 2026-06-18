package com.bisoshi.karta.modules.invitation.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.invitation.dto.CreateInvitationRequest;
import com.bisoshi.karta.modules.invitation.dto.InvitationResponse;
import com.bisoshi.karta.modules.invitation.service.InvitationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Invitation Management", description = "Endpoints for invitation management")
public class InvitationController {

    private final InvitationService invitationService;

    @GetMapping("/api/v1/invitations")
    @Operation(summary = "Get my invitations", description = "Get invitations for current user")
    public ResponseEntity<ResponseDto<List<InvitationResponse>>> getMyInvitations(Authentication authentication) {
        List<InvitationResponse> invitations = invitationService.getMyInvitations(authentication);
        return ResponseEntity.ok(ResponseDto.success("My invitations retrieved successfully", invitations));
    }

    @GetMapping("/api/v1/projects/{projectId}/invitations")
    @Operation(summary = "Get all invitations for a project", description = "Get all invitations for a project")
    public ResponseEntity<ResponseDto<List<InvitationResponse>>> getProjectInvitations(
            @PathVariable @NonNull UUID projectId, Authentication authentication) {
        List<InvitationResponse> invitations = invitationService.getProjectInvitations(projectId, authentication);
        return ResponseEntity.ok(ResponseDto.success("Invitations retrieved successfully", invitations));
    }

    @PostMapping("/api/v1/projects/{projectId}/invitations")
    @Operation(summary = "Create invitation to a project", description = "Create invitation to a project")
    public ResponseEntity<ResponseDto<InvitationResponse>> createInvitation(@PathVariable @NonNull UUID projectId,
            @Valid @RequestBody CreateInvitationRequest request, Authentication authentication) {
        InvitationResponse invitation = invitationService.createInvitation(projectId, request, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.INVITATION_CREATED_SUCCESSFULLY, invitation));
    }

    @PostMapping("/api/v1/projects/{projectId}/invitations/{id}/accept")
    @Operation(summary = "Accept invitation", description = "Accept invitation")
    public ResponseEntity<ResponseDto<InvitationResponse>> acceptInvitation(@PathVariable @NonNull UUID projectId,
            @PathVariable @NonNull UUID id, Authentication authentication) {
        InvitationResponse invitation = invitationService.acceptInvitation(id, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.INVITATION_ACCEPTED_SUCCESSFULLY, invitation));
    }

    @PostMapping("/api/v1/projects/{projectId}/invitations/{id}/reject")
    @Operation(summary = "Reject invitation", description = "Reject invitation")
    public ResponseEntity<ResponseDto<Void>> rejectInvitation(@PathVariable @NonNull UUID projectId,
            @PathVariable @NonNull UUID id, Authentication authentication) {
        invitationService.rejectInvitation(id, authentication);
        return ResponseEntity.ok(ResponseDto.success("Invitation rejected successfully"));
    }
}
