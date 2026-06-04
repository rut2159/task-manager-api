import { FastifyRequest, FastifyReply } from 'fastify';
import User from '../models/User'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// הגדרת השדות הצפויים בבקשות
interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

// הרשמת משתמש חדש
export const register = async (req: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. בדיקה אם המשתמש כבר קיים
    const userExists = await User.findOne({ email });
    if (userExists) {
      return reply.code(400).send({ error: 'Email already registered' });
    }

    // 2. הצפנת הסיסמה
    if (!password) {
      return reply.code(400).send({ error: 'Password is required' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. יצירת המשתמש ושמירה בדאטהבייס
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'developer'
    });

    await newUser.save();

    return reply.code(201).send({ message: 'User registered successfully!' });
  } catch (error) {
    return reply.code(500).send({ error: 'Server error during registration' });
  }
};

// התחברות משתמש קיים
export const login = async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
  try {
    const { email, password } = req.body;

    // 1. חיפוש המשתמש לפי אימייל
    const user = await User.findOne({ email });
    if (!user) {
      return reply.code(400).send({ error: 'Invalid email or password' });
    }

    // 2. בדיקת התאמת סיסמה
    if (!password || !user.password) {
      return reply.code(400).send({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(400).send({ error: 'Invalid email or password' });
    }

    // 3. יצירת JWT Token - תיקון: גישה בטוחה ל-process.env שעוקפת את מגבלת הטיפוסים
    const secretKey = process.env['JWT_SECRET'] || 'secret';

    const token = jwt.sign(
      { id: user._id, role: user.role },
      secretKey,
      { expiresIn: '1d' }
    );

    return reply.code(200).send({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return reply.code(500).send({ error: 'Server error during login' });
  }
};