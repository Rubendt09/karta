import { API_URL } from './api';

// ----------------------------------------------------------------------

export interface ChatHistoryEntry {
  role: 'user' | 'bot';
  content: string;
}

export interface SendMessageOptions {
  projectId: string;
  message: string;
  documentIds: string[];
  history: ChatHistoryEntry[];
  onText: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

// ----------------------------------------------------------------------

export const chatService = {
  sendMessage: async (options: SendMessageOptions): Promise<void> => {
    const { projectId, message, documentIds, history, onText, onComplete, onError } = options;

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${API_URL}/projects/${projectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          documentIds,
          history: history.map((entry) => ({ role: entry.role, content: entry.content })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido');
        onError(`Error ${response.status}: ${errorText}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError('No se pudo leer la respuesta del servidor');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let lastEventName = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line) {
            lastEventName = '';
            continue;
          }
          if (line.startsWith('event:')) {
            lastEventName = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const payload = line.slice(5).trim();
            if (lastEventName === 'text') {
              onText(payload);
            } else if (lastEventName === 'complete') {
              onComplete();
            } else if (lastEventName === 'error') {
              onError(payload);
            }
          }
        }
      }

      if (lastEventName !== 'complete') {
        onComplete();
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error de conexión');
    }
  },
};
