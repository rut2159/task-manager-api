import api from '../api/api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: RegisterData): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/register', userData);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};
