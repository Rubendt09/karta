package com.bisoshi.karta.modules.auth.service;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.exception.ResourceNotFoundException;
import com.bisoshi.karta.modules.audit.service.ActivityLogService;
import com.bisoshi.karta.modules.auth.dto.RegisterRequest;
import com.bisoshi.karta.modules.auth.dto.UserResponse;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }
    
    public UserResponse getUserById(@NonNull UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        return mapToUserResponse(user);
    }
    
    public UserResponse createUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(AppConstants.EMAIL_ALREADY_EXISTS);
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(request.getRole());
        user.setActive(true);
        
        user = userRepository.save(user);

        activityLogService.logCurrentUser("CREATE", "USER", user.getId(), user.getName(),
                "Creó el usuario " + user.getEmail() + " con rol " + user.getRole());
        
        return mapToUserResponse(user);
    }
    
    public UserResponse updateUser(@NonNull UUID id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(AppConstants.EMAIL_ALREADY_EXISTS);
        }
        
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        user.setName(request.getName());
        user.setRole(request.getRole());
        
        user = userRepository.save(user);

        activityLogService.logCurrentUser("UPDATE", "USER", user.getId(), user.getName(),
                "Actualizó el usuario " + user.getEmail());
        
        return mapToUserResponse(user);
    }
    
    public void deleteUser(@NonNull UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        user.setActive(false);
        userRepository.save(user);

        activityLogService.logCurrentUser("DELETE", "USER", user.getId(), user.getName(),
                "Desactivó el usuario " + user.getEmail());
    }

    public UserResponse reactivateUser(@NonNull UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        user.setActive(true);
        user = userRepository.save(user);

        activityLogService.logCurrentUser("UPDATE", "USER", user.getId(), user.getName(),
                "Reactivó el usuario " + user.getEmail());

        return mapToUserResponse(user);
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
