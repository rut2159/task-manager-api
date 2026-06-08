import { FastifyInstance } from 'fastify';
import * as adminController from '../controllers/adminController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

export async function adminRoutes(server: FastifyInstance) {
  server.post(
    '/employees',
    {
      preHandler: [authenticateJWT, authorizeRoles('admin')],
    },
    adminController.addEmployee
  );
}
