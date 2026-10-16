export enum SurveyStatus {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  EXPIRADA = 'EXPIRADA',
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating';
  required?: boolean;
  section?: string;
}

export interface SurveySection {
  id: string;
  title: string;
  questions: SurveyQuestion[];
}

export interface SurveyFinalComment {
  enabled: boolean;
  label?: string;
  required?: boolean;
}

export interface SurveyForm {
  title: string;
  description?: string;
  scale?: Record<string, string>;
  sections?: SurveySection[];
  questions: SurveyQuestion[];
  finalComment?: SurveyFinalComment;
}

export interface Survey {
  id: string;
  name: string;
  description?: string;
  formJson: string;
  active: boolean;
  createdAt: string;
  totalAssigned?: number;
  completedCount?: number;
  pendingCount?: number;
}

export interface AdminSurveyAssignment {
  id: string;
  surveyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  status: SurveyStatus;
  assignedAt: string;
  completedAt?: string | null;
  responseJson?: string | null;
}

export interface SurveyAssignment {
  id: string;
  surveyId: string;
  surveyName: string;
  surveyDescription?: string;
  status: SurveyStatus;
  assignedAt: string;
  completedAt?: string | null;
  formJson: string;
  responseJson?: string | null;
}

export interface SubmitSurveyRequest {
  responseJson: string;
}

export interface CreateSurveyRequest {
  name: string;
  description?: string;
  formJson: string;
}

export interface UpdateSurveyRequest {
  name: string;
  description?: string;
  formJson: string;
  active?: boolean;
}

export interface AssignSurveyRequest {
  assignToAll: boolean;
  userIds?: string[];
}

export interface SurveyAnswers {
  answers: Record<string, number>;
  finalComment?: string;
}
