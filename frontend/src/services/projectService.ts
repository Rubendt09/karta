import api from './api';
import type {
  Project,
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ChangeProjectStatusRequest,
} from 'src/types/project';

export const projectService = {
  // Get all projects (filtered by user role)
  getProjects: async (): Promise<ProjectResponse[]> => {
    const response = await api.get<any>('/projects');
    return response.data.data;
  },

  // Get project by ID
  getProjectById: async (id: string): Promise<ProjectResponse> => {
    const response = await api.get<any>(`/projects/${id}`);
    return response.data.data;
  },

  // Create project (ASESOR/ADMIN)
  createProject: async (data: CreateProjectRequest): Promise<ProjectResponse> => {
    const response = await api.post<any>('/projects', data);
    return response.data.data;
  },

  // Update project (owner/ADMIN)
  updateProject: async (id: string, data: UpdateProjectRequest): Promise<ProjectResponse> => {
    const response = await api.put<any>(`/projects/${id}`, data);
    return response.data.data;
  },

  // Delete project (owner/ADMIN)
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Change project status
  changeProjectStatus: async (
    id: string,
    data: ChangeProjectStatusRequest
  ): Promise<ProjectResponse> => {
    const response = await api.put<any>(`/projects/${id}/status`, data);
    return response.data.data;
  },
};
