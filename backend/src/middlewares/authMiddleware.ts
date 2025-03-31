import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Acceso denegado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error al verificar el token:', err);
    res.status(400).json({ message: 'Token no válido' });
  }
};

export const authorizeUserOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id, role } = req.user as JwtPayload;
  const userId = req.params.id;

  if (role === 'admin') {
    return next();
  }

  if (id === userId) {
    return next();
  }

  res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  return;
};

export const authorizeAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { role } = req.user as JwtPayload;

  if (role === 'admin') {
    return next();
  }

  res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  return;
};