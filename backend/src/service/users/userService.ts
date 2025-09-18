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
    .select('_id fullName email workerType biography availability satisfactionRating profilePicture')
    .sort({ satisfactionRating: -1, fullName: 1 });

    const formattedWorkers: WorkerData[] = workers.map(worker => ({
      _id: String(worker._id),
      fullName: worker.fullName,
      email: worker.email,
      workerType: worker.workerType || '',
      biography: worker.biography || '',
      availability: worker.availability || '',
      satisfactionRating: worker.satisfactionRating || 0,
      profilePicture: worker.profilePicture || ''
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
      role: 'worker',
      isWorkerAvailable: true
    })
    .select('_id fullName email workerType biography availability satisfactionRating profilePicture')
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
      profilePicture: worker.profilePicture || ''
    }));

    return formattedWorkers;
  }
}
