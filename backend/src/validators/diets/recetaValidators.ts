import { Response } from 'express';
import mongoose from 'mongoose';
import logger from '../../utils/logger';
import Receta from '../../models/diets/receta';
import User from '../../models/users/user';
import { esIdValido } from '../commonValidators';

// Interface para ingrediente en validación
interface IngredienteValidacion {
  nombre: string;
  peso: number;
  informacionNutricional: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    fibra?: number;
    azucares?: number;
    sal?: number;
    sodio?: number;
  };
  marca?: string;
  id?: string;
  imagenIngrediente?: string;
  fuente?: string;
}

export const verificarRecetaExiste = async (
  recetaId: string,
  res: Response
): Promise<typeof Receta.prototype | null> => {
  if (!esIdValido(recetaId)) {
    res.status(400).json({ message: 'El ID de receta proporcionado no es válido' });
    return null;
  }

  try {
    const receta = await Receta.findById(recetaId).populate('ingredientes.ingrediente');
    if (!receta) {
      res.status(404).json({ message: 'Receta no encontrada' });
      return null;
    }
    return receta;
  } catch (error) {
    logger.error('Error al buscar receta', { recetaId, error: (error as Error).message });
    res.status(500).json({ message: 'Error interno del servidor' });
    return null;
  }
};

export const validarDatosReceta = (
  datosReceta: {
    nombreReceta?: string;
    ingredientes?: Array<{
      nombre: string;
      peso: number;
      informacionNutricional: {
        calorias: number;
        proteinas: number;
        carbohidratos: number;
        grasas: number;
        fibra?: number;
        azucares?: number;
        sal?: number;
        sodio?: number;
      };
      marca?: string;
      id?: string;
      imagenIngrediente?: string;
      fuente?: string;
    }> | unknown;
    pasosPreparacion?: string[] | unknown;
    tiempoPreparacion?: string;
    publica?: boolean | string | unknown;
  },
  res: Response
): boolean => {
  if (!datosReceta.nombreReceta || datosReceta.nombreReceta.trim() === '') {
    res.status(400).json({ message: 'El nombre de la receta es obligatorio' });
    return false;
  }

  if (datosReceta.nombreReceta.length > 100) {
    res.status(400).json({ message: 'El nombre de la receta no puede exceder los 100 caracteres' });
    return false;
  }

  if (datosReceta.tiempoPreparacion && datosReceta.tiempoPreparacion.length > 50) {
    res.status(400).json({ message: 'El tiempo de preparación no puede exceder los 50 caracteres' });
    return false;
  }

  if (!datosReceta.ingredientes || !Array.isArray(datosReceta.ingredientes) || datosReceta.ingredientes.length === 0) {
    res.status(400).json({ message: 'Debe proporcionar al menos un ingrediente' });
    return false;
  }

  const ingredientesValidos = datosReceta.ingredientes.every(ingrediente => {
    if (typeof ingrediente !== 'object' || ingrediente === null) {
      return false;
    }
    
    const ing = ingrediente as IngredienteValidacion;
    
    // Validar campos obligatorios
    if (!ing.nombre || typeof ing.nombre !== 'string' || ing.nombre.trim() === '') {
      return false;
    }
    
    if (!ing.peso || typeof ing.peso !== 'number' || ing.peso <= 0) {
      return false;
    }
    
    if (!ing.informacionNutricional || typeof ing.informacionNutricional !== 'object') {
      return false;
    }
    
    // Validar información nutricional
    const info = ing.informacionNutricional;
    if (typeof info.calorias !== 'number' || 
        typeof info.proteinas !== 'number' || 
        typeof info.carbohidratos !== 'number' || 
        typeof info.grasas !== 'number') {
      return false;
    }
    
    return true;
  });

  if (!ingredientesValidos) {
    res.status(400).json({ message: 'Todos los ingredientes deben tener nombre, peso e información nutricional válidos' });
    return false;
  }

  if (datosReceta.pasosPreparacion && Array.isArray(datosReceta.pasosPreparacion)) {
    const pasosValidos = datosReceta.pasosPreparacion.every(paso => 
      typeof paso === 'string' && paso.trim() !== ''
    );

    if (!pasosValidos) {
      res.status(400).json({ message: 'Todos los pasos de preparación deben ser texto válido' });
      return false;
    }

    // Validar longitud máxima de cada paso
    for (let i = 0; i < datosReceta.pasosPreparacion.length; i++) {
      const paso = datosReceta.pasosPreparacion[i];
      if (paso.length > 150) {
        res.status(400).json({ message: `El paso ${i + 1} no puede exceder los 150 caracteres` });
        return false;
      }
    }
  }

  if (datosReceta.publica !== undefined) {
    if (typeof datosReceta.publica !== 'boolean' && 
        typeof datosReceta.publica !== 'string' && 
        !['true', 'false'].includes(String(datosReceta.publica))) {
      res.status(400).json({ message: 'El campo publica debe ser un valor booleano (true/false)' });
      return false;
    }
  }

  return true;
};

