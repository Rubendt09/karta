package com.bisoshi.karta.modules.invitation.service;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
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

        if (!canManageInvitations(project, userId, role)) {
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

    public InvitationResponse createInvitation(@NonNull UUID projectId, CreateInvitationRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (!canManageInvitations(project, userId, role)) {
            throw new IllegalArgumentException(AppConstants.PROJECT_ACCESS_DENIED);
        }

        // Check if user already exists
        User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (existingUser != null) {
            // User exists - check if already has access to project
            if (projectAccessRepository.findByProjectIdAndUserId(projectId, existingUser.getId()).isPresent()) {
                throw new IllegalArgumentException("User already has access to this project");
            }

            // Check if there's already a pending invitation for this user
            if (invitationRepository.findByEmailAndProjectId(request.getEmail(), projectId).isPresent()) {
                throw new IllegalArgumentException("Invitation already exists for this email and project");
            }

            // Create invitation record for existing user
            String temporaryPassword = generateRandomPassword(12);

            Invitation invitation = new Invitation();
            invitation.setEmail(request.getEmail());
            invitation.setProjectId(projectId);
            invitation.setInvitedBy(userId);
            invitation.setStatus(InvitationStatus.PENDIENTE);
            invitation.setTemporaryPassword(passwordEncoder.encode(temporaryPassword));
            invitation.setExpiresAt(java.time.LocalDateTime.now().plusDays(request.getExpirationDays()));
            invitation.setCanView(request.getCanView() != null ? request.getCanView() : true);
            invitation.setCanEdit(request.getCanEdit() != null ? request.getCanEdit() : false);
            invitation.setCanDelete(request.getCanDelete() != null ? request.getCanDelete() : false);
            invitation.setCanDeprioritize(request.getCanDeprioritize() != null ? request.getCanDeprioritize() : false);
            invitation.setCanInvite(request.getCanInvite() != null ? request.getCanInvite() : false);

            invitation = invitationRepository.save(invitation);

            // TODO: Enviar email notificando que fue invitado al proyecto
            System.out.println("Invitation sent to existing user " + request.getEmail());

            return mapToInvitationResponse(invitation);
        } else {
            // User doesn't exist - create new user with random password
            String randomPassword = generateRandomPassword(12);

            User newUser = new User();
            newUser.setEmail(request.getEmail());
            newUser.setPasswordHash(passwordEncoder.encode(randomPassword));
            newUser.setName(request.getEmail().split("@")[0]);
            newUser.setRole(Role.INVITADO);
            newUser.setActive(true);

            newUser = userRepository.save(newUser);

            // Create invitation record for new user
            Invitation invitation = new Invitation();
            invitation.setEmail(request.getEmail());
            invitation.setProjectId(projectId);
            invitation.setInvitedBy(userId);
            invitation.setStatus(InvitationStatus.PENDIENTE);
            invitation.setTemporaryPassword(passwordEncoder.encode(randomPassword));
            invitation.setExpiresAt(java.time.LocalDateTime.now().plusDays(request.getExpirationDays()));
            invitation.setCanView(request.getCanView() != null ? request.getCanView() : true);
            invitation.setCanEdit(request.getCanEdit() != null ? request.getCanEdit() : false);
            invitation.setCanDelete(request.getCanDelete() != null ? request.getCanDelete() : false);
            invitation.setCanDeprioritize(request.getCanDeprioritize() != null ? request.getCanDeprioritize() : false);
            invitation.setCanInvite(request.getCanInvite() != null ? request.getCanInvite() : false);

            invitation = invitationRepository.save(invitation);

            // TODO: Enviar email con la contraseña temporal
            System.out.println("New user created. Password for " + request.getEmail() + ": " + randomPassword);

            return mapToInvitationResponse(invitation);
        }
    }

    public InvitationResponse acceptInvitation(@NonNull UUID id, Authentication authentication) {
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        String email = authentication.getName();

        if (!invitation.getEmail().equals(email)) {
            throw new IllegalArgumentException("Email does not match invitation");
        }

        if (invitation.getStatus() != InvitationStatus.PENDIENTE) {
            throw new IllegalArgumentException("Invitation is not pending");
        }

        if (invitation.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Invitation has expired");
        }

        // Find user by email (user should already exist)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create project access with invitation permissions
        ProjectAccess projectAccess = new ProjectAccess();
        projectAccess.setProjectId(invitation.getProjectId());
        projectAccess.setUserId(user.getId());
        projectAccess.setCanView(invitation.getCanView() != null ? invitation.getCanView() : true);
        projectAccess.setCanEdit(invitation.getCanEdit() != null ? invitation.getCanEdit() : false);
        projectAccess.setCanDelete(invitation.getCanDelete() != null ? invitation.getCanDelete() : false);
        projectAccess.setCanDeprioritize(invitation.getCanDeprioritize() != null ? invitation.getCanDeprioritize() : false);
        projectAccess.setCanInvite(invitation.getCanInvite() != null ? invitation.getCanInvite() : false);
        projectAccess.setGrantedBy(invitation.getInvitedBy());

        projectAccessRepository.save(projectAccess);

        // Update invitation status
        invitation.setStatus(InvitationStatus.ACEPTADA);
        invitationRepository.save(invitation);

        return mapToInvitationResponse(invitation);
    }

    @SuppressWarnings("null")
    public void rejectInvitation(@NonNull UUID id, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        Role role = getRoleFromAuthentication(authentication);

        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        Project project = projectRepository.findById(invitation.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PROJECT_NOT_FOUND));

        if (!canManageInvitations(project, userId, role) && !invitation.getInvitedBy().equals(userId)) {
            throw new IllegalArgumentException(AppConstants.ACCESS_DENIED);
        }

        invitation.setStatus(InvitationStatus.RECHAZADA);
        invitationRepository.save(invitation);
    }

    private boolean canManageInvitations(Project project, UUID userId, Role role) {
        if (role == Role.ADMIN || project.getOwnerId().equals(userId)) {
            return true;
        }
        return projectAccessRepository.findByProjectIdAndUserId(project.getId(), userId)
                .map(ProjectAccess::getCanInvite)
                .orElse(false);
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
                invitation.getCreatedAt(),
                invitation.getCanView(),
                invitation.getCanEdit(),
                invitation.getCanDelete(),
                invitation.getCanDeprioritize(),
                invitation.getCanInvite());
    }
}
