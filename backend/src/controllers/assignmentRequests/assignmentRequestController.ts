import { Response } from 'express';
import AssignmentRequest from '../../models/assignmentRequest/assignmentRequest';
import User from '../../models/users/user';
import UserSuscription from '../../models/suscriptionPlans/userSuscription';
import { AuthenticatedRequest } from '../../types';

interface MongoError extends Error {
  code?: number;
}

export const createAssignmentRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  let sanitizedTipoAsignacion = '';
  
  try {
    const { trabajadorSolicitado, tipoAsignacion } = req.body;
    const usuarioSolicitante = req.user?.id;

    if (!usuarioSolicitante) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Validar y sanitizar trabajadorSolicitado
    if (!trabajadorSolicitado) {
      res.status(400).json({ message: 'El ID del trabajador es requerido' });
      return;
    }

    // Asegurar que trabajadorSolicitado es un string válido
    const sanitizedTrabajadorSolicitado = String(trabajadorSolicitado).trim();
    if (!sanitizedTrabajadorSolicitado || sanitizedTrabajadorSolicitado.length === 0) {
      res.status(400).json({ message: 'El ID del trabajador no es válido' });
      return;
    }

    // Validar y sanitizar tipoAsignacion
    if (!tipoAsignacion) {
      res.status(400).json({ message: 'El tipo de asignación es requerido' });
      return;
    }

    // Asegurar que tipoAsignacion es un string válido
    sanitizedTipoAsignacion = String(tipoAsignacion).trim();
    if (!['Nutricionista', 'Entrenador personal'].includes(sanitizedTipoAsignacion)) {
      res.status(400).json({ message: 'El tipo de asignación debe ser "Nutricionista" o "Entrenador personal"' });
      return;
    }

    // Verificar que el trabajador existe y es válido
    const worker = await User.findById(sanitizedTrabajadorSolicitado);
    if (!worker || worker.role !== 'worker') {
      res.status(404).json({ message: 'Trabajador no encontrado' });
      return;
    }

    // Verificar que el trabajador está disponible
    if (worker.isWorkerAvailable === false) {
      res.status(400).json({ message: 'El trabajador no está disponible para nuevas asignaciones' });
      return;
    }

    // Verificar que el trabajador puede realizar el tipo de asignación solicitada
    const workerType = worker.workerType;
    if (sanitizedTipoAsignacion === 'Nutricionista' && workerType !== 'Nutricionista' && workerType !== 'Nutricionista y Entrenador personal') {
      res.status(400).json({ message: 'El trabajador no puede realizar asignaciones como nutricionista' });
      return;
    }
    
    if (sanitizedTipoAsignacion === 'Entrenador personal' && workerType !== 'Entrenador personal' && workerType !== 'Nutricionista y Entrenador personal') {
      res.status(400).json({ message: 'El trabajador no puede realizar asignaciones como entrenador personal' });
      return;
    }

    // Verificar que el usuario tiene un plan de suscripción compatible con el tipo de asignación
    const userSuscription = await UserSuscription.findOne({ userId: usuarioSolicitante })
      .populate('planId');
    
    if (!userSuscription) {
      res.status(400).json({ message: 'No tienes una suscripción activa' });
      return;
    }

    const plan = userSuscription.planId as unknown as {
      tipoPrecio: string;
      tipoPlan: string;
    };
    
    // Verificar si la suscripción está activa (no expirada)
    const now = new Date();
    const isExpired = userSuscription.fechaFin < now;

    if (isExpired) {
      res.status(400).json({ message: 'Tu suscripción ha expirado' });
      return;
    }

    // Verificar si tiene un plan de pago (no gratuito)
    if (plan.tipoPrecio === 'Gratuito') {
      res.status(400).json({ message: 'Necesitas una suscripción de pago para solicitar asignaciones' });
      return;
    }

    // Verificar compatibilidad del tipo de asignación con el plan
    const planType = plan.tipoPlan;
    let isCompatible = false;

    if (sanitizedTipoAsignacion === 'Nutricionista') {
      isCompatible = planType === 'Nutricion' || planType === 'Nutrición y entrenamiento personal';
    } else if (sanitizedTipoAsignacion === 'Entrenador personal') {
      isCompatible = planType === 'Entrenamiento personal' || planType === 'Nutrición y entrenamiento personal';
    }

    if (!isCompatible) {
      res.status(400).json({ 
        message: `Tu plan de suscripción (${planType}) no incluye asignaciones como ${sanitizedTipoAsignacion}` 
      });
      return;
    }

    // Verificar que el usuario no esté ya asignado a este trabajador para este tipo de asignación
    // Buscar en el trabajador si ya tiene este cliente asignado para este tipo
    const existingAssignment = await User.findOne({
      _id: sanitizedTrabajadorSolicitado,
      'clientesAsignados.clienteId': usuarioSolicitante,
      'clientesAsignados.tipoAsignacion': sanitizedTipoAsignacion
    });

    if (existingAssignment) {
      res.status(400).json({ 
        message: `Ya estás asignado a este trabajador como ${sanitizedTipoAsignacion}` 
      });
      return;
    }

    // Verificar que no existe una solicitud previa para este tipo
    const existingRequest = await AssignmentRequest.findOne({
      usuarioSolicitante,
      trabajadorSolicitado: sanitizedTrabajadorSolicitado,
      tipoAsignacion: sanitizedTipoAsignacion
    });

    if (existingRequest) {
      res.status(400).json({ 
        message: `Ya tienes una solicitud para este trabajador como ${sanitizedTipoAsignacion}` 
      });
      return;
    }

    // Verificación adicional: buscar cualquier solicitud del mismo tipo (incluso a otros trabajadores)
    // Solo aplicar esta restricción si el usuario NO tiene suscripción completa
    const userSuscriptionForRestriction = await UserSuscription.findOne({ userId: usuarioSolicitante })
      .populate('planId');
    
    if (userSuscriptionForRestriction) {
      const plan = userSuscriptionForRestriction.planId as unknown as {
        tipoPlan: string;
      };
      
      // Si el usuario tiene suscripción completa, puede tener múltiples asignaciones
      if (plan.tipoPlan !== 'Nutrición y entrenamiento personal') {
        const existingRequestSameType = await AssignmentRequest.findOne({
          usuarioSolicitante,
          tipoAsignacion: sanitizedTipoAsignacion
        });

        if (existingRequestSameType) {
          res.status(400).json({ 
            message: `Ya tienes una solicitud como ${sanitizedTipoAsignacion} a otro trabajador` 
          });
          return;
        }
      }
    } else {
      // Si no tiene suscripción, aplicar la restricción normal
      const existingRequestSameType = await AssignmentRequest.findOne({
        usuarioSolicitante,
        tipoAsignacion: sanitizedTipoAsignacion
      });

      if (existingRequestSameType) {
        res.status(400).json({ 
          message: `Ya tienes una solicitud como ${sanitizedTipoAsignacion} a otro trabajador` 
        });
        return;
      }
    }

    // Crear la nueva solicitud
    const assignmentRequest = new AssignmentRequest({
      usuarioSolicitante,
      trabajadorSolicitado: sanitizedTrabajadorSolicitado,
      tipoAsignacion: sanitizedTipoAsignacion
    });

    await assignmentRequest.save();

    // Poblar los datos para la respuesta
    await assignmentRequest.populate([
      { path: 'usuarioSolicitante', select: 'fullName email' },
      { path: 'trabajadorSolicitado', select: 'fullName email workerType' }
    ]);

    res.status(201).json({
      message: 'Solicitud de asignación creada exitosamente',
      assignmentRequest
    });

  } catch (error: unknown) {
    console.error('Error al crear solicitud de asignación:', error);
    
    if ((error as MongoError).code === 11000) {
      res.status(400).json({ message: `Ya tienes una solicitud como ${sanitizedTipoAsignacion} a otro trabajador` });
      return;
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateAssignmentRequestStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { estado } = req.body;
    const workerId = req.user?.id;

    if (!workerId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!['aceptada', 'rechazada'].includes(estado)) {
      res.status(400).json({ message: 'Estado inválido. Debe ser "aceptada" o "rechazada"' });
      return;
    }

    // Buscar la solicitud
    const assignmentRequest = await AssignmentRequest.findById(requestId);
    if (!assignmentRequest) {
      res.status(404).json({ message: 'Solicitud de asignación no encontrada' });
      return;
    }

    // Verificar que el trabajador es el propietario de la solicitud
    if (!assignmentRequest.trabajadorSolicitado.equals(workerId)) {
      res.status(403).json({ message: 'No tienes permiso para modificar esta solicitud' });
      return;
    }

    if (estado === 'aceptada') {
      // Si se acepta la solicitud, asignar el usuario al trabajador
      await User.findByIdAndUpdate(
        assignmentRequest.trabajadorSolicitado,
        { 
          $addToSet: { 
            clientesAsignados: {
              clienteId: assignmentRequest.usuarioSolicitante,
              tipoAsignacion: assignmentRequest.tipoAsignacion
            }
          } 
        }
      );

      // Eliminar la solicitud ya que se ha procesado
      await AssignmentRequest.findByIdAndDelete(requestId);

      res.json({
        message: 'Solicitud de asignación aceptada exitosamente'
      });
    } else {
      // Si se rechaza, simplemente eliminar la solicitud
      await AssignmentRequest.findByIdAndDelete(requestId);

      res.json({
        message: 'Solicitud de asignación rechazada exitosamente'
      });
    }

  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const cancelAssignmentRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Buscar la solicitud
    const assignmentRequest = await AssignmentRequest.findById(requestId);
    if (!assignmentRequest) {
      res.status(404).json({ message: 'Solicitud de asignación no encontrada' });
      return;
    }

    // Verificar que el usuario es el propietario de la solicitud
    if (!assignmentRequest.usuarioSolicitante.equals(userId)) {
      res.status(403).json({ message: 'No tienes permiso para cancelar esta solicitud' });
      return;
    }


    // Eliminar la solicitud
    await AssignmentRequest.findByIdAndDelete(requestId);

    res.json({
      message: 'Solicitud de asignación cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error al cancelar solicitud de asignación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getRequestsByRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    let requests;

    if (userRole === 'worker') {
      // Para trabajadores: obtener solicitudes dirigidas a ellos
      requests = await AssignmentRequest.find({
        trabajadorSolicitado: userId
      }).populate([
        { path: 'usuarioSolicitante', select: 'fullName email profilePicture' },
        { path: 'trabajadorSolicitado', select: 'fullName email workerType' }
      ]).sort({ createdAt: -1 });
    } else if (userRole === 'user') {
      // Para usuarios: obtener sus propias solicitudes
      requests = await AssignmentRequest.find({
        usuarioSolicitante: userId
      }).populate([
        { path: 'usuarioSolicitante', select: 'fullName email profilePicture' },
        { path: 'trabajadorSolicitado', select: 'fullName email workerType profilePicture' }
      ]).sort({ createdAt: -1 });
    } else {
      res.status(403).json({ message: 'Acceso denegado' });
      return;
    }

    res.json({
      message: 'Solicitudes obtenidas exitosamente',
      requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error al obtener solicitudes por rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const checkAssignmentAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { workerId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!workerId) {
      res.status(400).json({ message: 'ID de trabajador es requerido' });
      return;
    }

    // Sanitizar workerId
    const sanitizedWorkerId = String(workerId).trim();
    if (!sanitizedWorkerId || sanitizedWorkerId.length === 0) {
      res.status(400).json({ message: 'ID de trabajador no es válido' });
      return;
    }

    // Verificar que el usuario no se está solicitando a sí mismo
    if (userId === sanitizedWorkerId) {
      res.status(400).json({ message: 'No puedes solicitarte a ti mismo' });
      return;
    }

    // Verificar que el usuario tiene una suscripción activa
    const userSuscription = await UserSuscription.findOne({ userId })
      .populate('planId');
    
    if (!userSuscription) {
      res.status(400).json({ message: 'No tienes una suscripción activa' });
      return;
    }

    const plan = userSuscription.planId as unknown as {
      tipoPlan: string;
    };

    // Verificar que la suscripción está activa
    const now = new Date();
    if (userSuscription.fechaFin < now) {
      res.status(400).json({ message: 'Tu suscripción ha expirado' });
      return;
    }

    // Verificar que el trabajador existe
    const worker = await User.findById(sanitizedWorkerId);
    if (!worker || worker.role !== 'worker') {
      res.status(404).json({ message: 'Trabajador no encontrado' });
      return;
    }

    // Verificar que el trabajador está disponible
    if (worker.isWorkerAvailable === false) {
      res.status(400).json({ message: 'El trabajador no está disponible' });
      return;
    }


    // Obtener todas las asignaciones del usuario como nutricionista (global)
    const globalNutritionistAssignments = await User.find({
      'clientesAsignados.clienteId': userId,
      'clientesAsignados.tipoAsignacion': 'Nutricionista'
    });

    // Obtener todas las asignaciones del usuario como entrenador (global)
    const globalTrainerAssignments = await User.find({
      'clientesAsignados.clienteId': userId,
      'clientesAsignados.tipoAsignacion': 'Entrenador personal'
    });


    // Obtener solicitudes pendientes del usuario
    const pendingRequests = await AssignmentRequest.find({
      usuarioSolicitante: userId,
      estado: 'pendiente'
    });


    // Determinar qué tipos de asignación puede solicitar
    const availableTypes: string[] = [];
    const workerType = worker.workerType;

    // Verificar compatibilidad con el plan
    if (plan.tipoPlan === 'Nutrición y entrenamiento personal') {
      // Puede solicitar ambos tipos si el trabajador los soporta
      if (workerType === 'Nutricionista' || workerType === 'Nutricionista y Entrenador personal') {
        // Verificar si ya está asignado como Nutricionista GLOBALMENTE (a cualquier trabajador)
        const isGloballyAssignedAsNutritionist = globalNutritionistAssignments.length > 0;
        
        // Verificar si tiene solicitud pendiente como Nutricionista a ESTE trabajador específico
        const hasPendingNutritionistRequestToThisWorker = pendingRequests.some(
          request => request.tipoAsignacion === 'Nutricionista' && request.trabajadorSolicitado.toString() === sanitizedWorkerId
        );


        if (!isGloballyAssignedAsNutritionist && !hasPendingNutritionistRequestToThisWorker) {
          availableTypes.push('Nutricionista');
        }
      }

      if (workerType === 'Entrenador personal' || workerType === 'Nutricionista y Entrenador personal') {
        // Verificar si ya está asignado como Entrenador personal GLOBALMENTE (a cualquier trabajador)
        const isGloballyAssignedAsTrainer = globalTrainerAssignments.length > 0;
        
        // Verificar si tiene solicitud pendiente como Entrenador personal a ESTE trabajador específico
        const hasPendingTrainerRequestToThisWorker = pendingRequests.some(
          request => request.tipoAsignacion === 'Entrenador personal' && request.trabajadorSolicitado.toString() === sanitizedWorkerId
        );


        if (!isGloballyAssignedAsTrainer && !hasPendingTrainerRequestToThisWorker) {
          availableTypes.push('Entrenador personal');
        }
      }
    } else if (plan.tipoPlan === 'Nutricion') {
      if (workerType === 'Nutricionista' || workerType === 'Nutricionista y Entrenador personal') {
        // Verificar si ya está asignado como Nutricionista GLOBALMENTE
        const isGloballyAssignedAsNutritionist = globalNutritionistAssignments.length > 0;

        const hasPendingNutritionistRequest = pendingRequests.some(
          request => request.tipoAsignacion === 'Nutricionista' && request.trabajadorSolicitado.toString() === sanitizedWorkerId
        );

        if (!isGloballyAssignedAsNutritionist && !hasPendingNutritionistRequest) {
          availableTypes.push('Nutricionista');
        }
      }
    } else if (plan.tipoPlan === 'Entrenamiento personal') {
      if (workerType === 'Entrenador personal' || workerType === 'Nutricionista y Entrenador personal') {
        // Verificar si ya está asignado como Entrenador personal GLOBALMENTE
        const isGloballyAssignedAsTrainer = globalTrainerAssignments.length > 0;

        const hasPendingTrainerRequest = pendingRequests.some(
          request => request.tipoAsignacion === 'Entrenador personal' && request.trabajadorSolicitado.toString() === sanitizedWorkerId
        );

        if (!isGloballyAssignedAsTrainer && !hasPendingTrainerRequest) {
          availableTypes.push('Entrenador personal');
        }
      }
    }

    res.json({
      message: 'Disponibilidad de asignación verificada',
      availableTypes,
      workerType,
      userPlan: plan.tipoPlan
    });

  } catch (error) {
    console.error('Error al verificar disponibilidad de asignación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
