import api from './api';
import type {
  ProjectAccess,
  ProjectAccessResponse,
  GrantAccessRequest,
  UpdateAccessRequest,
  UserPermissions,
} from 'src/types/permission';

export const permissionService = {
  // Get all access for a project
  getProjectAccess: async (projectId: string): Promise<ProjectAccessResponse[]> => {
    const response = await api.get<any>(`/projects/${projectId}/access`);
    return response.data.data;
  },

  // Grant access to a project
  grantAccess: async (projectId: string, data: GrantAccessRequest): Promise<ProjectAccessResponse> => {
    const response = await api.post<any>(`/projects/${projectId}/access`, data);
    return response.data.data;
  },

  // Update access permissions
  updateAccess: async (
    projectId: string,
    userId: string,
    data: UpdateAccessRequest
  ): Promise<ProjectAccessResponse> => {
    const response = await api.put<any>(`/projects/${projectId}/access/${userId}`, data);
    return response.data.data;
  },

  // Revoke access
  revokeAccess: async (projectId: string, userId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/access/${userId}`);
  },

  // Get current user's permissions for a project
  getUserPermissions: async (projectId: string): Promise<UserPermissions> => {
    const response = await api.get<any>(`/projects/${projectId}/access/me`);
    return response.data.data;
  },
};
