import { PipelineStage, Document, Types } from 'mongoose';
import Ingrediente from '../../models/diets/ingrediente';
import { buscarAlimentosOpenFoodFacts, AlimentoOpenFoodFacts } from '../../helpers/ingredientes/ingredientesHelper';
import logger from '../../utils/logger';

// Interface para ingredientes de la base de datos local
export interface IngredienteLocal {
  _id: string;
  nombre: string;
  calorias: number;
  proteinas: number;
  grasas: number;
  hidratosCarbono: number;
  fuente: 'Interna' | 'Openfoodfacts' | 'Trabajador';
  creador?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IngredienteDocument extends Document {
  _id: Types.ObjectId;
  nombre: string;
  calorias: number;
  proteinas: number;
  grasas: number;
  hidratosCarbono: number;
  fuente: 'Interna' | 'Openfoodfacts' | 'Trabajador';
  creador?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResultadoBusquedaHibrida {
  alimentos: Array<IngredienteLocal | AlimentoOpenFoodFacts>;
  total: number;
  pagina: number;
  maxResultados: number;
  hayMasResultados: boolean;
  fuentes: {
    local: number;
    openfoodfacts: number;
  };
}


function convertirIngredienteLocal(ingrediente: IngredienteDocument): IngredienteLocal {
  return {
    _id: ingrediente._id.toString(),
    nombre: ingrediente.nombre,
    calorias: ingrediente.calorias,
    proteinas: ingrediente.proteinas,
    grasas: ingrediente.grasas,
    hidratosCarbono: ingrediente.hidratosCarbono,
    fuente: ingrediente.fuente,
    creador: ingrediente.creador?.toString(),
    createdAt: ingrediente.createdAt,
    updatedAt: ingrediente.updatedAt
  };
}

async function buscarIngredientesLocales(
  nombre: string, 
  page: number, 
  maxResults: number
): Promise<{ ingredientes: IngredienteLocal[]; total: number }> {
  try {
    const skip = (page - 1) * maxResults;
    
    // Búsqueda con texto completo y ordenamiento por fuente
    const pipeline: PipelineStage[] = [
      {
        $match: {
          $text: { $search: nombre }
        }
      },
      {
        // TS no reconoce correctamente $meta en score; casteamos a PipelineStage
        $addFields: {
          score: { $meta: 'textScore' },
          // Priorizar fuente Interna (1), luego Openfoodfacts (2), luego Trabajador (3)
          prioridadFuente: {
            $switch: {
              branches: [
                { case: { $eq: ['$fuente', 'Interna'] }, then: 1 },
                { case: { $eq: ['$fuente', 'Openfoodfacts'] }, then: 2 },
                { case: { $eq: ['$fuente', 'Trabajador'] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      {
        // Casteo a any para permitir uso de $meta en sort con types de Mongoose
        $sort: ({
          prioridadFuente: 1 as const, 
          score: { $meta: 'textScore' } 
        } as unknown) as Record<string, 1 | -1>
      },
      {
        $facet: {
          ingredientes: [
            { $skip: skip },
            { $limit: maxResults }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const resultado = await Ingrediente.aggregate(pipeline);
    
    const ingredientes = resultado[0]?.ingredientes || [];
    const total = resultado[0]?.total[0]?.count || 0;

    return {
      ingredientes: ingredientes.map(convertirIngredienteLocal),
      total
    };

  } catch (error) {
    logger.error('Error buscando ingredientes locales', {
      nombre,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    return { ingredientes: [], total: 0 };
  }
}

/**
 * Busca alimentos solo en la base de datos local
 */
export const buscarAlimentosLocalesService = async (
  nombre: string,
  page: number = 1,
  maxResults: number = 20
): Promise<ResultadoBusquedaHibrida> => {
  try {
    logger.info('Iniciando búsqueda local de alimentos', {
      nombre: nombre.trim(),
      page,
      maxResults
    });

    // Validar parámetros
    if (!nombre || nombre.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (maxResults > 100) {
      maxResults = 100;
    }

    if (maxResults < 1) {
      maxResults = 20;
    }

    // Buscar solo en base de datos local
    const resultadoLocal = await buscarIngredientesLocales(nombre.trim(), page, maxResults);

    logger.info('Búsqueda local completada', {
      nombre: nombre.trim(),
      encontrados: resultadoLocal.ingredientes.length,
      total: resultadoLocal.total
    });

    return {
      alimentos: resultadoLocal.ingredientes,
      total: resultadoLocal.total,
      pagina: page,
      maxResultados: maxResults,
      hayMasResultados: (page * maxResults) < resultadoLocal.total,
      fuentes: {
        local: resultadoLocal.ingredientes.length,
        openfoodfacts: 0
      }
    };

  } catch (error) {
    logger.error('Error en búsqueda local', {
      nombre,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    throw error;
  }
};

/**
 * Busca alimentos híbridos (local + OpenFoodFacts)
 */
export const buscarAlimentosHibridoService = async (
  nombre: string,
  page: number = 1,
  maxResults: number = 20
): Promise<ResultadoBusquedaHibrida> => {
  try {
    logger.info('Iniciando búsqueda híbrida de alimentos', {
      nombre: nombre.trim(),
      page,
      maxResults
    });

    // Validar parámetros
    if (!nombre || nombre.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (maxResults > 100) {
      maxResults = 100;
    }

    if (maxResults < 1) {
      maxResults = 20;
    }

    // Búsquedas paralelas
    const [resultadoLocal, resultadoOpenFF] = await Promise.allSettled([
      buscarIngredientesLocales(nombre.trim(), page, maxResults),
      buscarAlimentosOpenFoodFacts(nombre.trim(), page, maxResults)
    ]);

    // Procesar resultados locales
    let ingredientesLocales: IngredienteLocal[] = [];
    let totalLocal = 0;
    
    if (resultadoLocal.status === 'fulfilled') {
      ingredientesLocales = resultadoLocal.value.ingredientes;
      totalLocal = resultadoLocal.value.total;
    } else {
      logger.error('Error en búsqueda local', {
        error: resultadoLocal.reason instanceof Error ? resultadoLocal.reason.message : 'Error desconocido'
      });
    }

    // Procesar resultados de OpenFoodFacts
    let alimentosOpenFF: AlimentoOpenFoodFacts[] = [];
    let totalOpenFF = 0;
    
    if (resultadoOpenFF.status === 'fulfilled') {
      alimentosOpenFF = resultadoOpenFF.value.alimentos;
      totalOpenFF = resultadoOpenFF.value.total;
    } else {
      logger.error('Error en búsqueda OpenFoodFacts', {
        error: resultadoOpenFF.reason instanceof Error ? resultadoOpenFF.reason.message : 'Error desconocido'
      });
    }

    // Combinar resultados (locales primero, luego OpenFoodFacts)
    const todosLosAlimentos = [...ingredientesLocales, ...alimentosOpenFF];
    const totalCombinado = totalLocal + totalOpenFF;

    // Calcular si hay más resultados
    const hayMasResultados = (page * maxResults) < totalCombinado;

    logger.info('Búsqueda híbrida completada', {
      nombre: nombre.trim(),
      local: ingredientesLocales.length,
      openfoodfacts: alimentosOpenFF.length,
      total: todosLosAlimentos.length
    });

    return {
      alimentos: todosLosAlimentos,
      total: todosLosAlimentos.length,
      pagina: page,
      maxResultados: maxResults,
      hayMasResultados,
      fuentes: {
        local: ingredientesLocales.length,
        openfoodfacts: alimentosOpenFF.length
      }
    };

  } catch (error) {
    logger.error('Error en búsqueda híbrida', {
      nombre,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    throw error;
  }
};
