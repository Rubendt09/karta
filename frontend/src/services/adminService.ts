import api from './api';

export interface DashboardMetrics {
  totalUsers: number;
  totalProjects: number;
  totalDocuments: number;
  storageUsed: number;
}

export interface UserActivity {
  userId: string;
  email: string;
  actionCount: number;
  lastActivity: string;
}

export interface ProjectSummary {
  projectId: string;
  name: string;
  documentCount: number;
  accessCount: number;
  createdAt: string;
}

export const adminService = {
  // Get dashboard metrics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get<any>('/admin/dashboard');
    return response.data.data;
  },

  // Get user activity summary
  getUserActivity: async (): Promise<UserActivity[]> => {
    const response = await api.get<any>('/admin/activity');
    return response.data.data;
  },

  // Get user activity (alias used by audit view)
  getActivity: async (): Promise<UserActivity[]> => {
    const response = await api.get<any>('/admin/activity');
    return response.data.data;
  },

  // Get project summary
  getProjectSummary: async (): Promise<ProjectSummary[]> => {
    const response = await api.get<any>('/admin/projects/summary');
    return response.data.data;
  },
};
