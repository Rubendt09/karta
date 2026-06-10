export enum ProjectStatus {
  ACTIVO = 'ACTIVO',
  DESPRIORIZADO = 'DESPRIORIZADO',
  ARCHIVADO = 'ARCHIVADO',
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  documentCount?: number;
  accessCount?: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  status?: ProjectStatus;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface ChangeProjectStatusRequest {
  status: ProjectStatus;
}
