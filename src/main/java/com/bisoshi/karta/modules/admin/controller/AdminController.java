package com.bisoshi.karta.modules.admin.controller;

import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.admin.dto.DashboardMetrics;
import com.bisoshi.karta.modules.admin.dto.ProjectSummary;
import com.bisoshi.karta.modules.admin.dto.UserActivity;
import com.bisoshi.karta.modules.admin.service.AdminService;
import com.bisoshi.karta.modules.auth.dto.UserResponse;
import com.bisoshi.karta.modules.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Endpoints for admin dashboard (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    private final UserService userService;
    
    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard metrics", description = "Retrieve dashboard metrics for admin")
    public ResponseEntity<ResponseDto<DashboardMetrics>> getDashboardMetrics() {
        DashboardMetrics metrics = adminService.getDashboardMetrics();
        return ResponseEntity.ok(ResponseDto.success("Dashboard metrics retrieved successfully", metrics));
    }
    
    @GetMapping("/activity")
    @Operation(summary = "Get user activity", description = "Retrieve user activity for admin")
    public ResponseEntity<ResponseDto<List<UserActivity>>> getUserActivity() {
        List<UserActivity> activity = adminService.getUserActivity();
        return ResponseEntity.ok(ResponseDto.success("User activity retrieved successfully", activity));
    }
    
    @GetMapping("/projects/summary")
    @Operation(summary = "Get project summary", description = "Retrieve project summary for admin")
    public ResponseEntity<ResponseDto<List<ProjectSummary>>> getProjectSummary() {
        List<ProjectSummary> summary = adminService.getProjectSummary();
        return ResponseEntity.ok(ResponseDto.success("Project summary retrieved successfully", summary));
    }
    
    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Get all users (admin only)")
    public ResponseEntity<ResponseDto<List<UserResponse>>> getUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ResponseDto.success("Users retrieved successfully", users));
    }
}
