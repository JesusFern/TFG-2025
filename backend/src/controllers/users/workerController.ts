import { Request, Response } from 'express';
import User from '../../models/users/user';
import { MongoError } from '../../types';

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