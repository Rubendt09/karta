export enum Role {
  ADMIN = 'ADMIN',
  ASESOR = 'ASESOR',
  INVITADO = 'INVITADO',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password?: string;
  role: Role;
}

export interface UpdateUserRequest {
  name?: string;
  role?: Role;
  active?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface RegisterInvitedRequest {
  email: string;
  name: string;
  temporaryPassword: string;
  newPassword: string;
}
