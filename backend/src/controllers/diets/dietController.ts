import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearDietaService } from '../../service/diets/dietService';
import { actualizarPlatosService } from '../../service/diets/plateService';



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

export const actualizarPlatos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { platos } = req.body;
    const actualizados = await actualizarPlatosService(platos);
    res.status(200).json({ message: 'Platos actualizados', platos: actualizados });
  } catch (error) {
    res.status(400).json({
      message: 'Error al actualizar los platos',
      error: error instanceof Error ? error.message : error
    });
  }
};