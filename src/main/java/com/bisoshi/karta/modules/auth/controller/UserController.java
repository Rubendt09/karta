package com.bisoshi.karta.modules.auth.controller;

import com.bisoshi.karta.common.constants.AppConstants;
import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.auth.dto.RegisterRequest;
import com.bisoshi.karta.modules.auth.dto.UserResponse;
import com.bisoshi.karta.modules.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for user management (Admin only)")

@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users", description = "Get all users")
    public ResponseEntity<ResponseDto<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ResponseDto.success("Users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Get user by ID")
    public ResponseEntity<ResponseDto<UserResponse>> getUserById(@PathVariable @NonNull UUID id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ResponseDto.success("User retrieved successfully", user));
    }

    @PostMapping
    @Operation(summary = "Create new user", description = "Create new user")
    public ResponseEntity<ResponseDto<UserResponse>> createUser(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.USER_CREATED_SUCCESSFULLY, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Update user")
    public ResponseEntity<ResponseDto<UserResponse>> updateUser(@PathVariable @NonNull UUID id,
            @Valid @RequestBody RegisterRequest request) {
        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.USER_UPDATED_SUCCESSFULLY, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user (deactivate)", description = "Delete user (deactivate)")
    public ResponseEntity<ResponseDto<Void>> deleteUser(@PathVariable @NonNull UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ResponseDto.success(AppConstants.USER_DELETED_SUCCESSFULLY));
    }
}
