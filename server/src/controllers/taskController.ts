import { FastifyRequest, FastifyReply } from 'fastify';
import Task from '../models/Task';
import User from '../models/User';
import { canCreateTask, canAssignTaskTo, canViewTask } from '../middlewares/authMiddleware';
import mongoose from 'mongoose';

// helper to safely extract an id from either a populated object or a string
const extractId = (val: any): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val._id) return val._id.toString();
  try {
    return val.toString();
  } catch (e) {
    return null;
  }
};

// הגדרת הטיפוסים
interface TaskBody {
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
}

interface TaskParams {
  id: string;
}

interface TaskUpdateBody {
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
}

/**
 * שליפת משימות
 * מנהל רואה הכל, Team Lead רואה משימות של הפיתחוים שלהם, Developer רואה רק שלו
 */
export const getAllTasks = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return reply.code(401).send({ error: 'User not authenticated' });
    }

    let tasks;

    if (userRole === 'manager') {
      // מנהל רואה את כל המשימות
      tasks = await Task.find()
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email role')
        .populate('assignedBy', 'name email role');
    } else if (userRole === 'teamLead') {
      // Team Lead רואה משימות של הפיתחוים שלו
      const developers = await User.find({ teamLeadId: userId, role: 'developer' });
      const developerIds = developers.map(d => d._id);

      tasks = await Task.find({
        $or: [
          { assignedTo: userId },
          { assignedTo: { $in: developerIds } },
        ],
      })
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email role')
        .populate('assignedBy', 'name email role');
    } else if (userRole === 'developer') {
      // Developer רואה רק משימות שהוקצו לו
      tasks = await Task.find({ assignedTo: userId })
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email role')
        .populate('assignedBy', 'name email role');
    } else {
      return reply.code(403).send({ error: 'Invalid user role' });
    }

    return reply.code(200).send(tasks);
  } catch (error) {
    console.error('[taskController] Error fetching tasks:', error);
    return reply.code(500).send({ error: 'Server error while fetching tasks' });
  }
};

/**
 * שליפת משימה ספציפית
 */
export const getTaskById = async (req: FastifyRequest<{ Params: TaskParams }>, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return reply.code(401).send({ error: 'User not authenticated' });
    }

    const task = await Task.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('assignedBy', 'name email role');

    if (!task) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    // בדיקה אם המשתמש יכול לראות את המשימה
    const assignedToId = extractId((task as any).assignedTo);
    const createdById = extractId((task as any).createdBy);

    // אם שדות החיוניים חסרים — רק מנהל יכול לגשת
    if ((!assignedToId || !createdById) && userRole !== 'manager') {
      return reply.code(403).send({ error: 'Permission denied or task missing assignee/creator' });
    }

    if (userRole !== 'manager') {
      if (!assignedToId || !createdById) {
        return reply.code(403).send({ error: 'Permission denied or task missing assignee/creator' });
      }

      const canView = await canViewTask(userId, userRole, assignedToId);
      if (!canView) {
        return reply.code(403).send({ error: 'Permission denied' });
      }
    }

    return reply.code(200).send(task);
  } catch (error) {
    console.error('[taskController] Error fetching task:', error);
    return reply.code(500).send({ error: 'Server error while fetching task' });
  }
};

/**
 * יצירת משימה חדשה
 * רק Manager ו-Team Lead יכולים ליצור משימות
 */
export const createTask = async (req: FastifyRequest<{ Body: TaskBody }>, reply: FastifyReply) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { title, description, assignedTo } = req.body;

    if (!userId || !userRole) {
      return reply.code(401).send({ error: 'User not authenticated' });
    }

    // בדיקה אם המשתמש יכול ליצור משימות
    if (!canCreateTask(userRole)) {
      return reply.code(403).send({ error: 'Only managers and team leads can create tasks' });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return reply.code(400).send({ error: 'Invalid assignee ID' });
    }

    const canAssign = await canAssignTaskTo(userId, userRole, assignedTo);
    if (!canAssign) {
      return reply.code(403).send({ 
        error: userRole === 'manager'
          ? 'Managers can only assign tasks to team leads.'
          : 'Team Leads can only assign tasks to their developers.'
      });
    }

    const newTask = new Task({
      title,
      description,
      status: 'pending',
      assignedTo: new mongoose.Types.ObjectId(assignedTo),
      assignedBy: new mongoose.Types.ObjectId(userId),
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    console.log('[taskController] createTask before save:', {
      title,
      description,
      assignedTo,
      assignedBy: userId,
    });

    const savedTask = await newTask.save();
    console.log('[taskController] createTask savedTask id:', savedTask._id);

    await savedTask.populate('assignedTo', 'name email role');
    await savedTask.populate('createdBy', 'name email role');
    await savedTask.populate('assignedBy', 'name email role');

    return reply.code(201).send(savedTask);
  } catch (error) {
    console.error('[taskController] Error creating task:', error);
    return reply.code(500).send({ error: 'Server error while creating task' });
  }
};

interface TaskStatusBody {
  status: 'pending' | 'in-progress' | 'completed';
}

/**
 * עדכון סטטוס משימה בלבד
 * רק המוקצה או המנהל/Team Lead שמינה יכולים לעדכן
 */
