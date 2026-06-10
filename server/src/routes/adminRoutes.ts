import { FastifyInstance } from 'fastify';
import * as adminController from '../controllers/adminController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

export async function adminRoutes(server: FastifyInstance) {
  // הוספת עובד חדש (רק מנהל)
  server.post(
    '/employees',
    {
      preHandler: [authenticateJWT, authorizeRoles('manager')],
    },
    adminController.addEmployee
  );

  // שליפת כל העובדים (רק מנהל)
  server.get(
    '/employees',
    {
      preHandler: [authenticateJWT, authorizeRoles('manager')],
    },
    adminController.getEmployees
  );

  // שליפת עובדים של Team Lead מסוים (מנהל או ה-Team Lead עצמו)
  server.get(
    '/employees/team/:teamLeadId',
    {
      preHandler: [authenticateJWT, authorizeRoles('manager', 'teamLead')],
    },
    adminController.getEmployeesByTeamLead
  );

  // עדכון עובד קיים (רק מנהל)
  server.put(
    '/employees/:employeeId',
    {
      preHandler: [authenticateJWT, authorizeRoles('manager')],
    },
    adminController.updateEmployee
  );

  // מחיקת עובד (רק מנהל)
  server.delete(
    '/employees/:employeeId',
    {
      preHandler: [authenticateJWT, authorizeRoles('manager')],
    },
    adminController.deleteEmployee
  );
}
