import fastify from 'fastify';
import cors from '@fastify/cors';
import { connectDB } from './db/connect';
  import { taskRoutes } from './routes/taskRouter'; 
import { userRoutes } from './routes/userRouter'; 

const server = fastify({ logger: true });

server.register(cors, { origin: '*' });


// כאן אנחנו רושמים את הראוטים שלנו
server.register(taskRoutes);
server.register(userRoutes);
server.register(userRoutes, { prefix: '/api' });
server.register(taskRoutes, { prefix: '/api' });
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