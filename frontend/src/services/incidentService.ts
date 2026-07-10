import api from './api';
import type { Incident, CreateIncidentRequest } from 'src/types/incident';

export const incidentService = {
  getProjectIncidents: async (projectId: string): Promise<Incident[]> => {
    const response = await api.get<any>(`/projects/${projectId}/incidents`);
    return response.data.data;
  },

  createIncident: async (
    projectId: string,
    data: CreateIncidentRequest
  ): Promise<Incident> => {
    const response = await api.post<any>(`/projects/${projectId}/incidents`, data);
    return response.data.data;
  },
};
