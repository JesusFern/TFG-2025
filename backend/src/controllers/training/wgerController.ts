import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import logger from '../../utils/logger';
import { searchWgerExercises, getWgerExerciseDetails } from '../../service/training/wgerService';

export const buscarEjerciciosWger = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (!query || query.trim().length < 2) {
      res.status(400).json({
        message: 'La consulta debe tener al menos 2 caracteres'
      });
      return;
    }

    const ejercicios = await searchWgerExercises(query.trim(), limit || 20);

    logger.info('Búsqueda de ejercicios en wger exitosa', { 
      query, 
      resultsCount: ejercicios.length 
    });

    res.status(200).json({ 
      ejercicios,
      total: ejercicios.length
    });
  } catch (error) {
    logger.error('Error al buscar ejercicios en wger', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({
      message: 'Error al buscar ejercicios en wger',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const obtenerDetallesEjercicioWger = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = matchedData(req) as { id: string };
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      res.status(400).json({
        message: 'ID de ejercicio no válido'
      });
      return;
    }

    const ejercicio = await getWgerExerciseDetails(exerciseId);

    if (!ejercicio) {
      res.status(404).json({
        message: 'Ejercicio no encontrado'
      });
      return;
    }

    logger.info('Detalles de ejercicio wger obtenidos correctamente', { exerciseId });

    res.status(200).json({ ejercicio });
  } catch (error) {
    logger.error('Error al obtener detalles de ejercicio wger', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({
      message: 'Error al obtener detalles de ejercicio wger',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
