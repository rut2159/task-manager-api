export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer';
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Deployed';
  completed: boolean;
  assignedTo?: User;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'developer';
}

export interface AuthResponse {
  token: string;
  user: User;
}
