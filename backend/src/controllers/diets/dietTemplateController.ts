import { Request, Response } from 'express';
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
