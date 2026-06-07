package com.bisoshi.karta.modules.auth.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.modules.auth.dto.LoginRequest;
import com.bisoshi.karta.modules.auth.dto.LoginResponse;
import com.bisoshi.karta.modules.auth.dto.RegisterInvitedRequest;
import com.bisoshi.karta.modules.auth.dto.UserResponse;
import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import com.bisoshi.karta.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException(AppConstants.INVALID_CREDENTIALS));
        
        String token = jwtService.generateToken(user);
        
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
