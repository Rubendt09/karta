import api from './api';
import type {
  Document,
  DocumentResponse,
  UploadDocumentRequest,
  UpdateDocumentRequest,
} from 'src/types/document';

export const documentService = {
  // Get documents by project
  getDocumentsByProject: async (projectId: string): Promise<DocumentResponse[]> => {
    const response = await api.get<any>(`/projects/${projectId}/documents`);
    return response.data.data;
  },

  // Get document by ID
  getDocumentById: async (id: string): Promise<DocumentResponse> => {
    const response = await api.get<any>(`/documents/${id}`);
    return response.data.data;
  },

  // Upload document (multipart)
  uploadDocument: async (
    projectId: string,
    data: UploadDocumentRequest
  ): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('priority', data.priority);
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await api.post<any>(`/projects/${projectId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Download document
  downloadDocument: async (id: string): Promise<Blob> => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Update document metadata
  updateDocument: async (id: string, data: UpdateDocumentRequest): Promise<DocumentResponse> => {
    const response = await api.put<any>(`/documents/${id}`, data);
    return response.data.data;
  },

  // Delete document
  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};
