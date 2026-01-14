// Type definitions for models

export interface LoginHistory {
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  password: string; // Hashed password
  isAdmin?: boolean; // Admin flag
  createdAt: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  loginCount: number;
  loginHistory: LoginHistory[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
}
