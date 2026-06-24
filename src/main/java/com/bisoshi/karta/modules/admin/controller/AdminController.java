package com.bisoshi.karta.modules.admin.controller;

import com.bisoshi.karta.common.dto.ResponseDto;
import com.bisoshi.karta.modules.admin.dto.DashboardMetrics;
import com.bisoshi.karta.modules.admin.dto.ProjectSummary;
import com.bisoshi.karta.modules.admin.service.AdminService;
import com.bisoshi.karta.modules.audit.dto.ActivityLogFilter;
import com.bisoshi.karta.modules.audit.dto.ActivityLogResponse;
import com.bisoshi.karta.modules.audit.service.ActivityLogService;
import com.bisoshi.karta.modules.auth.dto.UserResponse;
import com.bisoshi.karta.modules.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Endpoints for admin dashboard (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    private final UserService userService;
    private final ActivityLogService activityLogService;
    
    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard metrics", description = "Retrieve dashboard metrics for admin")
    public ResponseEntity<ResponseDto<DashboardMetrics>> getDashboardMetrics() {
        DashboardMetrics metrics = adminService.getDashboardMetrics();
        return ResponseEntity.ok(ResponseDto.success("Dashboard metrics retrieved successfully", metrics));
    }
    
    @GetMapping("/activity")
    @Operation(summary = "Get activity logs", description = "Retrieve activity logs for admin with optional filters")
    public ResponseEntity<ResponseDto<List<ActivityLogResponse>>> getActivityLogs(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        ActivityLogFilter filter = new ActivityLogFilter();
        filter.setUserId(userId);
        filter.setModule(module);
        filter.setAction(action);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        
        List<ActivityLogResponse> logs = activityLogService.getActivityLogs(filter);
        return ResponseEntity.ok(ResponseDto.success("Activity logs retrieved successfully", logs));
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
