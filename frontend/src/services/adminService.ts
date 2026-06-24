import api from './api';

export interface DashboardMetrics {
  totalUsers: number;
  totalProjects: number;
  totalDocuments: number;
  storageUsed: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  module: string;
  entityId: string;
  entityName: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ProjectSummary {
  projectId: string;
  name: string;
  documentCount: number;
  accessCount: number;
  createdAt: string;
}

export type ActivityLogFilters = {
  startDate?: string;
  endDate?: string;
  userId?: string;
  module?: string;
  action?: string;
};

export const adminService = {
  // Get dashboard metrics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get<any>('/admin/dashboard');
    return response.data.data;
  },

  // Get activity logs with optional filters
  getActivity: async (filters?: ActivityLogFilters): Promise<ActivityLog[]> => {
    const response = await api.get<any>('/admin/activity', { params: filters });
    return response.data.data;
  },

  // Get project summary
  getProjectSummary: async (): Promise<ProjectSummary[]> => {
    const response = await api.get<any>('/admin/projects/summary');
    return response.data.data;
  },
};
