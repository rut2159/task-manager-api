import api from '../api/api';
import type { Task } from '../types';

/**
 * שליפת כל המשימות המתאימות ללוגיד הנוכחי
 * - Manager רואה הכל
 * - Team Lead רואה משימות של הפיתחוים שלו
 * - Developer רואה רק משימות שלו
 */
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks');
  return response.data;
};

/**
 * שליפת משימה ספציפית לפי ID
 * @param taskId - ID של המשימה
 */
export const getTaskById = async (taskId: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${taskId}`);
  return response.data;
};

/**
 * יצירת משימה חדשה
 * רק Manager ו-Team Lead יכולים ליצור משימות
 * @param taskData - פרטי המשימה (title, description, assignedTo)
 */
export const createTask = async (taskData: {
  title: string;
  description?: string;
  assignedTo: string;
}): Promise<Task> => {
  const response = await api.post<Task>('/tasks', taskData);
  return response.data;
};

/**
 * עדכון משימה
 * - Manager יכול לעדכן הכל
 * - Team Lead יכול לעדכן משימות של הפיתחוים שלהם
 * - Developer יכול לעדכן רק את הסטטוס
 * @param taskId - ID של המשימה
 * @param updateData - הנתונים לעדכון
 */
export const updateTask = async (
  taskId: string,
  updateData: {
    title?: string;
    description?: string;
    status?: 'pending' | 'in-progress' | 'completed';
    assignedTo?: string;
  }
): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${taskId}`, updateData);
  return response.data;
};

/**
 * עדכון סטטוס משימה
 * Developers יכולים להשתמש בפונקציה זו כדי לעדכן רק את הסטטוס
 * @param taskId - ID של המשימה
 * @param status - הסטטוס החדש
 */
export const updateTaskStatus = async (
  taskId: string,
  status: 'pending' | 'in-progress' | 'completed'
): Promise<Task> => {
  return updateTask(taskId, { status });
};

/**
 * מחיקת משימה
 * רק Manager יכול למחוק משימות
 * @param taskId - ID של המשימה למחיקה
 */
export const deleteTask = async (taskId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/tasks/${taskId}`);
  return response.data;
};