export const updateTaskStatus = async (
  req: FastifyRequest<{ Params: TaskParams; Body: TaskStatusBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return reply.code(401).send({ error: 'User not authenticated' });
    }

    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return reply.code(400).send({ error: 'Invalid status value' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    console.log('[taskController] updateTaskStatus req.user:', req.user);
    console.log('[taskController] updateTaskStatus task.assignedTo:', task.assignedTo);

    const assignedToId = extractId((task as any).assignedTo);
    const assignedById = extractId((task as any).assignedBy);

    if (!assignedToId || !assignedById) {
      return reply.code(400).send({ error: 'Task is missing assignment metadata' });
    }

    const assignee = await User.findById(assignedToId);
    console.log('[taskController] updateTaskStatus assignee:', assignee);

    const isAuthorized =
      userRole === 'manager' ||
      task.assignedTo.toString() === userId ||
      (
        userRole === 'teamLead' &&
        assignee?.role === 'developer' &&
        assignee.teamLeadId?.toString() === userId
      );

    console.log('[taskController] updateTaskStatus isAuthorized:', isAuthorized);

    if (!isAuthorized) {
      return reply.code(403).send({ error: 'Permission denied' });
    }

    task.status = status;
    await task.save();
    await task.populate('assignedTo', 'name email role');
    await task.populate('createdBy', 'name email role');
    await task.populate('assignedBy', 'name email role');

    return reply.code(200).send(task);
  } catch (error) {
    console.error('[taskController] Error updating task status:', error);
    return reply.code(500).send({ error: 'Server error while updating task status' });
  }
};

/**
 * עדכון משימה קיימת
 * Manager יכול לעדכן הכל, Team Lead יכול לעדכן משימות של הפיתחוים שלהם,
 * Developer יכול לעדכן רק את הסטטוס של משימות שלהם
 */
export const updateTask = async (
  req: FastifyRequest<{ Params: TaskParams; Body: TaskUpdateBody }>, 
  reply: FastifyReply
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { title, description, status, assignedTo } = req.body;

    if (!userId || !userRole) {
      return reply.code(401).send({ error: 'User not authenticated' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    // בדיקת הרשאות
    if (userRole === 'developer') {
      // Developer יכול לעדכן רק משימות שלו ורק את הסטטוס
      const currentAssignedId = extractId((task as any).assignedTo);
      if (!currentAssignedId) {
        return reply.code(400).send({ error: 'Task missing assignee' });
      }

      if (currentAssignedId !== userId) {
        return reply.code(403).send({ error: 'Permission denied' });
      }

      // Developer יכול לעדכן רק את הסטטוס
      if (title || description || assignedTo) {
        return reply.code(400).send({ error: 'Developers can only update task status' });
      }

      task.status = status || task.status;
    } else if (userRole === 'teamLead') {
      // Team Lead יכול לעדכן משימות של הפיתחוים שלהם
      const currentAssignedId = extractId((task as any).assignedTo);
      if (!currentAssignedId) {
        return reply.code(400).send({ error: 'Task missing assignee' });
      }

      const currentAssignee = await User.findById(currentAssignedId);
      const isAssignedToSelf = currentAssignedId === userId;
      const isAssignedToDeveloperUnderMe = currentAssignee?.teamLeadId?.toString() === userId;

      if (!isAssignedToSelf && !isAssignedToDeveloperUnderMe) {
        return reply.code(403).send({ error: 'Permission denied' });
      }

      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status || task.status;

      // אם מנסים להקצות ל-Developer אחר, בדיקה שהוא תחת ה-Team Lead
      if (assignedTo) {
        const assignee = await User.findById(assignedTo);
        if (!assignee || assignee.role !== 'developer') {
          return reply.code(400).send({ error: 'Invalid developer ID' });
        }

        const canAssign = await canAssignTaskTo(userId, userRole, assignedTo);
        if (!canAssign) {
          return reply.code(403).send({ error: 'You can only assign tasks to your developers' });
        }

        task.assignedTo = new mongoose.Types.ObjectId(assignedTo);
        task.assignedBy = new mongoose.Types.ObjectId(userId);
      }
    } else if (userRole === 'manager') {
      // Manager יכול לעדכן הכל
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status || task.status;

      if (assignedTo) {
        const assignee = await User.findById(assignedTo);
        if (!assignee || assignee.role !== 'teamLead') {
          return reply.code(400).send({ error: 'Managers can only assign tasks to team leads' });
        }

        const canAssign = await canAssignTaskTo(userId, userRole, assignedTo);
        if (!canAssign) {
          return reply.code(403).send({ error: 'Managers can only assign tasks to team leads.' });
        }

        task.assignedTo = new mongoose.Types.ObjectId(assignedTo);
        task.assignedBy = new mongoose.Types.ObjectId(userId);
      }
    }

    await task.save();
    await task.populate('assignedTo', 'name email role');
    await task.populate('createdBy', 'name email role');
    await task.populate('assignedBy', 'name email role');

    return reply.code(200).send(task);
  } catch (error) {
    console.error('[taskController] Error updating task:', error);
    return reply.code(500).send({ error: 'Server error while updating task' });
  }
};

/**
 * מחיקת משימה
 * רק Manager יכול למחוק משימות
 */
export const deleteTask = async (req: FastifyRequest<{ Params: TaskParams }>, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== 'manager') {
      return reply.code(403).send({ error: 'Only managers can delete tasks' });
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    return reply.code(200).send({ message: 'Task deleted successfully!' });
  } catch (error) {
    console.error('[taskController] Error deleting task:', error);
    return reply.code(500).send({ error: 'Server error while deleting task' });
  }
};