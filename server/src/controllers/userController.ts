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
    console.log('📥 [userController.ts] Login request received');
    console.log('📥 [userController.ts] req.body:', req.body);
    console.log('📥 [userController.ts] req.body type:', typeof req.body);
    console.log('📥 [userController.ts] req.headers["content-type"]:', req.headers['content-type']);
    
    const { email, password } = req.body;
    
    console.log('📥 [userController.ts] Destructured email:', email, '| password:', password ? '***' : 'undefined');
    
    if (!email || !password) {
      console.error('❌ [userController.ts] Missing email or password - email:', email, 'password:', password ? 'provided' : 'missing');
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    // 1. חיפוש המשתמש לפי אימייל
    console.log('🔍 [userController.ts] Searching for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ [userController.ts] User not found for email:', email);
      return reply.code(400).send({ error: 'Invalid email or password' });
    }
    console.log('✅ [userController.ts] User found:', user._id);

    // 2. בדיקת התאמת סיסמה
    console.log('🔐 [userController.ts] Verifying password...');
    if (!password || !user.password) {
      console.error('❌ [userController.ts] Missing password - password provided:', !!password, 'user.password exists:', !!user.password);
      return reply.code(400).send({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('❌ [userController.ts] Password mismatch');
      return reply.code(400).send({ error: 'Invalid email or password' });
    }
    console.log('✅ [userController.ts] Password verified successfully');

    // 3. יצירת JWT Token - תיקון: גישה בטוחה ל-process.env שעוקפת את מגבלת הטיפוסים
    console.log('🔑 [userController.ts] Creating JWT token...');
    const secretKey = process.env['JWT_SECRET'] || 'secret';

    const token = jwt.sign(
      { id: user._id, role: user.role },
      secretKey,
      { expiresIn: '1d' }
    );

    const responseData = {
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    };
    
    console.log('✅ [userController.ts] Login successful! Sending response:', { message: responseData.message, token: 'JWT_TOKEN_REDACTED', user: responseData.user });
    return reply.code(200).send(responseData);
  } catch (error) {
    console.error('💥 [userController.ts] Catch block - Server error during login:');
    console.error('💥 [userController.ts] Error:', error);
    return reply.code(500).send({ error: 'Server error during login' });
  }
};

export const getMe = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({ error: 'Access denied. No authenticated user.' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return reply.code(404).send({ error: 'User not found.' });
    }

    return reply.code(200).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('💥 [userController.ts] Catch block - Server error during getMe:', error);
    return reply.code(500).send({ error: 'Server error during getMe' });
  }
};