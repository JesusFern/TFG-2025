import mongoose from 'mongoose';
import User from '../../models/users/user';
import UserSuscription from '../../models/suscriptionPlans/userSuscription';

export interface WorkerData {
  _id: string;
  fullName: string;
  email: string;
  workerType: string;
  biography: string;
  availability: string;
  satisfactionRating: number;
  profilePicture: string;
  isWorkerAvailable: boolean;
}

export interface TrabajadoresResult {
  workers: WorkerData[];
  total: number;
  planType: string;
  allowedWorkerTypes: string[];
}

export class UserService {
  static async getTrabajadoresRol(userId: string): Promise<TrabajadoresResult> {
    // Obtener la suscripción del usuario
    const subscription = await UserSuscription.findOne({ userId })
      .populate('planId');
    
    if (!subscription) {
      throw new Error('No tienes una suscripción activa. Debes suscribirte a un plan para acceder a esta funcionalidad.');
    }

    const plan = subscription.planId as unknown as {
      tipoPrecio: string;
      tipoPlan: string;
    };
    
    // Verificar que la suscripción no sea gratuita
    if (plan.tipoPrecio === 'Gratuito') {
      throw new Error('Tu plan gratuito no incluye acceso a trabajadores. Actualiza tu suscripción para acceder a esta funcionalidad.');
    }
    
    // Verificar que la suscripción esté activa
    const now = new Date();
    if (subscription.fechaFin < now) {
      throw new Error('Tu suscripción ha expirado. Renueva tu suscripción para acceder a esta funcionalidad.');
    }

    // Determinar qué tipos de trabajadores puede ver según su plan
    let allowedWorkerTypes: string[] = [];
    
    switch (plan.tipoPlan) {
      case 'Nutricion':
        allowedWorkerTypes = ['Nutricionista', 'Nutricionista y Entrenador personal'];
        break;
      case 'Entrenamiento personal':
        allowedWorkerTypes = ['Entrenador personal', 'Nutricionista y Entrenador personal'];
        break;
      case 'Nutrición y entrenamiento personal':
        allowedWorkerTypes = ['Nutricionista', 'Entrenador personal', 'Nutricionista y Entrenador personal'];
        break;
      default:
        throw new Error('Tipo de plan no válido');
    }

    const workers = await User.find({
      role: 'worker',
      isWorkerAvailable: true,
      workerType: { $in: allowedWorkerTypes }
    })
    .select('_id fullName email workerType biography availability satisfactionRating profilePicture isWorkerAvailable')
    .sort({ satisfactionRating: -1, fullName: 1 });

    const formattedWorkers: WorkerData[] = workers.map(worker => ({
      _id: String(worker._id),
      fullName: worker.fullName,
      email: worker.email,
      workerType: worker.workerType || '',
      biography: worker.biography || '',
      availability: worker.availability || '',
      satisfactionRating: worker.satisfactionRating || 0,
      profilePicture: worker.profilePicture || '',
      isWorkerAvailable: worker.isWorkerAvailable || false
    }));

    return {
      workers: formattedWorkers,
      total: formattedWorkers.length,
      planType: plan.tipoPlan,
      allowedWorkerTypes
    };
  }

  static async getAllAvailableWorkers(): Promise<WorkerData[]> {
    const workers = await User.find({
      role: 'worker'
    })
    .select('_id fullName email workerType biography availability satisfactionRating profilePicture isWorkerAvailable')
    .sort({ satisfactionRating: -1, fullName: 1 });

    // Formatear la respuesta
    const formattedWorkers: WorkerData[] = workers.map(worker => ({
      _id: String(worker._id),
      fullName: worker.fullName,
      email: worker.email,
      workerType: worker.workerType || '',
      biography: worker.biography || '',
      availability: worker.availability || '',
      satisfactionRating: worker.satisfactionRating || 0,
      profilePicture: worker.profilePicture || '',
      isWorkerAvailable: worker.isWorkerAvailable || false
    }));

    return formattedWorkers;
  }

