import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../../types';
import { crearDietaDesdeTemplate, obtenerTiposArquetipoDisponibles, obtenerConfiguracionArquetipo, CrearDietaDesdeTemplateDTO } from '../../service/diets/dietTemplateService';
import {
  validateAuthentication,
  validateCommonDietFields,
  createCommonDietDTO,
  handleDietCreationSuccess,
  sendSuccessResponse,
  sendErrorResponse,
  handleError
} from '../../helpers/dietValidationHelper';
import Dieta from '../../models/diets/dieta';
import logger from '../../utils/logger';

// Crear dieta desde plantilla arquetipo
export const crearDietaDesdePlantilla = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tipoArquetipo } = req.body;
    const creador = req.user?.id;

    // Validar autenticación
    if (!validateAuthentication(creador, res)) return;

    // Validar campos comunes
    if (!validateCommonDietFields({ ...req.body, tipoArquetipo }, res, false)) return;

    // Crear DTO común
    const commonDTO = createCommonDietDTO(req.body, creador!, new Date(req.body.fechaInicio));
    
    // Crear DTO específico para plantilla
    const dto: CrearDietaDesdeTemplateDTO = {
      ...commonDTO,
      tipoArquetipo
    };

    // Crear la dieta
    const dieta = await crearDietaDesdeTemplate(dto);

    // Manejar éxito
    await handleDietCreationSuccess(dieta, creador!, res, 'Dieta creada exitosamente desde plantilla');

  } catch (error) {
    handleError(error, res, 'crear dieta desde plantilla');
  }
};

// Obtener tipos de arquetipo disponibles
export const obtenerTiposArquetipo = async (req: Request, res: Response) => {
  try {
    const tipos = obtenerTiposArquetipoDisponibles();
    
    const tiposConInfo = tipos.map(tipo => {
      const config = obtenerConfiguracionArquetipo(tipo);
      return {
        tipo,
        nombre: config.nombre,
        descripcion: config.descripcion,
        caloriasObjetivo: config.caloriasObjetivo
      };
    });

    sendSuccessResponse(res, 200, 'Tipos de arquetipo obtenidos exitosamente', tiposConInfo);

  } catch (error) {
    handleError(error, res, 'obtener tipos de arquetipo');
  }
};

// Obtener información de un tipo de arquetipo específico
export const obtenerInfoArquetipo = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;

    const config = obtenerConfiguracionArquetipo(tipo);
    
    if (!config) {
      sendErrorResponse(res, 404, `Tipo de arquetipo "${tipo}" no encontrado`);
      return;
    }

    sendSuccessResponse(res, 200, 'Información del arquetipo obtenida exitosamente', {
      tipo,
      nombre: config.nombre,
      descripcion: config.descripcion,
      caloriasObjetivo: config.caloriasObjetivo
    });

  } catch (error) {
    handleError(error, res, 'obtener información del arquetipo');
  }
};

// Obtener información de suscripción para dietas del usuario
export const obtenerInfoSuscripcionDietas = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const User = mongoose.model('User');
    const user = await User.findById(userId).populate({
      path: 'suscripcion',
      populate: {
        path: 'planId',
        model: 'SuscriptionPlan'
      }
    });
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Contar dietas públicas asignadas al usuario (creadas desde plantillas por el propio usuario)
    const dietasPublicasCreadas = await Dieta.countDocuments({
      asignadaA: userId,
      publica: true,
      creador: null
    });

    // Determinar límite según suscripción
    let limiteDietas = 3; // Plan gratuito por defecto
    let tipoPlan = 'Gratuito';
    let suscripcionActiva = false;
    
    if (user.suscripcion && user.suscripcion.planId) {
      const userSuscription = user.suscripcion as { planId: { tipoPlan: string }; isActive?: () => boolean; fechaFin: Date; estadoPago: string };
      const isActive = userSuscription.isActive ? userSuscription.isActive() : 
        (userSuscription.fechaFin > new Date() && userSuscription.estadoPago === 'pagado');
      
      if (isActive) {
        suscripcionActiva = true;
        const plan = userSuscription.planId;
        if (plan) {
          switch (plan.tipoPlan) {
            case 'Nutrición personal':
            case 'Nutrición y entrenamiento personal':
              limiteDietas = 6; // Plan premium
              tipoPlan = 'Premium';
              break;
            default:
              limiteDietas = 3; // Plan gratuito
              tipoPlan = 'Gratuito';
              break;
          }
        }
      }
    }

    res.json({
      tipoPlan,
      limiteDietas,
      dietasCreadas: dietasPublicasCreadas,
      suscripcionActiva,
      puedeCrearMas: dietasPublicasCreadas < limiteDietas
    });
  } catch (error) {
    logger.error('Error al obtener información de suscripción de dietas', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id
    });
    res.status(500).json({
      message: 'Error al obtener información de suscripción de dietas',
      error: error instanceof Error ? error.message : error
    });
  }
};

