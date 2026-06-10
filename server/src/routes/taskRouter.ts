import { FastifyInstance } from 'fastify';
import * as taskController from '../controllers/taskController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

export async function taskRoutes(server: FastifyInstance) {
  
  // שליפת כל המשימות (מוגן - דורש התחברות בלבד)
  // מנהל רואה הכל, Team Lead רואה משימות של הפיתחוים שלהם, Developer רואה רק שלו
  server.get(
    '/', 
    { preHandler: [authenticateJWT] }, 
    taskController.getAllTasks
  );

  // שליפת משימה ספציפית לפי ID
  server.get(
    '/:id', 
    { preHandler: [authenticateJWT] }, 
    taskController.getTaskById
  );

  // יצירת משימה (מוגן - רק למנהלים ו-Team Leads)
  server.post(
    '/', 
    { preHandler: [authenticateJWT, authorizeRoles('manager', 'teamLead')] }, 
    taskController.createTask
  );

  // עדכון סטטוס משימה לפי מזהה (מוגן - Manager, Team Lead, Developer בהתאם להרשאות)
  server.put(
    '/:id', 
    { preHandler: [authenticateJWT] }, 
    taskController.updateTaskStatus
  );

  // מחיקת משימה לפי מזהה (מוגן - רק Manager יכול למחוק!)
  server.delete(
    '/:id', 
    { preHandler: [authenticateJWT, authorizeRoles('manager')] }, 
    taskController.deleteTask
  );
}