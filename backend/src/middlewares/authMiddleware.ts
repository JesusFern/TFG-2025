import { Response, NextFunction } from 'express';
import { TokenService } from '../utils/tokenService';
import { JwtPayload, AuthenticatedRequest } from '../types';
import User from '../models/users/user';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  console.log('🔍 Debug authenticateToken - URL:', req.originalUrl);
  console.log('🔍 Debug authenticateToken - Headers:', req.headers);
  
  const authHeader = req.headers.authorization;
  console.log('🔍 Debug authenticateToken - Authorization header:', authHeader);
  
  if (!authHeader) {
    console.log('❌ No se proporcionó token de autorización');
    res.status(401).json({ message: 'Token de autorización requerido' });
    return;
  }

  const token = authHeader.split(' ')[1];
  console.log('🔍 Debug authenticateToken - Token extraído:', token ? 'Presente' : 'Ausente');
  
  if (!token) {
    console.log('❌ Token no válido en el header');
    res.status(401).json({ message: 'Token no válido' });
    return;
  }

  try {
    const decoded = TokenService.verifyToken(token);
    console.log('🔍 Debug authenticateToken - Token decodificado:', decoded);
    
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      console.log('❌ Token decodificado inválido');
      res.status(401).json({ message: 'Token inválido' });
      return;
    }

    req.user = decoded as JwtPayload;
    console.log('✅ Usuario autenticado correctamente, llamando a next()');
    console.log('🔍 Debug authenticateToken - Usuario asignado a req.user:', req.user);
    next();
    console.log('✅ authenticateToken: next() ejecutado correctamente');
  } catch (error) {
    console.error('❌ Error al verificar token:', error);
    res.status(401).json({ message: 'Token inválido' });
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
