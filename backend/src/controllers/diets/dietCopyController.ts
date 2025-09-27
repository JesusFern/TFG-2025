import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearDietaDesdeExistente, CrearDietaDesdeExistenteDTO } from '../../service/diets/dietCopyService';
import { buscarDietaYVerificarPermisos } from '../../helpers/dietHelper';
import mongoose from 'mongoose';

// Crear dieta desde una dieta existente
export const crearDietaDesdeExistenteController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      nombre,
      descripcion,
      tipo,
      duracion,
      comidasDiarias,
      fechaInicio,
      asignadaA,
      dietaOrigenId
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
    if (!nombre || !tipo || !duracion || !comidasDiarias || !fechaInicio || !dietaOrigenId) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, tipo, duracion, comidasDiarias, fechaInicio, dietaOrigenId'
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

    // Validar ObjectId de dieta origen
    if (!mongoose.Types.ObjectId.isValid(dietaOrigenId)) {
      res.status(400).json({
        success: false,
        message: 'ID de dieta origen inválido'
      });
      return;
    }

    // Crear DTO
    const dto: CrearDietaDesdeExistenteDTO = {
      nombre,
      descripcion,
      tipo: Array.isArray(tipo) ? tipo : [tipo],
      duracion,
      comidasDiarias,
      fechaInicio: fechaInicioDate,
      creador: new mongoose.Types.ObjectId(creador),
      asignadaA: asignadaA ? (Array.isArray(asignadaA) ? asignadaA.map(id => new mongoose.Types.ObjectId(id)) : [new mongoose.Types.ObjectId(asignadaA)]) : [],
      dietaOrigenId: new mongoose.Types.ObjectId(dietaOrigenId)
    };

    // Crear la dieta
    const dieta = await crearDietaDesdeExistente(dto);

    // Obtener la dieta completa con población
    const dietaCompleta = await buscarDietaYVerificarPermisos((dieta as { _id: { toString(): string } })._id.toString(), creador, false);

    res.status(201).json({
      success: true,
      message: 'Dieta creada exitosamente desde dieta existente',
      data: dietaCompleta
    });

  } catch (error) {
    console.error('Error al crear dieta desde existente:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
};
