import api from '../api/api';
import type { User, CreateEmployeeData, UpdateEmployeeData } from '../types';

/**
 * הוספת עובד חדש
 * @param employeeData - פרטי העובד החדש (שם, אימייל, תפקיד, teamLeadId אם developer)
 */
export const addEmployee = async (employeeData: CreateEmployeeData): Promise<User> => {
  const response = await api.post<User>('/admin/employees', employeeData);
  return response.data;
};

/**
 * שליפת כל העובדים בסיסטם
 */
export const getAllEmployees = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/admin/employees');
  return response.data;
};

/**
 * שליפת עובדים תחת Team Lead מסוים
 * @param teamLeadId - ID של ה-Team Lead
 */
export const getEmployeesByTeamLead = async (teamLeadId: string): Promise<User[]> => {
  const response = await api.get<User[]>(`/admin/employees/team/${teamLeadId}`);
  return response.data;
};

/**
 * עדכון עובד קיים
 * @param employeeId - ID של העובד
 * @param employeeData - הנתונים לעדכון
 */
export const updateEmployee = async (
  employeeId: string,
  employeeData: UpdateEmployeeData
): Promise<User> => {
  const response = await api.put<User>(`/admin/employees/${employeeId}`, employeeData);
  return response.data;
};

/**
 * מחיקת עובד
 * @param employeeId - ID של העובד למחיקה
 */
export const deleteEmployee = async (employeeId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/admin/employees/${employeeId}`);
  return response.data;
};
