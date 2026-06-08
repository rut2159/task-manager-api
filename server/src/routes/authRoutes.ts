// server/src/routes/authRoutes.ts
import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';

export async function authRoutes(server: FastifyInstance) {
  // Debug middleware for auth routes
  server.addHook('preHandler', async (request, reply) => {
    if (request.url.includes('/login') || request.url.includes('/register') || request.url.includes('/me')) {
      console.log('\n📍 [authRoutes] Incoming request to:', request.method, request.url);
      console.log('📍 [authRoutes] Headers:', JSON.stringify(request.headers, null, 2));
      console.log('📍 [authRoutes] Body (raw):', request.body);
    }
  });

  server.post('/login', userController.login);
  server.post('/register', userController.register);
  server.get('/me', { preHandler: [authenticateJWT] }, userController.getMe);
}