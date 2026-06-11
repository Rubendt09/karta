export enum Priority {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAJA = 'BAJA',
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  filePathStorage: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
  priority: Priority;
}

export interface DocumentResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
  priority: Priority;
}

export interface UploadDocumentRequest {
  file: File;
  name: string;
  priority: Priority;
  description?: string;
}

export interface UpdateDocumentRequest {
  name?: string;
  priority?: Priority;
  description?: string;
}
