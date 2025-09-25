import { Response } from 'express';
import Ingrediente from '../../models/diets/ingrediente';
import { AuthenticatedRequest } from '../../types';
import logger from '../../utils/logger';
import { verificarAutenticacion } from '../../validators/commonValidators';
import mongoose from 'mongoose';

/**
 * Guarda un ingrediente de OpenFoodFacts en la base de datos local
 */
export const guardarIngredienteOpenFoodFacts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar autenticación
    const userId = verificarAutenticacion(req, res, 'guardar ingrediente OpenFoodFacts');
    if (!userId) return;

    const { 
      nombre, 
      calorias, 
      proteinas, 
      grasas, 
      hidratosCarbono
    } = req.body;

    // Validar datos requeridos
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      res.status(400).json({
        message: 'El nombre del ingrediente es requerido',
        codigo: 'NOMBRE_REQUERIDO'
      });
      return;
    }

    if (typeof calorias !== 'number' || calorias < 0) {
      res.status(400).json({
        message: 'Las calorías deben ser un número mayor o igual a 0',
        codigo: 'CALORIAS_INVALIDAS'
      });
      return;
    }

    if (typeof proteinas !== 'number' || proteinas < 0) {
      res.status(400).json({
        message: 'Las proteínas deben ser un número mayor o igual a 0',
        codigo: 'PROTEINAS_INVALIDAS'
      });
      return;
    }

    if (typeof grasas !== 'number' || grasas < 0) {
      res.status(400).json({
        message: 'Las grasas deben ser un número mayor o igual a 0',
        codigo: 'GRASAS_INVALIDAS'
      });
      return;
    }

    if (typeof hidratosCarbono !== 'number' || hidratosCarbono < 0) {
      res.status(400).json({
        message: 'Los hidratos de carbono deben ser un número mayor o igual a 0',
        codigo: 'HIDRATOS_INVALIDOS'
      });
      return;
    }

    const nombreLimpio = nombre.trim();

    // Verificar si ya existe un ingrediente con ese nombre
    let nombreFinal = nombreLimpio;
    const ingredienteExistente = await Ingrediente.findOne({ nombre: nombreLimpio });
    
    if (ingredienteExistente) {
      // Si existe, agregar sufijo para diferenciarlo
      nombreFinal = `${nombreLimpio} - OpenFoodFacts`;
      
      // Verificar si también existe con el sufijo
      const ingredienteConSufijo = await Ingrediente.findOne({ nombre: nombreFinal });
      if (ingredienteConSufijo) {
        res.status(409).json({
          message: 'Ya existe un ingrediente con ese nombre en la base de datos',
          codigo: 'INGREDIENTE_DUPLICADO',
          ingredienteExistente: {
            _id: ingredienteExistente._id,
            nombre: ingredienteExistente.nombre,
            fuente: ingredienteExistente.fuente
          }
        });
        return;
      }
    }

    // Crear nuevo ingrediente
    const nuevoIngrediente = new Ingrediente({
      nombre: nombreFinal,
      calorias,
      proteinas,
      grasas,
      hidratosCarbono,
      fuente: 'Openfoodfacts'
    });

    await nuevoIngrediente.save();

    logger.info('Ingrediente de OpenFoodFacts guardado en base de datos local', {
      userId,
      ingredienteId: nuevoIngrediente._id,
      nombreOriginal: nombreLimpio,
      nombreFinal,
      fuente: 'Openfoodfacts'
    });

    res.status(201).json({
      message: 'Ingrediente guardado correctamente en la base de datos local',
      ingrediente: {
        _id: nuevoIngrediente._id,
        nombre: nuevoIngrediente.nombre,
        calorias: nuevoIngrediente.calorias,
        proteinas: nuevoIngrediente.proteinas,
        grasas: nuevoIngrediente.grasas,
        hidratosCarbono: nuevoIngrediente.hidratosCarbono,
        fuente: nuevoIngrediente.fuente,
        createdAt: nuevoIngrediente.createdAt,
        updatedAt: nuevoIngrediente.updatedAt
      },
      metadata: {
        nombreOriginal: nombreLimpio,
        nombreModificado: nombreFinal !== nombreLimpio,
        razonModificacion: nombreFinal !== nombreLimpio ? 'Nombre duplicado' : null
      }
    });

  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido al guardar ingrediente';
    logger.error('Error en controlador guardarIngredienteOpenFoodFacts', {
      userId: req.user?.id,
      error: mensaje,
      body: req.body
    });

    res.status(500).json({
      message: 'Error interno del servidor al guardar ingrediente',
      codigo: 'ERROR_GUARDAR_INGREDIENTE'
    });
  }
};

/**
 * Obtiene un ingrediente por su ID
 */
export const obtenerIngredientePorId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener ingrediente');
    if (!userId) return;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de ingrediente inválido' });
      return;
    }

    const ingrediente = await Ingrediente.findById(id);

    if (!ingrediente) {
      res.status(404).json({ message: 'Ingrediente no encontrado' });
      return;
    }

    logger.info('Ingrediente obtenido correctamente', { 
      ingredienteId: ingrediente._id,
      nombre: ingrediente.nombre
    });

    res.status(200).json(ingrediente);
  } catch (error) {
    logger.error('Error al obtener ingrediente por ID:', error);
    res.status(500).json({
      message: 'Error interno del servidor al obtener el ingrediente'
    });
  }
};
