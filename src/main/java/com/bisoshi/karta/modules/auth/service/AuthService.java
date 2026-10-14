package com.bisoshi.karta.modules.auth.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.audit.dto.ActivityLogRequest;
import com.bisoshi.karta.modules.audit.service.ActivityLogService;
import com.bisoshi.karta.modules.auth.dto.ChangePasswordRequest;
import com.bisoshi.karta.modules.auth.dto.ForgotPasswordRequest;
import com.bisoshi.karta.modules.auth.dto.LoginRequest;
import com.bisoshi.karta.modules.auth.dto.LoginResponse;
import com.bisoshi.karta.modules.auth.dto.RegisterInvitedRequest;
import com.bisoshi.karta.modules.auth.dto.ResetPasswordRequest;
import com.bisoshi.karta.modules.auth.dto.UpdateProfileRequest;
import com.bisoshi.karta.modules.auth.dto.UserResponse;
import com.bisoshi.karta.modules.auth.dto.VerifyResetCodeRequest;
import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private static final int RESET_CODE_EXPIRATION_MINUTES = 15;
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ActivityLogService activityLogService;
    
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException(AppConstants.INVALID_CREDENTIALS));
        
        String token = jwtService.generateToken(user);

        activityLogService.log(ActivityLogRequest.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .action("LOGIN")
                .module("AUTH")
                .entityId(user.getId())
                .entityName(user.getName())
                .description("Inició sesión en el sistema")
                .build());
        
        return new LoginResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole());
    }
    
    public UserResponse registerInvitedUser(RegisterInvitedRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(AppConstants.EMAIL_ALREADY_EXISTS);
        }
        
        String temporaryPassword = generateRandomPassword(12);
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setName(request.getName());
        user.setRole(Role.INVITADO);
        user.setActive(true);
        
        user = userRepository.save(user);
        
        // TODO: Enviar email con la contraseña temporal
        System.out.println("Temporary password for " + request.getEmail() + ": " + temporaryPassword);
        
        return mapToUserResponse(user);
    }
    
    public UserResponse getCurrentUser() {
        User user = getAuthenticatedUser();
        return mapToUserResponse(user);
    }

    public UserResponse updateCurrentUser(UpdateProfileRequest request) {
        User user = getAuthenticatedUser();

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(AppConstants.EMAIL_ALREADY_EXISTS);
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user = userRepository.save(user);

        return mapToUserResponse(user);
    }

    public void changePassword(ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException(AppConstants.PASSWORDS_DO_NOT_MATCH);
        }

        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException(AppConstants.CURRENT_PASSWORD_INCORRECT);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        activityLogService.log(ActivityLogRequest.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .action("PASSWORD_CHANGE")
                .module("AUTH")
                .entityId(user.getId())
                .entityName(user.getName())
                .description("Cambió su contraseña desde el perfil")
                .build());
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró una cuenta asociada al correo " + email));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new IllegalArgumentException(AppConstants.USER_INACTIVE);
        }

        String recoveryCode = generateRecoveryCode(6);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(RESET_CODE_EXPIRATION_MINUTES);

        user.setResetCode(passwordEncoder.encode(recoveryCode));
        user.setResetCodeExpiresAt(expiresAt);
        userRepository.save(user);

        // TODO: Enviar email con el código de recuperación
        log.info("==================================================");
        log.info("PASSWORD RECOVERY CODE FOR {}: {}", user.getEmail(), recoveryCode);
        log.info("Expires at: {} ({} minutes)", expiresAt, RESET_CODE_EXPIRATION_MINUTES);
        log.info("==================================================");
        System.out.println("==================================================");
        System.out.println("PASSWORD RECOVERY CODE FOR " + user.getEmail() + ": " + recoveryCode);
        System.out.println("Expires at: " + expiresAt + " (" + RESET_CODE_EXPIRATION_MINUTES + " minutes)");
        System.out.println("==================================================");

        activityLogService.log(ActivityLogRequest.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .action("PASSWORD_RESET_REQUEST")
                .module("AUTH")
                .entityId(user.getId())
                .entityName(user.getName())
                .description("Solicitó código de recuperación de contraseña para " + user.getEmail())
                .build());
    }

    public void verifyResetCode(VerifyResetCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));

        validateResetCode(user, request.getCode());
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException(AppConstants.PASSWORDS_DO_NOT_MATCH);
        }

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new IllegalArgumentException(AppConstants.USER_INACTIVE);
        }

        validateResetCode(user, request.getCode());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetCode(null);
        user.setResetCodeExpiresAt(null);
        userRepository.save(user);

        log.info("Password successfully reset for user: {}", user.getEmail());

        activityLogService.log(ActivityLogRequest.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .action("PASSWORD_RESET")
                .module("AUTH")
                .entityId(user.getId())
                .entityName(user.getName())
                .description("Restableció su contraseña mediante código de recuperación")
                .build());
    }

    private void validateResetCode(User user, String rawCode) {
        if (user.getResetCode() == null || user.getResetCodeExpiresAt() == null) {
            throw new IllegalArgumentException(AppConstants.INVALID_OR_EXPIRED_RESET_CODE);
        }

        if (user.getResetCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(AppConstants.INVALID_OR_EXPIRED_RESET_CODE);
        }

        if (rawCode == null || !passwordEncoder.matches(rawCode.trim().toUpperCase(), user.getResetCode())) {
            throw new IllegalArgumentException(AppConstants.INVALID_OR_EXPIRED_RESET_CODE);
        }
    }

    private User getAuthenticatedUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException(AppConstants.USER_NOT_FOUND);
        }
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException(AppConstants.USER_NOT_FOUND));
    }

    private String generateRecoveryCode(int length) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < length; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }

        return code.toString();
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
    
    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
