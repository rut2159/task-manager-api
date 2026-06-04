import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

// הרחבת הטיפוסים של פסטיפיי כדי שיזהה את req.user בכל הפרויקט
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: string;
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
    req.user = decoded;
  } catch (error) {
    return reply.code(403).send({ error: 'Invalid or expired token.' });
  }
};

// 2. מידלוור לבדיקת הרשאות ותפקידים (למשל: רק אדמין או מנהל יכולים לבצע פעולה)
export const authorizeRoles = (...allowedRoles: string[]) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    // המידלוור הזה ירוץ תמיד אחרי authenticateJWT, כך ש-req.user כבר קיים ומאומת
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return reply.code(403).send({ error: 'Permission denied. You do not have the required role.' });
    }
  };
};