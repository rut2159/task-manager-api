import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const User = require('../models/User').default;

// הרחבת הטיפוסים של פסטיפיי כדי שיזהה את req.user בכל הפרויקט
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: 'manager' | 'teamLead' | 'developer';
    };
  }
}

// 1. מידלוור לאימות ה-Token (האם המשתמש בכלל מחובר?)
export const authenticateJWT = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = req.headers.authorization;

    // בדיקה אם בכלל נשלח ה-Header של האבטחה
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Access denied. No token provided.' });
    }

    // חילוץ הטוקן עצמו מתוך המחרוזת "Bearer <TOKEN>"
    const token = authHeader.split(' ')[1];
    const secretKey = process.env['JWT_SECRET'] || 'secret';

    // אימות הטוקן מול המפתח הסודי שלנו
    const decoded = jwt.verify(token!, secretKey) as unknown as { id: string; role: string };    
    // שמירת פרטי המשתמש על גבי הבקשה כדי שהקונטרולרים יוכלו להשתמש בהם
    req.user = decoded as { id: string; role: 'manager' | 'teamLead' | 'developer' };
  } catch (error) {
    return reply.code(403).send({ error: 'Invalid or expired token.' });
  }
};

// 2. מידלוור לבדיקת הרשאות ותפקידים (למשל: רק מנהל או team lead יכולים לבצע פעולה)
export const authorizeRoles = (...allowedRoles: string[]) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    // המידלוור הזה ירוץ תמיד אחרי authenticateJWT, כך ש-req.user כבר קיים ומאומת
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return reply.code(403).send({ error: 'Permission denied. You do not have the required role.' });
    }
  };
};

/**
 * בדיקה אם Team Lead מנהל מפתח ספציפי
 * @param teamLeadId - ה-ID של ה-Team Lead
 * @param developerId - ה-ID של ה-Developer
 * @returns true אם ה-Team Lead מנהל את ה-Developer
 */
export async function isTeamLeadOf(
  teamLeadId: string | mongoose.Types.ObjectId,
  developerId: string | mongoose.Types.ObjectId
): Promise<boolean> {
  try {
    const User = require('../models/User').default;
    const developer = await User.findById(developerId);
    
    if (!developer || developer.role !== 'developer') {
      return false;
    }

    // בדיקה אם ה-Developer מקושר ל-Team Lead הזה
    return developer.teamLeadId?.toString() === teamLeadId.toString();
  } catch (error) {
    console.error('[authMiddleware] Error checking team lead relationship:', error);
    return false;
  }
}

/**
 * בדיקה אם משתמש יכול ליצור משימה
 * רק Manager ו-Team Lead יכולים ליצור משימות
 */
export function canCreateTask(userRole: string): boolean {
  return userRole === 'manager' || userRole === 'teamLead';
}

/**
 * בדיקה אם משתמש יכול להקצות משימה לפיתחו
 * Manager יכול להקצות לכל פיתחו, Team Lead רק לפיתחוים שלהם
 */
export async function canAssignTaskTo(
  assignerId: string | mongoose.Types.ObjectId,
  assignerRole: string,
  assigneeId: string | mongoose.Types.ObjectId
): Promise<boolean> {
  if (assignerRole === 'manager') {
    const assignee = await User.findById(assigneeId);
    return !!assignee && assignee.role === 'teamLead';
  }

  if (assignerRole === 'teamLead') {
    return isTeamLeadOf(assignerId, assigneeId);
  }

  return false;
}

/**
 * בדיקה אם משתמש יכול לראות משימה
 * Manager רואה הכל, Team Lead רואה משימות של הפיתחוים שלהם, Developer רואה רק שלו
 */
export async function canViewTask(
  userId: string | mongoose.Types.ObjectId,
  userRole: string,
  taskAssignedTo: string | mongoose.Types.ObjectId | null
): Promise<boolean> {
  if (!taskAssignedTo) {
    return false;
  }

  // Manager רואה הכל
  if (userRole === 'manager') {
    return true;
  }

  // Developer רואה רק משימות שהוקצו לו
  if (userRole === 'developer') {
    return userId.toString() === taskAssignedTo.toString();
  }

  // Team Lead רואה משימות שהוקצו לו או לפיתחוים שלו
  if (userRole === 'teamLead') {
    if (userId.toString() === taskAssignedTo.toString()) {
      return true;
    }
    return isTeamLeadOf(userId, taskAssignedTo);
  }

  return false;
}