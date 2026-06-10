import api from './api';
import type {
  Invitation,
  InvitationResponse,
  CreateInvitationRequest,
  AcceptInvitationRequest,
} from 'src/types/invitation';

export const invitationService = {
  // Get current user's invitations
  getMyInvitations: async (): Promise<InvitationResponse[]> => {
    const response = await api.get<any>('/invitations');
    return response.data.data;
  },

  // Create invitation
  createInvitation: async (data: CreateInvitationRequest): Promise<InvitationResponse> => {
    const response = await api.post<any>('/invitations', data);
    return response.data.data;
  },

  // Accept invitation
  acceptInvitation: async (id: string, data: AcceptInvitationRequest): Promise<void> => {
    await api.post(`/invitations/${id}/accept`, data);
  },

  // Reject invitation
  rejectInvitation: async (id: string): Promise<void> => {
    await api.post(`/invitations/${id}/reject`);
  },

  // Get invitations for a project
  getProjectInvitations: async (projectId: string): Promise<InvitationResponse[]> => {
    const response = await api.get<any>(`/projects/${projectId}/invitations`);
    return response.data.data;
  },
};
