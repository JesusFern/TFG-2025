import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { verificarAutenticacion } from '../validators/commonValidators';
import User from '../models/users/user';

/**
 * Verifica que el usuario autenticado es un trabajador
 */
export const verificarEsTrabajador = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<string | null> => {
  const userId = verificarAutenticacion(req, res, 'acceder a información de trabajador');
  if (!userId) return null;

  const worker = await User.findById(userId);
  if (!worker || worker.role !== 'worker') {
    res.status(403).json({
      success: false,
      message: 'Solo los trabajadores pueden acceder a esta información'
    });
    return null;
  }

  return userId;
};

/**
 * Verifica que el trabajador tiene acceso a un cliente específico con un tipo de asignación dado
 */
export const verificarAccesoCliente = (
  worker: any,
  clienteId: string,
  tipoAsignacion: 'Nutricionista' | 'Entrenador personal',
  res: Response
): boolean => {
  const clienteAsignado = worker.clientesAsignados?.find(
    (asignacion: any) => 
      asignacion.clienteId.toString() === clienteId && 
      asignacion.tipoAsignacion === tipoAsignacion
  );

  if (!clienteAsignado) {
    res.status(403).json({
      success: false,
      message: `No tienes acceso a las estadísticas de ${tipoAsignacion.toLowerCase()} de este cliente`
    });
    return false;
  }

  return true;
};

/**
 * Helper completo para verificar acceso de trabajador a cliente
 */
export const verificarAccesoTrabajadorCliente = async (
  req: AuthenticatedRequest,
  res: Response,
  tipoAsignacion: 'Nutricionista' | 'Entrenador personal'
): Promise<{ userId: string; clienteId: string } | null> => {
  const userId = await verificarEsTrabajador(req, res);
  if (!userId) return null;

  const { clienteId } = req.params;
  const worker = await User.findById(userId);
  
  if (!worker || !verificarAccesoCliente(worker, clienteId, tipoAsignacion, res)) {
    return null;
  }

  return { userId, clienteId };
};
