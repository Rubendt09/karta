import api from './api';
import type {
  User,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  RegisterInvitedRequest,
} from 'src/types/user';

export const userService = {
  // Get all users (ADMIN only)
  getUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<any>('/admin/users');
    return response.data.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await api.get<any>(`/users/${id}`);
    return response.data.data;
  },

  // Create user (ADMIN only)
  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await api.post<any>('/users', data);
    return response.data.data;
  },

  // Update user (ADMIN only)
  updateUser: async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await api.put<any>(`/users/${id}`, data);
    return response.data.data;
  },

  // Deactivate user (ADMIN only) - soft delete
  deactivateUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Reactivate user (ADMIN only)
  reactivateUser: async (id: string): Promise<UserResponse> => {
    const response = await api.put<any>(`/users/${id}/reactivate`);
    return response.data.data;
  },

  // Register invited user
  registerInvited: async (data: RegisterInvitedRequest): Promise<UserResponse> => {
    const response = await api.post<any>('/auth/register-invited', data);
    return response.data.data;
  },
};
