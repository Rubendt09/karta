package com.bisoshi.karta.modules.invitation.controller;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.invitation.dto.AcceptInvitationRequest;
import com.bisoshi.karta.modules.invitation.dto.CreateInvitationRequest;
import com.bisoshi.karta.modules.invitation.dto.InvitationResponse;
import com.bisoshi.karta.modules.invitation.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/invitations")
@RequiredArgsConstructor
@Tag(name = "Invitation Management", description = "Endpoints for invitation management")
public class InvitationController {
    
    private final InvitationService invitationService;
    
    @GetMapping
    @Operation(summary = "Get all invitations for a project", description = "Get all invitations for a project")
    public ResponseEntity<ResponseDto<List<InvitationResponse>>> getProjectInvitations(@PathVariable @NonNull UUID projectId, Authentication authentication) {
        List<InvitationResponse> invitations = invitationService.getProjectInvitations(projectId, authentication);
        return ResponseEntity.ok(ResponseDto.success("Invitations retrieved successfully", invitations));
    }
    
    @PostMapping
    @Operation(summary = "Create invitation to a project", description = "Create invitation to a project")
    public ResponseEntity<ResponseDto<InvitationResponse>> createInvitation(@PathVariable @NonNull UUID projectId, @Valid @RequestBody CreateInvitationRequest request, Authentication authentication) {
        InvitationResponse invitation = invitationService.createInvitation(projectId, request, authentication);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.INVITATION_CREATED_SUCCESSFULLY, invitation));
    }
    
    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept invitation", description = "Accept invitation")
    public ResponseEntity<ResponseDto<InvitationResponse>> acceptInvitation(@PathVariable @NonNull UUID projectId, @PathVariable @NonNull UUID id, @Valid @RequestBody AcceptInvitationRequest request) {
        InvitationResponse invitation = invitationService.acceptInvitation(id, request);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.INVITATION_ACCEPTED_SUCCESSFULLY, invitation));
    }
    
    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject invitation", description = "Reject invitation")
    public ResponseEntity<ResponseDto<Void>> rejectInvitation(@PathVariable @NonNull UUID projectId, @PathVariable @NonNull UUID id, Authentication authentication) {
        invitationService.rejectInvitation(id, authentication);
        return ResponseEntity.ok(ResponseDto.success("Invitation rejected successfully"));
    }
}
