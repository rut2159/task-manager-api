import { Request, Reply } from 'fastify';
import Task from '../models/Task';

// שליפת כל המשימות
export const getAllTasks = async (req: Request, reply: Reply) => {
    const tasks = await Task.find();
    return tasks;
};

// יצירת משימה חדשה
export const createTask = async (req: any, reply: Reply) => {
    const newTask = new Task(req.body);
    await newTask.save();
    return reply.code(201).send(newTask);
};