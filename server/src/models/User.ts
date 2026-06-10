import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role?: 'manager' | 'teamLead' | 'developer';
  teamLeadId?: mongoose.Types.ObjectId; // Required for developers, points to their Team Lead
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
      enum: ['manager', 'teamLead', 'developer'],
      default: 'developer',
    },
    teamLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Only required for developers
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);