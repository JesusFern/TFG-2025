import { Request, Response } from 'express';
import User from '../../models/users/user';
import { MongoError, AuthenticatedRequest } from '../../types';

export const registerWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      birthDate,
      profilePicture,
      workerType,
      biography,
      availability
    } = req.body;

    const worker = new User({
      fullName,
      email,
      password,
      phoneNumber,
      birthDate,
      profilePicture,
      workerType,
      biography,
      availability,
      isWorkerAvailable: true,
      role: 'worker'
    });

    await worker.save();

    res.status(201).json({
      message: 'Trabajador registrado exitosamente',
      worker: {
        id: worker._id,
        fullName: worker.fullName,
        email: worker.email,
        phoneNumber: worker.phoneNumber,
        birthDate: worker.birthDate,
        profilePicture: worker.profilePicture,
        workerType: worker.workerType,
        biography: worker.biography,
        availability: worker.availability,
        isWorkerAvailable: worker.isWorkerAvailable,
        role: worker.role
      }
    });
  } catch (error: unknown) {
    const mongoError = error as MongoError;
    if (mongoError.code === 11000) {
      const duplicatedField = Object.keys(mongoError.keyValue!)[0];
      res.status(400).json({
        message: `El ${duplicatedField} ya está en uso. Por favor, utiliza otro.`,
        field: duplicatedField,
      });
    } else if ((error as Error).name === 'ValidationError') {
      res.status(400).json({ message: (error as Error).message });
    } else {
      res.status(500).json({ message: (error as Error).message || 'Error interno del servidor' });
    }
  }
};

export const getAssignedClients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.id;
    if (!workerId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const worker = await User.findById(workerId);
    if (!worker) {
      res.status(404).json({ message: 'Trabajador no encontrado' });
      return;
    }

    if (worker.role !== 'worker') {
      res.status(403).json({ message: 'Solo los trabajadores pueden acceder a esta información' });
      return;
    }

    if (worker.workerType !== 'Nutricionista' && worker.workerType !== 'Nutricionista y Entrenador personal') {
      res.status(403).json({ message: 'Solo los nutricionistas pueden acceder a esta información' });
      return;
    }

    if (!worker.clientesAsignados || worker.clientesAsignados.length === 0) {
      res.status(200).json({ 
        message: 'No tienes clientes asignados actualmente',
        clientes: []
      });
      return;
    }

    // Extraer los IDs de los clientes asignados
    const clienteIds = worker.clientesAsignados?.map(assignment => assignment.clienteId) || [];
    
    const clientes = await User.find(
      { _id: { $in: clienteIds } },
      { 
        password: 0, 
        __v: 0,
      }
    ).populate('datosSaludYNutricion datosActividadFisica');

    // Mapear los clientes con su tipo de asignación correspondiente
    const clientesConTipoAsignacion = clientes.map(cliente => {
      const assignment = worker.clientesAsignados?.find(
        assignment => assignment.clienteId.toString() === (cliente._id as unknown as string).toString()
      );
      
      return {
        ...(cliente.toObject ? cliente.toObject() : cliente),
        tipoAsignacion: assignment?.tipoAsignacion
      };
    });

    res.status(200).json({
      message: `Se encontraron ${clientesConTipoAsignacion.length} clientes asignados`,
      clientes: clientesConTipoAsignacion
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ 
      message: 'Error al obtener los clientes asignados',
      error: err.message 
    });
  }
};