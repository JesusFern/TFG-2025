import { Response } from 'express';
import { buscarAlimentosHibridoService, buscarAlimentosLocalesService } from '../../service/alimentos/alimentosHibridoService';
import { AuthenticatedRequest } from '../../types';
import logger from '../../utils/logger';
import { verificarAutenticacion } from '../../validators/commonValidators';

/**
 * Busca alimentos usando sistema híbrido (base de datos local + OpenFoodFacts)
 */
export const buscarAlimentosHibrido = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar autenticación
    const userId = verificarAutenticacion(req, res, 'buscar alimentos híbrido');
    if (!userId) return;

    const { nombre } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const maxResults = parseInt(req.query.maxResults as string) || 20;

    // Validar parámetros
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      res.status(400).json({
        message: 'El parámetro "nombre" es requerido y debe ser una cadena de texto no vacía',
        codigo: 'PARAMETRO_REQUERIDO'
      });
      return;
    }

    if (nombre.trim().length < 2) {
      res.status(400).json({
        message: 'El nombre debe tener al menos 2 caracteres',
        codigo: 'LONGITUD_MINIMA'
      });
      return;
    }

    if (page < 1) {
      res.status(400).json({
        message: 'La página debe ser un número entero mayor a 0',
        codigo: 'PAGINA_INVALIDA'
      });
      return;
    }

    if (maxResults < 1 || maxResults > 100) {
      res.status(400).json({
        message: 'El número máximo de resultados debe estar entre 1 y 100',
        codigo: 'MAX_RESULTADOS_INVALIDO'
      });
      return;
    }

    logger.info('Iniciando búsqueda híbrida de alimentos', {
      userId,
      nombre: nombre.trim(),
      page,
      maxResults
    });

    // Buscar alimentos usando sistema híbrido
    const resultado = await buscarAlimentosHibridoService(nombre.trim(), page, maxResults);

    logger.info('Búsqueda híbrida completada', {
      userId,
      nombre: nombre.trim(),
      encontrados: resultado.alimentos.length,
      fuentes: resultado.fuentes
    });

    res.status(200).json({
      message: `Se encontraron ${resultado.total} alimentos para "${nombre.trim()}"`,
      alimentos: resultado.alimentos,
      paginacion: {
        pagina: resultado.pagina,
        total: resultado.total,
        maxResultados: resultado.maxResultados,
        hayMasResultados: resultado.hayMasResultados
      },
      fuentes: {
        local: resultado.fuentes.local,
        openfoodfacts: resultado.fuentes.openfoodfacts,
        descripcion: {
          local: 'Base de datos local (prioriza fuente Interna)',
          openfoodfacts: 'Base de datos internacional de productos alimentarios'
        }
      }
    });

  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido al buscar alimentos';
    logger.error('Error en controlador buscarAlimentosHibrido', {
      userId: req.user?.id,
      nombre: req.query.nombre,
      error: mensaje
    });

    res.status(500).json({
      message: 'Error interno del servidor al buscar alimentos',
      codigo: 'ERROR_BUSQUEDA_HIBRIDA'
    });
  }
};

/**
 * Busca alimentos solo en la base de datos local
 */
