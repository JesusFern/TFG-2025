import AssignmentRequest from '../../models/assignmentRequest/assignmentRequest';
import User from '../../models/users/user';
import mongoose from 'mongoose';

export const createAssignmentRequest = async (
  usuarioSolicitante: mongoose.Types.ObjectId,
  trabajadorSolicitado: mongoose.Types.ObjectId,
  tipoAsignacion: 'Nutricionista' | 'Entrenador personal'
) => {
    // Verificar que el trabajador existe y está disponible
    const worker = await User.findById(trabajadorSolicitado);
    if (!worker || worker.role !== 'worker') {
      throw new Error('Trabajador no encontrado');
    }

    if (worker.isWorkerAvailable === false) {
      throw new Error('El trabajador no está disponible para nuevas asignaciones');
    }

    // Verificar que no existe una solicitud pendiente previa del mismo tipo
    const existingRequest = await AssignmentRequest.findOne({
      usuarioSolicitante,
      trabajadorSolicitado,
      tipoAsignacion,
      estado: 'pendiente'
    });

    if (existingRequest) {
      throw new Error('Ya tienes una solicitud pendiente para este trabajador');
    }

    // Verificar que el usuario no esté ya asignado a este trabajador para este tipo de asignación
    const existingAssignment = await User.findOne({
      _id: trabajadorSolicitado,
      'clientesAsignados.clienteId': usuarioSolicitante,
      'clientesAsignados.tipoAsignacion': tipoAsignacion
    });

    if (existingAssignment) {
      throw new Error('Ya estás asignado a este trabajador');
    }

    // Crear la nueva solicitud
    const assignmentRequest = new AssignmentRequest({
      usuarioSolicitante,
      trabajadorSolicitado,
      tipoAsignacion,
      estado: 'pendiente'
    });

  await assignmentRequest.save();
  return assignmentRequest;
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
        { 
          $addToSet: { 
            clientesAsignados: {
              clienteId: assignmentRequest.usuarioSolicitante,
              tipoAsignacion: assignmentRequest.tipoAsignacion
            }
          } 
        }
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

