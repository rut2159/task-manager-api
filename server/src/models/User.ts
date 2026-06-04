import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role?: 'developer' | 'manager' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['developer', 'manager', 'admin'],
      default: 'developer',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);