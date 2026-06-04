import { FastifyRequest, FastifyReply } from 'fastify';
import Task from '../models/Task';

// 1. הגדרת השדות הצפויים בגוף הבקשה (Body)
interface TaskBody {
  title?: string;
  description?: string;
  completed?: boolean;
}

// 2. הגדרת הפרמטרים הצפויים ב-URL (כמו ה-ID של המשימה)
interface TaskParams {
  id: string;
}

// שליפת כל המשימות
export const getAllTasks = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const tasks = await Task.find();
    return reply.code(200).send(tasks);
  } catch (error) {
    return reply.code(500).send({ error: 'Server error while fetching tasks' });
  }
};

// יצירת משימה חדשה
export const createTask = async (req: FastifyRequest<{ Body: TaskBody }>, reply: FastifyReply) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    return reply.code(201).send(newTask);
  } catch (error) {
    return reply.code(500).send({ error: 'Server error while creating task' });
  }
};

// עדכון משימה קיימת (לפי ID)
export const updateTask = async (
  req: FastifyRequest<{ Params: TaskParams; Body: TaskBody }>, 
  reply: FastifyReply
) => {
  try {
    const { id } = req.params;

    // עדכון המשימה והחזרת האובייקט החדש המעודכן ({ new: true })
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedTask) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    return reply.code(200).send(updatedTask);
  } catch (error) {
    return reply.code(500).send({ error: 'Server error while updating task' });
  }
};

// מחיקת משימה (לפי ID)
export const deleteTask = async (req: FastifyRequest<{ Params: TaskParams }>, reply: FastifyReply) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    return reply.code(200).send({ message: 'Task deleted successfully!' });
  } catch (error) {
    return reply.code(500).send({ error: 'Server error while deleting task' });
  }
};