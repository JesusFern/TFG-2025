import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearDietaDesdeTemplate, obtenerTiposArquetipoDisponibles, obtenerConfiguracionArquetipo, CrearDietaDesdeTemplateDTO } from '../../service/diets/dietTemplateService';
import { buscarDietaYVerificarPermisos } from '../../helpers/dietHelper';
import mongoose from 'mongoose';

// Crear dieta desde plantilla arquetipo
export const crearDietaDesdePlantilla = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      nombre,
      descripcion,
      tipo,
      duracion,
      comidasDiarias,
      fechaInicio,
      asignadaA,
      tipoArquetipo
    } = req.body;

    const creador = req.user?.id;

    if (!creador) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Validar campos requeridos
    if (!nombre || !tipo || !duracion || !comidasDiarias || !fechaInicio || !tipoArquetipo) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, tipo, duracion, comidasDiarias, fechaInicio, tipoArquetipo'
      });
      return;
    }

    // Validar duración
    if (duracion < 1 || duracion > 365) {
      res.status(400).json({
        success: false,
        message: 'La duración debe estar entre 1 y 365 días'
      });
      return;
    }

    // Validar comidas diarias
    if (comidasDiarias < 1 || comidasDiarias > 10) {
      res.status(400).json({
        success: false,
        message: 'Las comidas diarias deben estar entre 1 y 10'
      });
      return;
    }

    // Validar fecha de inicio
    const fechaInicioDate = new Date(fechaInicio);
    if (isNaN(fechaInicioDate.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Fecha de inicio inválida'
      });
      return;
    }

    // Crear DTO
    const dto: CrearDietaDesdeTemplateDTO = {
      nombre,
      descripcion,
      tipo: Array.isArray(tipo) ? tipo : [tipo],
      duracion,
      comidasDiarias,
      fechaInicio: fechaInicioDate,
      creador: new mongoose.Types.ObjectId(creador),
      asignadaA: asignadaA ? (Array.isArray(asignadaA) ? asignadaA.map(id => new mongoose.Types.ObjectId(id)) : [new mongoose.Types.ObjectId(asignadaA)]) : [],
      tipoArquetipo
    };

    // Crear la dieta
    const dieta = await crearDietaDesdeTemplate(dto);

    // Obtener la dieta completa con población
    const dietaCompleta = await buscarDietaYVerificarPermisos((dieta as { _id: { toString(): string } })._id.toString(), creador, false);

    res.status(201).json({
      success: true,
      message: 'Dieta creada exitosamente desde plantilla',
      data: dietaCompleta
    });

  } catch (error) {
    console.error('Error al crear dieta desde plantilla:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
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

    res.json({
      success: true,
      data: tiposConInfo
    });

  } catch (error) {
    console.error('Error al obtener tipos de arquetipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener información de un tipo de arquetipo específico
export const obtenerInfoArquetipo = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;

    const config = obtenerConfiguracionArquetipo(tipo);
    
    if (!config) {
      res.status(404).json({
        success: false,
        message: `Tipo de arquetipo "${tipo}" no encontrado`
      });
      return;
    }

    res.json({
      success: true,
      data: {
        tipo,
        nombre: config.nombre,
        descripcion: config.descripcion,
        caloriasObjetivo: config.caloriasObjetivo
      }
    });

  } catch (error) {
    console.error('Error al obtener información del arquetipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
