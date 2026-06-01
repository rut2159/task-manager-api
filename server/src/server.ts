import fastify from 'fastify';
import cors from '@fastify/cors';
import { connectDB } from './db/connect';
const server = fastify({ logger: true });

// רישום CORS (מאפשר ללקוח לדבר עם השרת)
server.register(cors, {
  origin: '*', // בהמשך נשנה את זה לדומיין של הלקוח בלבד
});

// מסלול בדיקה בסיסי
server.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await connectDB(); 
    await server.listen({ port: 3000 });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();