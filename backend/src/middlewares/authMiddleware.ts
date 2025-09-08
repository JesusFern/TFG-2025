import { Response, NextFunction } from 'express';
import { TokenService } from '../utils/tokenService';
import { JwtPayload, AuthenticatedRequest } from '../types';
import User from '../models/users/user';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Acceso denegado' });
    return;
  }

  const decoded = TokenService.verifyToken(token) as JwtPayload | null;
  if (!decoded) {
    res.status(400).json({ message: 'Token no válido' });
    return;
  }

  req.user = decoded;
  next();
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
};

export const authorizeAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { role } = req.user as JwtPayload;

  if (role === 'admin') {
    return next();
  }

  res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
};

export const authorizeWorker = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id, role } = req.user as JwtPayload;
  if (!id) {
    res.status(401).json({ message: 'No autenticado' });
    return;
  }
  if (role !== 'worker') {
    res.status(403).json({ message: 'Solo los trabajadores pueden crear dietas' });
    return;
  }
  next();
};

export const authorizeNutricionista = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id, role } = req.user as JwtPayload;
  if (!id) {
    res.status(401).json({ message: 'No autenticado' });
    return;
  }
  if (role !== 'worker') {
    res.status(403).json({ message: 'Solo los trabajadores pueden crear dietas' });
    return;
  }
  const user = await User.findById(id);
  if (
    !user ||
    (user.workerType !== 'Nutricionista' &&
     user.workerType !== 'Nutricionista y Entrenador personal')
  ) {
    res.status(403).json({ message: 'Solo los nutricionistas pueden realizar esta acción' });
    return;
  }
  next();
};
