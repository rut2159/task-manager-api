import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User';
import mongoose from 'mongoose';

const addEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['teamLead', 'developer']).refine(
    (role) => role !== undefined,
    'Role is required'
  ),
  teamLeadId: z.string().optional(), // Required only for developers
}).refine(
  (data) => {
    // If role is developer, teamLeadId must be provided
    if (data.role === 'developer' && !data.teamLeadId) {
      return false;
    }
    return true;
  },
  {
    message: 'teamLeadId is required for developers',
    path: ['teamLeadId'],
  }
);

/**
 * מנהל מוסיף עובד חדש
 * רק מנהל יכול להוסיף עובדים
 * Developers חייבים להיות מקושרים ל-Team Lead
 */
export const addEmployee = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const parseResult = addEmployeeSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      return reply.code(400).send({ error: 'Validation failed', details: errors });
    }

    const { name, email, password, role, teamLeadId } = parseResult.data;

    // בדיקה אם המשתמש קיים כבר
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.code(400).send({ error: 'Email already registered' });
    }

    // אם מנסים להוסיף Developer, בדיקה שה-Team Lead קיים
    if (role === 'developer' && teamLeadId) {
      const teamLead = await User.findById(teamLeadId);
      if (!teamLead || teamLead.role !== 'teamLead') {
        return reply.code(400).send({ error: 'Invalid Team Lead ID' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      teamLeadId: role === 'developer' ? new mongoose.Types.ObjectId(teamLeadId!) : null,
    });

    await newUser.save();

    return reply.code(201).send({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      teamLeadId: newUser.teamLeadId,
    });
  } catch (error) {
    console.error('[adminController] Failed to add employee:', error);
    return reply.code(500).send({ error: 'Server error while adding employee' });
  }
};

/**
 * שליפת כל העובדים בסיסטם
 * רק מנהל יכול לשלוף את הכל
 */
export const getEmployees = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const employees = await User.find()
      .select('-password')
      .populate('teamLeadId', 'name email role');

    return reply.code(200).send(employees);
  } catch (error) {
    console.error('[adminController] Failed to fetch employees:', error);
    return reply.code(500).send({ error: 'Server error while fetching employees' });
  }
};

/**
 * שליפת עובדים תחת Team Lead מסוים
 * מנהל יכול לראות הכל, Team Lead יכול לראות רק את שלהם
 */
export const getEmployeesByTeamLead = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const requestedTeamLeadId = req.params.teamLeadId as string | undefined;
    const requesterId = req.user?.id as string | undefined;
    const requesterRole = req.user?.role as string | undefined;

    // אם המגיש הוא Team Lead - אסור לבקש צוות של Team Lead אחר
    if (requesterRole === 'teamLead') {
      if (requestedTeamLeadId && requestedTeamLeadId !== requesterId) {
        return reply.code(403).send({ error: 'Permission denied. Cannot access other teams.' });
      }
    }

    const teamLeadId = requestedTeamLeadId || requesterId;

    // בדיקה שה-Team Lead קיים
    const teamLead = await User.findById(teamLeadId);
    if (!teamLead || teamLead.role !== 'teamLead') {
      return reply.code(404).send({ error: 'Team Lead not found' });
    }

    // שליפת כל ה-Developers תחת Team Lead הזה
    const developers = await User.find({ teamLeadId })
      .select('-password');

    return reply.code(200).send(developers);
  } catch (error) {
    console.error('[adminController] Failed to fetch team developers:', error);
    return reply.code(500).send({ error: 'Server error while fetching team developers' });
  }
};

/**
 * עדכון עובד קיים
 * מנהל יכול לעדכן הכל
 */
export const updateEmployee = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { employeeId } = req.params as { employeeId: string };
    const { name, email, role, teamLeadId } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee) {
      return reply.code(404).send({ error: 'Employee not found' });
    }

    // אם משנים את התפקיד ל-Developer, חייבת להיות teamLeadId
    if (role === 'developer' && !teamLeadId) {
      return reply.code(400).send({ error: 'teamLeadId is required for developers' });
    }

    // בדיקה שה-Team Lead קיים
    if (teamLeadId) {
      const teamLead = await User.findById(teamLeadId);
      if (!teamLead || teamLead.role !== 'teamLead') {
        return reply.code(400).send({ error: 'Invalid Team Lead ID' });
      }
    }

    employee.name = name || employee.name;
    employee.email = email || employee.email;
    if (role) employee.role = role;
    if (teamLeadId && role === 'developer') {
      employee.teamLeadId = new mongoose.Types.ObjectId(teamLeadId);
    }

    await employee.save();

    return reply.code(200).send({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      teamLeadId: employee.teamLeadId,
    });
  } catch (error) {
    console.error('[adminController] Failed to update employee:', error);
    return reply.code(500).send({ error: 'Server error while updating employee' });
  }
};

/**
 * מחיקת עובד
 * רק מנהל יכול למחוק עובדים
 */
export const deleteEmployee = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { employeeId } = req.params as { employeeId: string };

    const employee = await User.findByIdAndDelete(employeeId);
    if (!employee) {
      return reply.code(404).send({ error: 'Employee not found' });
    }

    return reply.code(200).send({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('[adminController] Failed to delete employee:', error);
    return reply.code(500).send({ error: 'Server error while deleting employee' });
  }
};
