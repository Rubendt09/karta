import api from './api';
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  RegisterInvitedRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
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

  // Get current authenticated user profile
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<any>('/auth/me');
    return response.data.data;
  },

  // Update current authenticated user profile
  updateCurrentUser: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    const response = await api.put<any>('/auth/me', data);
    return response.data.data;
  },

  // Change current authenticated user's password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put<any>('/auth/change-password', data);
  },
};