export const verificarPermisosCreador = async (
  receta: typeof Receta.prototype,
  userId: string,
  res: Response,
  operacion: string
): Promise<boolean> => {
  if (!receta.creador || receta.creador.toString() !== userId) {
    logger.info(`Intento de ${operacion} sin permisos`, { 
      userId, 
      recetaId: receta._id,
      creadorId: receta.creador 
    });
    res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    return false;
  }
  return true;
};

export const verificarCreadorNutricionista = async (
  creadorId: string,
  res: Response
): Promise<boolean> => {
  try {
    const creador = await User.findById(creadorId);
    if (!creador) {
      res.status(400).json({ message: 'El creador especificado no existe' });
      return false;
    }

    if (creador.role !== 'worker') {
      res.status(400).json({ message: 'El creador debe tener rol de worker' });
      return false;
    }

    if (creador.workerType !== 'Nutricionista' && 
        creador.workerType !== 'Nutricionista y Entrenador personal') {
      res.status(400).json({ message: 'El creador debe ser un nutricionista o nutricionista y entrenador personal' });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error al verificar creador', { creadorId, error: (error as Error).message });
    res.status(500).json({ message: 'Error interno del servidor' });
    return false;
  }
};

export const verificarPermisosAccesoReceta = async (
  receta: typeof Receta.prototype,
  userId: string,
  res: Response
): Promise<boolean> => {
  try {
    // Si la receta es pública, cualquier usuario autenticado puede acceder
    if (receta.publica) {
      return true;
    }

    // Si es admin, puede acceder a cualquier receta
    const user = await User.findById(userId);
    if (user && user.role === 'admin') {
      return true;
    }

    // Si es el creador de la receta, puede acceder
    if (receta.creador && receta.creador.toString() === userId) {
      return true;
    }

    // Si es un cliente asignado del creador, puede acceder
    if (receta.creador) {
      const creador = await User.findById(receta.creador);
      if (creador && creador.clientesAsignados) {
        const esClienteAsignado = creador.clientesAsignados.some(
          (assignment: { clienteId: mongoose.Types.ObjectId; tipoAsignacion: string }) => 
            assignment.clienteId.toString() === userId
        );
        if (esClienteAsignado) {
          return true;
        }
      }
    }

    // Si no cumple ninguna condición, no tiene acceso
    logger.info('Intento de acceso a receta sin permisos', { 
      userId, 
      recetaId: receta._id,
      recetaPublica: receta.publica,
      creadorId: receta.creador 
    });
    res.status(403).json({ message: 'No tienes permiso para acceder a esta receta' });
    return false;
  } catch (error) {
    logger.error('Error al verificar permisos de acceso a receta', { 
      userId, 
      recetaId: receta._id, 
      error: (error as Error).message 
    });
    res.status(500).json({ message: 'Error interno del servidor' });
    return false;
  }
};

export const verificarPermisosEdicionEliminacion = async (
  receta: typeof Receta.prototype,
  userId: string,
  res: Response,
  operacion: string
): Promise<boolean> => {
  try {
    // Si es admin, puede editar/eliminar cualquier receta
    const user = await User.findById(userId);
    if (user && user.role === 'admin') {
      return true;
    }

    // Si es el creador de la receta, puede editar/eliminar
    if (receta.creador && receta.creador.toString() === userId) {
      return true;
    }

    // Si no cumple ninguna condición, no tiene permisos
    logger.info(`Intento de ${operacion} sin permisos`, {
      userId,
      recetaId: receta._id,
      creadorId: receta.creador
    });
    res.status(403).json({ message: `No tienes permiso para ${operacion} esta receta` });
    return false;
  } catch (error) {
    logger.error(`Error al verificar permisos de ${operacion}`, {
      userId,
      recetaId: receta._id,
      error: (error as Error).message
    });
    res.status(500).json({ message: 'Error interno del servidor' });
    return false;
  }
};

export const manejarErrorReceta = (
  error: Error,
  res: Response,
  operacion: string,
  contexto?: Record<string, unknown>
): void => {
  logger.error(`Error al ${operacion}`, { 
    error: error.message, 
    stack: error.stack,
    ...contexto 
  });

  if ((error as Error & { status?: number }).status === 404) {
    res.status(404).json({ message: error.message });
    return;
  }

  if (error.message.includes('obligatorio') || 
      error.message.includes('debe ser') || 
      error.message.includes('válido')) {
    res.status(400).json({ message: error.message });
    return;
  }

  res.status(500).json({ 
    message: `Error al ${operacion}`, 
    error: error.message 
  });
};
