export interface Incident {
  id: string;
  projectId: string;
  documentId: string;
  incidentType: string;
  reportedBy: string;
  reportedAt: string;
}

export interface CreateIncidentRequest {
  projectId: string;
  documentId: string;
  incidentType: string;
}
