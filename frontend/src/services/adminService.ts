import api from './api';

export interface DashboardMetrics {
  totalUsers: number;
  totalProjects: number;
  totalDocuments: number;
  storageUsed: number;
  storageLimit: number;
}

export interface UserActivity {
  userId: string;
  userName: string;
  actionCount: number;
  lastActivity: string;
}

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  documentCount: number;
  accessCount: number;
  lastActivity: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details?: {
    ip?: string;
    userAgent?: string;
    parameters?: Record<string, any>;
  };
}

export const adminService = {
  // Get dashboard metrics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get<any>('/admin/dashboard');
    return response.data.data;
  },

  // Get activity logs
  getActivity: async (filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    module?: string;
  }): Promise<ActivityLog[]> => {
    const response = await api.get<any>('/admin/activity', { params: filters });
    return response.data.data;
  },

  // Get user activity summary
  getUserActivity: async (): Promise<UserActivity[]> => {
    const response = await api.get<any>('/admin/users/activity');
    return response.data.data;
  },

  // Get project summary
  getProjectSummary: async (): Promise<ProjectSummary[]> => {
    const response = await api.get<any>('/admin/projects/summary');
    return response.data.data;
  },
};
