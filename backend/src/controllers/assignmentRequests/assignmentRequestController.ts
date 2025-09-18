import { Response } from 'express';
import AssignmentRequest from '../../models/users/assignmentRequest';
import User from '../../models/users/user';
import { AuthenticatedRequest } from '../../types';

interface MongoError extends Error {
  code?: number;
}

export const createAssignmentRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { trabajadorSolicitado } = req.body;
    const usuarioSolicitante = req.user?.id;

    if (!usuarioSolicitante) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!trabajadorSolicitado) {
      res.status(400).json({ message: 'El ID del trabajador es requerido' });
      return;
    }

    // Verificar que el trabajador existe y es válido
    const worker = await User.findById(trabajadorSolicitado);
    if (!worker || worker.role !== 'worker') {
      res.status(404).json({ message: 'Trabajador no encontrado' });
      return;
    }

    // Verificar que el trabajador está disponible
    if (worker.isWorkerAvailable === false) {
      res.status(400).json({ message: 'El trabajador no está disponible para nuevas asignaciones' });
      return;
    }

    // Verificar que el usuario no esté ya asignado a este trabajador
    const existingAssignment = await User.findOne({
      _id: usuarioSolicitante,
      clientesAsignados: trabajadorSolicitado
    });

    if (existingAssignment) {
      res.status(400).json({ message: 'Ya estás asignado a este trabajador' });
      return;
    }

    // Verificar que no existe una solicitud pendiente previa
    const existingRequest = await AssignmentRequest.findOne({
      usuarioSolicitante,
      trabajadorSolicitado,
      estado: 'pendiente'
    });

    if (existingRequest) {
      res.status(400).json({ message: 'Ya tienes una solicitud pendiente para este trabajador' });
      return;
    }

    // Crear la nueva solicitud
    const assignmentRequest = new AssignmentRequest({
      usuarioSolicitante,
      trabajadorSolicitado,
      estado: 'pendiente'
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
      res.status(400).json({ message: 'Ya tienes una solicitud pendiente para este trabajador' });
      return;
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getAssignmentRequestsByUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const assignmentRequests = await AssignmentRequest.find({
      usuarioSolicitante: userId
    }).populate([
      { path: 'usuarioSolicitante', select: 'fullName email' },
      { path: 'trabajadorSolicitado', select: 'fullName email workerType biography' }
    ]).sort({ createdAt: -1 });

    res.json({
      message: 'Solicitudes de asignación obtenidas exitosamente',
      assignmentRequests
    });

  } catch (error) {
    console.error('Error al obtener solicitudes de asignación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getAssignmentRequestsByWorker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.id;

    if (!workerId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const assignmentRequests = await AssignmentRequest.find({
      trabajadorSolicitado: workerId
    }).populate([
      { path: 'usuarioSolicitante', select: 'fullName email' },
      { path: 'trabajadorSolicitado', select: 'fullName email workerType' }
    ]).sort({ createdAt: -1 });

    res.json({
      message: 'Solicitudes de asignación obtenidas exitosamente',
      assignmentRequests
    });

  } catch (error) {
    console.error('Error al obtener solicitudes de asignación:', error);
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

    // Verificar que la solicitud está pendiente
    if (assignmentRequest.estado !== 'pendiente') {
      res.status(400).json({ message: 'Esta solicitud ya ha sido procesada' });
      return;
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

    // Poblar los datos para la respuesta
    await assignmentRequest.populate([
      { path: 'usuarioSolicitante', select: 'fullName email' },
      { path: 'trabajadorSolicitado', select: 'fullName email workerType' }
    ]);

    res.json({
      message: `Solicitud de asignación ${estado} exitosamente`,
      assignmentRequest
    });

  } catch (error) {
    console.error('Error al actualizar estado de solicitud:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getPendingAssignmentRequestsByWorker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.id;

    if (!workerId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const assignmentRequests = await AssignmentRequest.find({
      trabajadorSolicitado: workerId,
      estado: 'pendiente'
    }).populate([
      { path: 'usuarioSolicitante', select: 'fullName email' },
      { path: 'trabajadorSolicitado', select: 'fullName email workerType' }
    ]).sort({ createdAt: -1 });

    res.json({
      message: 'Solicitudes pendientes obtenidas exitosamente',
      assignmentRequests,
      count: assignmentRequests.length
    });

  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
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

    // Verificar que la solicitud está pendiente
    if (assignmentRequest.estado !== 'pendiente') {
      res.status(400).json({ message: 'Solo se pueden cancelar solicitudes pendientes' });
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
