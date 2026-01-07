import { UserRole } from './user-role';

export interface User {
  id: number;
  username: string;
  code: string;
  role: UserRole;
  fullName?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserForm {
  username: string;
  code: string;
  role: UserRole;
  fullName?: string;
  email?: string;
}

export interface UpdateUserForm {
  username?: string;
  code?: string;
  role?: UserRole;
  fullName?: string;
  email?: string;
  isActive?: boolean;
}

