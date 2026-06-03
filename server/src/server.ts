import fastify from 'fastify';
import cors from '@fastify/cors';
import { connectDB } from './db/connect';
import { taskRoutes } from './routes/TaskRouter'; // ייבוא הראוטים

const server = fastify({ logger: true });

server.register(cors, { origin: '*' });


// כאן אנחנו רושמים את הראוטים שלנו
server.register(taskRoutes);

const start = async () => {
  await connectDB();
  await server.listen({ port: 3000 });
};

start();