import { Response, NextFunction } from 'express';
import { TokenService } from '../utils/tokenService';
import { JwtPayload, AuthenticatedRequest } from '../types';
import User from '../models/users/user';
import UserSuscription from '../models/suscriptionPlans/userSuscription';
import { SuscriptionPlanDocument } from '../models/suscriptionPlans/suscriptionPlan';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.split(' ')[1];
  
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
    res.status(403).json({ message: 'Solo los trabajadores pueden realizar esta acción' });
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
    res.status(403).json({ message: 'Solo los trabajadores pueden realizar esta acción' });
    return;
  }
  
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    if (user.workerType !== 'Nutricionista' && 
        user.workerType !== 'Nutricionista y Entrenador personal') {
      res.status(403).json({ message: 'Solo los nutricionistas pueden realizar esta acción' });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar el tipo de trabajador:', error);
    res.status(500).json({ message: 'Error al verificar el tipo de trabajador' });
  }
};

export const authorizeUserWithValidSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id, role } = req.user as JwtPayload;
  
  if (!id) {
    res.status(401).json({ message: 'No autenticado' });
    return;
  }
  
  if (role !== 'user') {
    res.status(403).json({ message: 'Solo los usuarios pueden acceder a esta funcionalidad' });
    return;
  }
  
  try {
    // Buscar la suscripción del usuario
    const subscription = await UserSuscription.findOne({ userId: id })
      .populate('planId');
    
    if (!subscription) {
      res.status(403).json({ 
        message: 'No tienes una suscripción activa. Debes suscribirte a un plan para acceder a esta funcionalidad.' 
      });
      return;
    }
    
    // Verificar que la suscripción no sea gratuita
    const plan = subscription.planId as unknown as SuscriptionPlanDocument;
    if (plan.tipoPrecio === 'Gratuito') {
      res.status(403).json({ 
        message: 'Tu plan gratuito no incluye acceso a trabajadores. Actualiza tu suscripción para acceder a esta funcionalidad.' 
      });
      return;
    }
    
    // Verificar que la suscripción esté activa
    const now = new Date();
    if (subscription.fechaFin < now) {
      res.status(403).json({ 
        message: 'Tu suscripción ha expirado. Renueva tu suscripción para acceder a esta funcionalidad.' 
      });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar la suscripción del usuario:', error);
    res.status(500).json({ message: 'Error al verificar la suscripción' });
  }
};

export const authorizeUserWithValidSubscriptionForWorker = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id, role } = req.user as JwtPayload;
  
  if (!id) {
    res.status(401).json({ message: 'No autenticado' });
    return;
  }
  
  if (role !== 'user') {
    res.status(403).json({ message: 'Solo los usuarios pueden solicitar asignaciones' });
    return;
  }
  
  try {
    // Obtener el ID del trabajador del body
    const { trabajadorSolicitado } = req.body;
    
    if (!trabajadorSolicitado) {
      res.status(400).json({ message: 'ID del trabajador es requerido' });
      return;
    }

    // Buscar el trabajador
    const worker = await User.findById(trabajadorSolicitado);
    if (!worker || worker.role !== 'worker') {
      res.status(404).json({ message: 'Trabajador no encontrado' });
      return;
    }

    // Buscar la suscripción del usuario
    const userSubscription = await UserSuscription.findOne({ userId: id })
      .populate('planId');
    
    if (!userSubscription) {
      res.status(403).json({ 
        message: 'No tienes una suscripción activa. Debes suscribirte a un plan para solicitar asignaciones.' 
      });
      return;
    }

    const plan = userSubscription.planId as unknown as SuscriptionPlanDocument;
    
    // Verificar que la suscripción no sea gratuita
    if (plan.tipoPrecio === 'Gratuito') {
      res.status(403).json({ 
        message: 'Tu plan gratuito no incluye acceso a trabajadores. Actualiza tu suscripción para solicitar asignaciones.' 
      });
      return;
    }

    // Verificar que la suscripción esté activa
    const now = new Date();
    if (userSubscription.fechaFin < now) {
      res.status(403).json({ 
        message: 'Tu suscripción ha expirado. Renueva tu suscripción para solicitar asignaciones.' 
      });
      return;
    }

    // Verificar compatibilidad entre el plan del usuario y el tipo de trabajador
    const userPlanType = plan.tipoPlan;
    const workerType = worker.workerType;

    let isCompatible = false;

    switch (userPlanType) {
      case 'Nutricion':
        isCompatible = workerType === 'Nutricionista' || workerType === 'Nutricionista y Entrenador personal';
        break;
      case 'Entrenamiento personal':
        isCompatible = workerType === 'Entrenador personal' || workerType === 'Nutricionista y Entrenador personal';
        break;
      case 'Nutrición y entrenamiento personal':
        isCompatible = true; 
        break;
      default:
        isCompatible = false;
    }

    if (!isCompatible) {
      res.status(403).json({ 
        message: `Tu plan de suscripción "${userPlanType}" no es compatible con trabajadores de tipo "${workerType}". Actualiza tu plan para acceder a este tipo de profesional.` 
      });
      return;
    }

    next();

  } catch (error) {
    console.error('Error al validar suscripción del usuario:', error);
    res.status(500).json({ message: 'Error al verificar la suscripción' });
  }
};
