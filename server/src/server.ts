import fastify from 'fastify';
import cors from '@fastify/cors';
import { connectDB } from './db/connect';
import { taskRoutes } from './routes/taskRouter'; 
import { userRoutes } from './routes/userRouter'; 
import { authRoutes } from './routes/authRoutes'; 
import { adminRoutes } from './routes/adminRoutes'; 

const server = fastify({ logger: true });

server.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Debug: Log all incoming requests
server.addHook('preHandler', async (request, reply) => {
  console.log('\n🔵 [server.ts] Incoming request:', request.method, request.url);
  console.log('🔵 [server.ts] Content-Type:', request.headers['content-type']);
});

// רישום הראוטים בצורה מסודרת - כל אחד פעם אחת בלבד!
server.register(authRoutes, { prefix: '/api/auth' });
server.register(taskRoutes, { prefix: '/api/tasks' });
server.register(userRoutes, { prefix: '/api/users' });
server.register(adminRoutes, { prefix: '/api/admin' });

const start = async () => {
  try {
    await connectDB();
    await server.listen({ port: 3000 });
    console.log('🚀 Server is running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();