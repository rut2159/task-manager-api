import api from '../api/api';
import type { RegisterData, User } from '../types';

export const addEmployee = async (employeeData: RegisterData): Promise<User> => {
  const response = await api.post<User>('/admin/employees', employeeData);
  return response.data;
};
