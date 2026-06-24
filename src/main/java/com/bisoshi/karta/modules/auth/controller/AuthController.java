package com.bisoshi.karta.modules.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.auth.dto.ChangePasswordRequest;
import com.bisoshi.karta.modules.auth.dto.LoginRequest;
import com.bisoshi.karta.modules.auth.dto.LoginResponse;
import com.bisoshi.karta.modules.auth.dto.RegisterInvitedRequest;
import com.bisoshi.karta.modules.auth.dto.UpdateProfileRequest;
import com.bisoshi.karta.modules.auth.dto.UserResponse;
import com.bisoshi.karta.modules.auth.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for authentication and user registration")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Login user with email and password")
    public ResponseEntity<ResponseDto<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(ResponseDto.success("Login successful", response));
    }

    @PostMapping("/register-invited")
    @Operation(summary = "Register invited user withadmin temporary password", description = "Register invited user with temporary password")
    public ResponseEntity<ResponseDto<UserResponse>> registerInvited(
            @Valid @RequestBody RegisterInvitedRequest request) {
        UserResponse response = authService.registerInvitedUser(request);
        return ResponseEntity.ok(ResponseDto.success("Invited user registered successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get the authenticated user profile")
    public ResponseEntity<ResponseDto<UserResponse>> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ResponseDto.success("User profile retrieved successfully", response));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user", description = "Update the authenticated user profile")
    public ResponseEntity<ResponseDto<UserResponse>> updateCurrentUser(
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse response = authService.updateCurrentUser(request);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.PROFILE_UPDATED_SUCCESSFULLY, response));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change password", description = "Change the authenticated user's password")
    public ResponseEntity<ResponseDto<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.PASSWORD_CHANGED_SUCCESSFULLY));
    }
}
