package com.bisoshi.karta.modules.invitation.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.modules.invitation.dto.AcceptInvitationRequest;
import com.bisoshi.karta.modules.invitation.dto.CreateInvitationRequest;
import com.bisoshi.karta.modules.invitation.dto.InvitationResponse;
import com.bisoshi.karta.modules.invitation.model.Invitation;
import com.bisoshi.karta.modules.invitation.model.InvitationStatus;
import com.bisoshi.karta.modules.invitation.repository.InvitationRepository;
import com.bisoshi.karta.modules.permission.model.ProjectAccess;
import com.bisoshi.karta.modules.permission.repository.ProjectAccessRepository;
import com.bisoshi.karta.modules.project.model.Project;
import com.bisoshi.karta.modules.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvitationService {
    
    private final InvitationRepository invitationRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAccessRepository projectAccessRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public List<InvitationResponse> getProjectInvitations(@NonNull UUID projectId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        return invitationRepository.findByProjectId(projectId).stream()
                .map(this::mapToInvitationResponse)
                .collect(Collectors.toList());
    }
    
    public List<InvitationResponse> getMyInvitations(Authentication authentication) {
        String email = authentication.getName();
        return invitationRepository.findByEmail(email).stream()
                .map(this::mapToInvitationResponse)
                .collect(Collectors.toList());
    }
    
    public InvitationResponse createInvitation(@NonNull UUID projectId, CreateInvitationRequest request, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));
        
        if (role != Role.ADMIN && !project.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }
        
        if (invitationRepository.findByEmailAndProjectId(request.getEmail(), projectId).isPresent()) {
            throw new IllegalArgumentException("Invitation already exists for this email and project");
        }
        
        String temporaryPassword = generateRandomPassword(12);
        
        Invitation invitation = new Invitation();
        invitation.setEmail(request.getEmail());
        invitation.setProjectId(projectId);
        invitation.setInvitedBy(userId);
        invitation.setStatus(InvitationStatus.PENDIENTE);
        invitation.setTemporaryPassword(passwordEncoder.encode(temporaryPassword));
        
        invitation = invitationRepository.save(invitation);
        
        // TODO: Enviar email con la contraseña temporal
        System.out.println("Temporary password for " + request.getEmail() + ": " + temporaryPassword);
        
        return mapToInvitationResponse(invitation);
    }
    
    public InvitationResponse acceptInvitation(@NonNull UUID id, AcceptInvitationRequest request) {
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
        
        if (!invitation.getEmail().equals(request.getEmail())) {
            throw new IllegalArgumentException("Email does not match invitation");
        }
        
        if (!passwordEncoder.matches(request.getTemporaryPassword(), invitation.getTemporaryPassword())) {
            throw new IllegalArgumentException("Invalid temporary password");
        }
        
        if (invitation.getStatus() != InvitationStatus.PENDIENTE) {
            throw new IllegalArgumentException("Invitation is not pending");
        }
        
        if (invitation.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Invitation has expired");
        }
        
        // Crear usuario
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setName(request.getEmail().split("@")[0]);
        user.setRole(Role.INVITADO);
        user.setActive(true);
        
        user = userRepository.save(user);
        
        // Crear acceso al proyecto
        ProjectAccess projectAccess = new ProjectAccess();
        projectAccess.setProjectId(invitation.getProjectId());
        projectAccess.setUserId(user.getId());
        projectAccess.setCanView(true);
        projectAccess.setCanEdit(false);
        projectAccess.setCanDelete(false);
        projectAccess.setCanDeprioritize(false);
        projectAccess.setCanInvite(false);
        projectAccess.setGrantedBy(invitation.getInvitedBy());
        
        projectAccessRepository.save(projectAccess);
        
        // Actualizar estado de la invitación
        invitation.setStatus(InvitationStatus.ACEPTADA);
        invitationRepository.save(invitation);
        
        return mapToInvitationResponse(invitation);
    }
    
    public void rejectInvitation(@NonNull UUID id, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
        
        if (!invitation.getInvitedBy().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.ACCESS_DENIED);
        }
        
        invitation.setStatus(InvitationStatus.RECHAZADA);
        invitationRepository.save(invitation);
    }
    
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return password.toString();
    }
    
    private UUID getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        return user.getId();
    }
    
    private Role getRoleFromAuthentication(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> {
                    String roleName = authority.getAuthority();
                    if (roleName.startsWith("ROLE_")) {
                        return Role.valueOf(roleName.substring(5));
                    }
                    return Role.valueOf(roleName);
                })
                .orElse(Role.INVITADO);
    }
    
    private InvitationResponse mapToInvitationResponse(Invitation invitation) {
        return new InvitationResponse(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getProjectId(),
                invitation.getInvitedBy(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                invitation.getCreatedAt()
        );
    }
}
