import { Request } from 'express';

export interface MongoError extends Error {
    code?: number;
    keyValue?: Record<string, string | number | boolean>;
}

export interface JwtPayload {
  id: string;
  role: 'user' | 'worker' | 'admin';
  email: string;
}
  
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface NotFoundError extends Error {
  status?: number;
}