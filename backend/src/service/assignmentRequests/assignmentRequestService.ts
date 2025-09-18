import AssignmentRequest from '../../models/users/assignmentRequest';
import User from '../../models/users/user';
import UserSuscription from '../../models/suscriptionPlans/userSuscription';
import { SuscriptionPlanDocument } from '../../models/suscriptionPlans/suscriptionPlan';
import mongoose from 'mongoose';

export const createAssignmentRequest = async (
  usuarioSolicitante: mongoose.Types.ObjectId,
  trabajadorSolicitado: mongoose.Types.ObjectId
) => {
    // Verificar que el trabajador existe y está disponible
    const worker = await User.findById(trabajadorSolicitado);
    if (!worker || worker.role !== 'worker') {
      throw new Error('Trabajador no encontrado');
    }

    if (worker.isWorkerAvailable === false) {
      throw new Error('El trabajador no está disponible para nuevas asignaciones');
    }

    // Verificar que no existe una solicitud pendiente previa
    const existingRequest = await AssignmentRequest.findOne({
      usuarioSolicitante,
      trabajadorSolicitado,
      estado: 'pendiente'
    });

    if (existingRequest) {
      throw new Error('Ya tienes una solicitud pendiente para este trabajador');
    }

    // Verificar que el usuario no esté ya asignado a este trabajador
    const existingAssignment = await User.findOne({
      _id: usuarioSolicitante,
      clientesAsignados: trabajadorSolicitado
    });

    if (existingAssignment) {
      throw new Error('Ya estás asignado a este trabajador');
    }

    // Crear la nueva solicitud
    const assignmentRequest = new AssignmentRequest({
      usuarioSolicitante,
      trabajadorSolicitado,
      estado: 'pendiente'
    });

  await assignmentRequest.save();
  return assignmentRequest;
};

export const getAssignmentRequestsByUser = async (userId: mongoose.Types.ObjectId) => {
    const assignmentRequests = await AssignmentRequest.find({
      usuarioSolicitante: userId
    }).populate([
      { path: 'usuarioSolicitante', select: 'fullName email' },
      { path: 'trabajadorSolicitado', select: 'fullName email workerType biography' }
    ]).sort({ createdAt: -1 });

  return assignmentRequests;
};

export const getAssignmentRequestsByWorker = async (workerId: mongoose.Types.ObjectId) => {
    const assignmentRequests = await AssignmentRequest.find({
      trabajadorSolicitado: workerId
    }).populate([
      { path: 'usuarioSolicitante', select: 'fullName email' },
      { path: 'trabajadorSolicitado', select: 'fullName email workerType' }
    ]).sort({ createdAt: -1 });

  return assignmentRequests;
};

export const updateAssignmentRequestStatus = async (
  requestId: mongoose.Types.ObjectId,
  workerId: mongoose.Types.ObjectId,
  estado: 'aceptada' | 'rechazada'
) => {
    // Buscar la solicitud
    const assignmentRequest = await AssignmentRequest.findById(requestId);
    if (!assignmentRequest) {
      throw new Error('Solicitud de asignación no encontrada');
    }

    // Verificar que el trabajador es el propietario de la solicitud
    if (!assignmentRequest.trabajadorSolicitado.equals(workerId)) {
      throw new Error('No tienes permiso para modificar esta solicitud');
    }

    // Verificar que la solicitud está pendiente
    if (assignmentRequest.estado !== 'pendiente') {
      throw new Error('Esta solicitud ya ha sido procesada');
    }

    // Actualizar el estado
    assignmentRequest.estado = estado;
    await assignmentRequest.save();

    // Si se acepta la solicitud, asignar el usuario al trabajador
    if (estado === 'aceptada') {
      await User.findByIdAndUpdate(
        assignmentRequest.trabajadorSolicitado,
        { $addToSet: { clientesAsignados: assignmentRequest.usuarioSolicitante } }
      );
    }

  return assignmentRequest;
};

export const cancelAssignmentRequest = async (
  requestId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) => {
    // Buscar la solicitud
    const assignmentRequest = await AssignmentRequest.findById(requestId);
    if (!assignmentRequest) {
      throw new Error('Solicitud de asignación no encontrada');
    }

    // Verificar que el usuario es el propietario de la solicitud
    if (!assignmentRequest.usuarioSolicitante.equals(userId)) {
      throw new Error('No tienes permiso para cancelar esta solicitud');
    }

    // Verificar que la solicitud está pendiente
    if (assignmentRequest.estado !== 'pendiente') {
      throw new Error('Solo se pueden cancelar solicitudes pendientes');
    }

    // Eliminar la solicitud
    await AssignmentRequest.findByIdAndDelete(requestId);
  return true;
};

export const validateSubscriptionCompatibility = async (
  userId: mongoose.Types.ObjectId,
  workerId: mongoose.Types.ObjectId
) => {
    // Buscar la suscripción del usuario
    const userSubscription = await UserSuscription.findOne({ userId })
      .populate('planId');
    
    if (!userSubscription) {
      throw new Error('No tienes una suscripción activa');
    }

    const plan = userSubscription.planId as unknown as SuscriptionPlanDocument;
    
    // Verificar que la suscripción no sea gratuita
    if (plan.tipoPrecio === 'Gratuito') {
      throw new Error('Tu plan gratuito no incluye acceso a trabajadores');
    }

    // Verificar que la suscripción esté activa
    const now = new Date();
    if (userSubscription.fechaFin < now) {
      throw new Error('Tu suscripción ha expirado');
    }

    // Buscar el trabajador
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      throw new Error('Trabajador no encontrado');
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
        isCompatible = true; // Puede contactar a todos los tipos
        break;
      default:
        isCompatible = false;
    }

    if (!isCompatible) {
      throw new Error(`Tu plan de suscripción "${userPlanType}" no es compatible con trabajadores de tipo "${workerType}"`);
    }

  return true;
};

export const getPendingAssignmentRequestsByWorker = async (workerId: mongoose.Types.ObjectId) => {
  const assignmentRequests = await AssignmentRequest.find({
    trabajadorSolicitado: workerId,
    estado: 'pendiente'
  }).populate([
    { path: 'usuarioSolicitante', select: 'fullName email' },
    { path: 'trabajadorSolicitado', select: 'fullName email workerType' }
  ]).sort({ createdAt: -1 });

  return assignmentRequests;
};

export const getAssignmentRequestStats = async (workerId?: mongoose.Types.ObjectId) => {
  const matchStage = workerId ? { trabajadorSolicitado: workerId } : {};
  
  const stats = await AssignmentRequest.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 }
      }
    }
  ]);

  return stats;
};