// Generar dieta desde plantilla para clientes (sin rol nutricionista)
export const generarDietaDesdePlantillaCliente = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { tipoArquetipo, nombre, descripcion, tipo, duracion, comidasDiarias, fechaInicio } = req.body;

    if (!tipoArquetipo || !nombre || !tipo || !duracion || !comidasDiarias || !fechaInicio) {
      res.status(400).json({
        message: 'Faltan campos requeridos: tipoArquetipo, nombre, tipo, duracion, comidasDiarias, fechaInicio'
      });
      return;
    }

    // Verificar límites de dietas según suscripción
    const User = mongoose.model('User');
    const user = await User.findById(userId).populate({
      path: 'suscripcion',
      populate: {
        path: 'planId',
        model: 'SuscriptionPlan'
      }
    });
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Contar dietas públicas creadas por el usuario
    const dietasPublicasCreadas = await Dieta.countDocuments({
      asignadaA: userId,
      publica: true,
      creador: null
    });

    // Determinar límite según suscripción
    let limiteDietas = 3; // Plan gratuito por defecto
    
    if (user.suscripcion && user.suscripcion.planId) {
      const userSuscription = user.suscripcion as { planId: { tipoPlan: string }; isActive?: () => boolean; fechaFin: Date; estadoPago: string };
      const isActive = userSuscription.isActive ? userSuscription.isActive() : 
        (userSuscription.fechaFin > new Date() && userSuscription.estadoPago === 'pagado');
      
      if (isActive) {
        const plan = userSuscription.planId;
        if (plan) {
          switch (plan.tipoPlan) {
            case 'Nutrición personal':
            case 'Nutrición y entrenamiento personal':
              limiteDietas = 6; // Plan premium
              break;
            default:
              limiteDietas = 3; // Plan gratuito
              break;
          }
        }
      }
    }

    // Verificar si el usuario ha alcanzado el límite
    if (dietasPublicasCreadas >= limiteDietas) {
      res.status(403).json({
        message: `Has alcanzado el límite de ${limiteDietas} dietas para tu plan de suscripción. Actualiza tu plan para crear más dietas.`,
        dietasCreadas: dietasPublicasCreadas,
        limiteDietas
      });
      return;
    }

    // Crear DTO para plantilla - el creador es null y publica es true
    const dto: CrearDietaDesdeTemplateDTO = {
      nombre,
      descripcion,
      tipo,
      duracion,
      comidasDiarias,
      fechaInicio: new Date(fechaInicio),
      creador: null as unknown as mongoose.Types.ObjectId, // null para dietas generadas por clientes
      asignadaA: [new mongoose.Types.ObjectId(userId)],
      tipoArquetipo,
      publica: true, // Dietas generadas por clientes son públicas
      draftMode: false // Las dietas generadas están listas para usar
    };

    // Crear la dieta
    const dieta = await crearDietaDesdeTemplate(dto);

    logger.info('Dieta generada desde plantilla por cliente', {
      dietaId: dieta._id,
      userId,
      tipoArquetipo
    });

    res.status(201).json({
      success: true,
      message: 'Dieta generada exitosamente desde plantilla',
      data: dieta
    });

  } catch (error) {
    logger.error('Error al generar dieta desde plantilla para cliente', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id
    });
    res.status(500).json({
      message: 'Error al generar dieta desde plantilla',
      error: error instanceof Error ? error.message : error
    });
  }
};
