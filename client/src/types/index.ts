export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'manager' | 'teamLead' | 'developer';
  teamLeadId?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string | User;
  assignedBy: string | User;
  createdBy: string | User;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'manager' | 'teamLead' | 'developer';
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  password: string;
  role: 'teamLead' | 'developer';
  teamLeadId?: string; // Required for developers
}

export interface UpdateEmployeeData {
  name?: string;
  email?: string;
  role?: 'teamLead' | 'developer';
  teamLeadId?: string;
}
