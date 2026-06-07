package com.bisoshi.karta.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetrics {
    private Long totalUsers;
    private Long totalProjects;
    private Long totalDocuments;
    private Long storageUsed;
}
