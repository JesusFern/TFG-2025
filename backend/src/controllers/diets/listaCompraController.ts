import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as listaCompraService from '../../service/diets/listaCompraService';
import { verificarAutenticacion, esIdValido } from '../../validators/commonValidators';
import { verificarDietaExiste } from '../../validators/diets/dietValidators';
import logger from '../../utils/logger';

/**
 * Genera una lista de compra para una semana específica de una dieta
 * GET /api/diets/:dietaId/lista-compra/semana/:semana
 */
export const generarListaCompraSemana = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'generar lista de compra de semana');
    if (!userId) return;

    const dietaId = req.params.dietaId;
    const semana = parseInt(req.params.semana);

    // Validar parámetros
    if (!esIdValido(dietaId)) {
      res.status(400).json({ 
        success: false, 
        message: 'ID de dieta inválido' 
      });
      return;
    }

    if (isNaN(semana) || semana < 1) {
      res.status(400).json({ 
        success: false, 
        message: 'Número de semana inválido. Debe ser un número mayor a 0' 
      });
      return;
    }

    logger.info('Solicitud de lista de compra para semana específica', { userId, dietaId, semana });

    // Verificar que la dieta existe (los permisos ya fueron validados en el middleware)
    const dieta = await verificarDietaExiste(dietaId, res);
    if (!dieta) return;

    // Generar la lista de compra para la semana específica
    const listaCompraSemana = await listaCompraService.generarListaCompraSemana(dietaId, semana);

    if (!listaCompraSemana) {
      res.status(404).json({
        success: false,
        message: `La semana ${semana} no existe en esta dieta.`
      });
      return;
    }

    logger.info('Lista de compra de semana generada exitosamente', { 
      userId, 
      dietaId,
      semana,
      totalIngredientes: listaCompraSemana.totalIngredientes
    });

    res.status(200).json({
      success: true,
      message: `Lista de compra de la semana ${semana} generada exitosamente`,
      data: {
        dietaId,
        semana: listaCompraSemana
      }
    });

  } catch (error) {
    logger.error('Error al generar lista de compra de semana', { 
      error: error instanceof Error ? error.message : 'Error desconocido',
      dietaId: req.params.dietaId,
      semana: req.params.semana,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar la lista de compra de la semana',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

