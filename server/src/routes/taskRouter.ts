import { FastifyInstance } from 'fastify';
import * as taskController from '../controllers/taskController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

export async function taskRoutes(server: FastifyInstance) {
  
  // שליפת כל המשימות (מוגן - דורש רק התחברות)
  server.get('/tasks', { preHandler: [authenticateJWT] }, taskController.getAllTasks);

  // יצירת משימה (מוגן - רק למנהלים/אדמינים)
  server.post(
    '/tasks', 
    { preHandler: [authenticateJWT, authorizeRoles('manager', 'admin')] }, 
    taskController.createTask
  );

  // עדכון משימה לפי מזהה (מוגן - דורש התחברות)
  server.put(
    '/tasks/:id', 
    { preHandler: [authenticateJWT] }, 
    taskController.updateTask
  );

  // מחיקת משימה לפי מזהה (מוגן - רק אדמין יכול למחוק!)
  server.delete(
    '/tasks/:id', 
    { preHandler: [authenticateJWT, authorizeRoles('admin')] }, 
    taskController.deleteTask
  );
}