// Authentication types

export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
  token?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
