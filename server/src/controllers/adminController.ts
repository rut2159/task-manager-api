import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User';

const addEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please provide a valid email'),
  role: z.enum(['developer', 'manager', 'admin']),
});

export const addEmployee = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const parseResult = addEmployeeSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      return reply.code(400).send({ error: 'Validation failed', details: errors });
    }

    const { name, email, role } = parseResult.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.code(400).send({ error: 'Email already registered' });
    }

    const defaultPassword = process.env.DEFAULT_EMPLOYEE_PASSWORD || 'Temp1234!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return reply.code(201).send({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.error('[adminController] Failed to add employee:', error);
    return reply.code(500).send({ error: 'Server error while adding employee' });
  }
};
