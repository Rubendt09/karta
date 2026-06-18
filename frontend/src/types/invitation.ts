export enum InvitationStatus {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
}

export interface Invitation {
  id: string;
  email: string;
  projectId: string;
  projectName?: string;
  invitedBy: string;
  invitedByName?: string;
  status: InvitationStatus;
  temporaryPassword?: string;
  expiresAt: string;
  createdAt: string;
  permissions?: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canDeprioritize: boolean;
    canInvite: boolean;
  };
}

export interface InvitationResponse {
  id: string;
  email: string;
  projectId: string;
  projectName?: string;
  invitedBy: string;
  invitedByName?: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  permissions?: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canDeprioritize: boolean;
    canInvite: boolean;
  };
}

export interface CreateInvitationRequest {
  email: string;
  projectId: string;
  message?: string;
  expirationDays?: number;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDeprioritize: boolean;
  canInvite: boolean;
}

export interface AcceptInvitationRequest {
  email: string;
  temporaryPassword: string;
  newPassword: string;
  name: string;
}
