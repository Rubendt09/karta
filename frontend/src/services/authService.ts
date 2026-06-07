import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<any>('/auth/login', { email, password });
    console.log('Login response:', response.data);

    const loginData = response.data.data; // ResponseDto envuelve los datos

    if (loginData?.token) {
      localStorage.setItem('token', loginData.token);
      // Guardar los datos del usuario directamente desde loginData
      const userData = {
        userId: loginData.userId,
        email: loginData.email,
        name: loginData.name,
        role: loginData.role,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Token y usuario guardados en localStorage:', userData);
    } else {
      console.error('No se recibió token en la respuesta');
    }

    return loginData;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Siempre limpiar el localStorage aunque falle la petición
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: (): UserInfo | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined') {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  isAuthenticated: (): boolean => !!localStorage.getItem('token'),
};
