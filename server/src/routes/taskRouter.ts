import { FastifyInstance } from 'fastify';
import * as taskController from '../controllers/TaskController';

export async function taskRoutes(server: FastifyInstance) {
    server.get('/', async (request, reply) => {
  return { message: "Welcome to the Task Manager API! Go to /tasks to see your tasks." };
});
  server.get('/tasks', taskController.getAllTasks);
  server.post('/tasks', taskController.createTask);
}