export const buscarAlimentosLocales = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar autenticación
    const userId = verificarAutenticacion(req, res, 'buscar alimentos locales');
    if (!userId) return;

    const { nombre } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const maxResults = parseInt(req.query.maxResults as string) || 20;

    // Validar parámetros
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      res.status(400).json({
        message: 'El parámetro "nombre" es requerido y debe ser una cadena de texto no vacía',
        codigo: 'PARAMETRO_REQUERIDO'
      });
      return;
    }

    if (nombre.trim().length < 2) {
      res.status(400).json({
        message: 'El nombre debe tener al menos 2 caracteres',
        codigo: 'LONGITUD_MINIMA'
      });
      return;
    }

    if (page < 1) {
      res.status(400).json({
        message: 'La página debe ser un número entero mayor a 0',
        codigo: 'PAGINA_INVALIDA'
      });
      return;
    }

    if (maxResults < 1 || maxResults > 100) {
      res.status(400).json({
        message: 'El número máximo de resultados debe estar entre 1 y 100',
        codigo: 'MAX_RESULTADOS_INVALIDO'
      });
      return;
    }

    logger.info('Iniciando búsqueda local de alimentos', {
      userId,
      nombre: nombre.trim(),
      page,
      maxResults
    });

    // Buscar solo en base de datos local
    const resultado = await buscarAlimentosLocalesService(nombre.trim(), page, maxResults);

    logger.info('Búsqueda local completada', {
      userId,
      nombre: nombre.trim(),
      encontrados: resultado.alimentos.length,
      total: resultado.total
    });

    res.status(200).json({
      message: `Se encontraron ${resultado.total} alimentos locales para "${nombre.trim()}"`,
      alimentos: resultado.alimentos,
      paginacion: {
        pagina: resultado.pagina,
        total: resultado.total,
        maxResultados: resultado.maxResultados,
        hayMasResultados: resultado.hayMasResultados
      },
      fuente: 'local'
    });

  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido al buscar alimentos';
    logger.error('Error en controlador buscarAlimentosLocales', {
      userId: req.user?.id,
      nombre: req.query.nombre,
      error: mensaje
    });

    res.status(500).json({
      message: 'Error interno del servidor al buscar alimentos',
      codigo: 'ERROR_BUSQUEDA_LOCAL'
    });
  }
};

/**
 * Verifica el estado de los servicios de alimentación
 */
export const verificarServiciosAlimentacion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar autenticación
    const userId = verificarAutenticacion(req, res, 'verificar servicios');
    if (!userId) return;

    logger.info('Verificando servicios de alimentación', { userId });

    // Test básico del sistema híbrido
    let sistemaHibridoEstado = 'OK';
    let sistemaHibridoDetalle = '';
    let localEstado = 'OK';
    let openFoodFactsEstado = 'OK';
    
    try {
      const testHibrido = await buscarAlimentosHibridoService('manzana', 1, 2);
      
      if (testHibrido.fuentes.local === 0 && testHibrido.fuentes.openfoodfacts === 0) {
        sistemaHibridoEstado = 'SIN_RESULTADOS';
        sistemaHibridoDetalle = 'Ninguna fuente devolvió resultados para alimentos de prueba';
      } else {
        localEstado = testHibrido.fuentes.local > 0 ? 'OK' : 'SIN_RESULTADOS';
        openFoodFactsEstado = testHibrido.fuentes.openfoodfacts > 0 ? 'OK' : 'SIN_RESULTADOS';
      }
    } catch (error) {
      sistemaHibridoEstado = 'ERROR';
      sistemaHibridoDetalle = error instanceof Error ? error.message : 'Error desconocido';
      localEstado = 'ERROR';
      openFoodFactsEstado = 'ERROR';
    }

    const estadoGeneral = (localEstado === 'OK' || openFoodFactsEstado === 'OK') ? 'OK' : 'ERROR';

    logger.info('Verificación de servicios completada', {
      userId,
      local: localEstado,
      openFoodFacts: openFoodFactsEstado,
      general: estadoGeneral
    });

    res.status(200).json({
      message: 'Verificación de servicios de alimentación completada',
      estado: estadoGeneral,
      servicios: {
        local: {
          estado: localEstado,
          descripcion: 'Base de datos local de ingredientes',
          enfoque: 'Alimentos con prioridad por fuente Interna',
          detalle: localEstado === 'OK' ? 'Funcionando correctamente' : 'Sin resultados o error'
        },
        openfoodfacts: {
          estado: openFoodFactsEstado,
          descripcion: 'Base de datos internacional de productos alimentarios',
          enfoque: 'Productos envasados con código de barras',
          detalle: openFoodFactsEstado === 'OK' ? 'Funcionando correctamente' : 'Sin resultados o error'
        }
      },
      sistemaHibrido: {
        estado: sistemaHibridoEstado,
        detalle: sistemaHibridoDetalle || 'Sistema funcionando correctamente'
      },
      recomendacion: estadoGeneral === 'OK' 
        ? 'Sistema híbrido funcionando. Base de datos local para ingredientes internos, OpenFoodFacts para productos procesados.'
        : 'Algunos servicios tienen problemas. Verificar conectividad y base de datos.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error al verificar servicios de alimentación', {
      userId: req.user?.id,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });

    res.status(500).json({
      message: 'Error interno al verificar servicios',
      codigo: 'ERROR_VERIFICACION_SERVICIOS'
    });
  }
};
