import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearDietaService } from '../../service/diets/dietService';

export const crearDieta = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const creadorId = req.user?.id;
    if (!creadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }    
    const { nombre, descripcion, tipo, duracion, comidasDiarias, asignadaA, fechaInicio } = req.body;

    const dieta = await crearDietaService({
      creadorId,
      nombre,
      descripcion,
      tipo,
      duracion,
      comidasDiarias,
      asignadaA,
      fechaInicio
    });

    res.status(201).json({ message: 'Dieta creada correctamente', dieta });
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la dieta', error: (error as Error).message });
  }
};