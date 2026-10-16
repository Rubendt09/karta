import api from './api';
import type {
  Survey,
  SurveyAssignment,
  AdminSurveyAssignment,
  SubmitSurveyRequest,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  AssignSurveyRequest,
} from 'src/types/survey';

export const surveyService = {
  // Get current user's survey assignments
  getMySurveys: async (): Promise<SurveyAssignment[]> => {
    const response = await api.get<any>('/surveys');
    return response.data.data;
  },

  // Get a single survey assignment (with the form to answer)
  getSurveyAssignment: async (assignmentId: string): Promise<SurveyAssignment> => {
    const response = await api.get<any>(`/surveys/${assignmentId}`);
    return response.data.data;
  },

  // Submit survey responses
  submitSurvey: async (assignmentId: string, data: SubmitSurveyRequest): Promise<SurveyAssignment> => {
    const response = await api.post<any>(`/surveys/${assignmentId}/respond`, data);
    return response.data.data;
  },

  // --- Admin ---

  // Get all surveys (admin)
  getAllSurveys: async (): Promise<Survey[]> => {
    const response = await api.get<any>('/admin/surveys');
    return response.data.data;
  },

  // Get survey results and user assignments (admin)
  getSurveyResults: async (surveyId: string): Promise<AdminSurveyAssignment[]> => {
    const response = await api.get<any>(`/admin/surveys/${surveyId}/results`);
    return response.data.data;
  },

  // Create a survey (admin)
  createSurvey: async (data: CreateSurveyRequest): Promise<Survey> => {
    const response = await api.post<any>('/admin/surveys', data);
    return response.data.data;
  },

  // Update a survey (admin)
  updateSurvey: async (surveyId: string, data: UpdateSurveyRequest): Promise<Survey> => {
    const response = await api.put<any>(`/admin/surveys/${surveyId}`, data);
    return response.data.data;
  },

  // Delete a survey and all its assignments/results (admin)
  deleteSurvey: async (surveyId: string): Promise<void> => {
    await api.delete(`/admin/surveys/${surveyId}`);
  },

  // Assign a survey to all or specific users (admin)
  assignSurvey: async (surveyId: string, data: AssignSurveyRequest): Promise<number> => {
    const response = await api.post<any>(`/admin/surveys/${surveyId}/assign`, data);
    return response.data.data;
  },

  // Assign a survey to all active users (admin)
  assignSurveyToAllUsers: async (surveyId: string): Promise<number> => {
    const response = await api.post<any>(`/admin/surveys/${surveyId}/assign-all`);
    return response.data.data;
  },
};