  static async checkUserAssignmentStatus(userId: string): Promise<{
    hasAssignedWorkers: boolean;
    assignedWorkersCount: number;
    assignedWorkers: Array<{
      _id: string;
      fullName: string;
      workerType: string;
      profilePicture?: string;
      tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
    }>;
  }> {
    // Buscar trabajadores que tengan a este usuario asignado
    const workersWithUser = await User.find({
      role: 'worker',
      'clientesAsignados.clienteId': userId
    });

    const hasAssignedWorkers = workersWithUser.length > 0;

    // Extraer información de asignaciones
    const assignedWorkers = [];
    for (const worker of workersWithUser) {
      const userAssignments = worker.clientesAsignados?.filter(
        (assignment: { clienteId: mongoose.Types.ObjectId; tipoAsignacion: 'Nutricionista' | 'Entrenador personal' }) => 
          assignment.clienteId.toString() === userId
      ) || [];
      
      for (const assignment of userAssignments) {
        assignedWorkers.push({
          _id: String(worker._id),
          fullName: worker.fullName,
          workerType: worker.workerType || '',
          profilePicture: worker.profilePicture || undefined,
          tipoAsignacion: assignment.tipoAsignacion
        });
      }
    }

    return {
      hasAssignedWorkers,
      assignedWorkersCount: assignedWorkers.length,
      assignedWorkers
    };
  }

  static async checkUserSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    subscriptionType: string | null;
    fullPlanName: string | null;
    isExpired: boolean;
  }> {
    // Obtener la suscripción del usuario
    const subscription = await UserSuscription.findOne({ userId })
      .populate('planId');
    
    if (!subscription) {
      return {
        hasActiveSubscription: false,
        subscriptionType: null,
        fullPlanName: null,
        isExpired: false
      };
    }

    const plan = subscription.planId as unknown as {
      tipoPrecio: string;
      tipoPlan: string;
    };

    // Verificar si la suscripción está activa (no expirada)
    const now = new Date();
    const isExpired = subscription.fechaFin < now;

    // Verificar si tiene un plan de pago (no gratuito)
    const hasActiveSubscription = plan.tipoPrecio !== 'Gratuito' && !isExpired;

    // Crear el nombre completo del plan
    const fullPlanName = hasActiveSubscription 
      ? `${plan.tipoPrecio} - ${plan.tipoPlan}`
      : null;

    return {
      hasActiveSubscription,
      subscriptionType: plan.tipoPrecio,
      fullPlanName,
      isExpired
    };
  }

  static async checkWorkerCompatibility(userId: string, workerType: string): Promise<{
    canContact: boolean;
    canRequestAssignment: boolean;
    reason?: string;
  }> {
    // Obtener la suscripción del usuario
    const subscription = await UserSuscription.findOne({ userId })
      .populate('planId');
    
    if (!subscription) {
      return {
        canContact: false,
        canRequestAssignment: false,
        reason: 'No tienes una suscripción activa'
      };
    }

    const plan = subscription.planId as unknown as {
      tipoPrecio: string;
      tipoPlan: string;
    };

    // Verificar si la suscripción está activa (no expirada)
    const now = new Date();
    const isExpired = subscription.fechaFin < now;

    if (isExpired) {
      return {
        canContact: false,
        canRequestAssignment: false,
        reason: 'Tu suscripción ha expirado'
      };
    }

    // Verificar si tiene un plan de pago (no gratuito)
    if (plan.tipoPrecio === 'Gratuito') {
      return {
        canContact: false,
        canRequestAssignment: false,
        reason: 'Necesitas una suscripción de pago para contactar profesionales'
      };
    }

    // Lógica de compatibilidad según el tipo de plan
    const canContact = this.isWorkerTypeCompatible(plan.tipoPlan, workerType);

    // Verificar si el usuario ya tiene trabajadores asignados
    const assignmentStatus = await this.checkUserAssignmentStatus(userId);
    const canRequestAssignment = canContact && !assignmentStatus.hasAssignedWorkers;

    return {
      canContact,
      canRequestAssignment,
      reason: canContact ? undefined : 'Tu plan de suscripción no incluye este tipo de profesional'
    };
  }

  private static isWorkerTypeCompatible(planType: string, workerType: string): boolean {
    switch (planType) {
      case 'Nutricion':
        // Puede contactar: Nutricionista, Nutricionista y Entrenador personal
        return workerType === 'Nutricionista' || workerType === 'Nutricionista y Entrenador personal';
      
      case 'Entrenamiento personal':
        // Puede contactar: Entrenador personal, Nutricionista y Entrenador personal
        return workerType === 'Entrenador personal' || workerType === 'Nutricionista y Entrenador personal';
      
      case 'Nutrición y entrenamiento personal':
        // Puede contactar: Nutricionista, Entrenador personal, Nutricionista y Entrenador personal
        return workerType === 'Nutricionista' || 
               workerType === 'Entrenador personal' || 
               workerType === 'Nutricionista y Entrenador personal';
      
      default:
        return false;
    }
  }
}
