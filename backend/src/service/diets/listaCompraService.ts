import Dieta from '../../models/diets/dieta';
import logger from '../../utils/logger';

export interface IngredienteListaCompra {
  ingredienteId: string;
  nombre: string;
  pesoTotal: number;
  unidad: string;
  precioEstimado?: number;
  fuente: 'Interna' | 'Openfoodfacts' | 'Trabajador';
}

export interface ListaCompraSemanal {
  semana: number;
  fechaInicio: string;
  fechaFin: string;
  diasIncluidos: number[];
  ingredientes: IngredienteListaCompra[];
  totalIngredientes: number;
  pesoTotal: number;
}


/**
 * Calcula las semanas de lunes a viernes basándose en la fecha de inicio y duración
 */
export const calcularSemanasDieta = (fechaInicio: Date, duracion: number): Array<{
  semana: number;
  fechaInicio: Date;
  fechaFin: Date;
  diasIncluidos: number[];
}> => {
  const semanas: Array<{
    semana: number;
    fechaInicio: Date;
    fechaFin: Date;
    diasIncluidos: number[];
  }> = [];

  const fechaActual = new Date(fechaInicio);
  let diaActual = 0;
  let semanaActual = 1;

  while (diaActual < duracion) {
    const fechaInicioSemana = new Date(fechaActual);
    
    // Calcular el domingo de la semana actual
    const diaSemanaActual = fechaActual.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    const diasHastaDomingo = diaSemanaActual === 0 ? 0 : 7 - diaSemanaActual; // Días hasta el domingo
    const fechaFinSemana = new Date(fechaActual);
    fechaFinSemana.setDate(fechaActual.getDate() + diasHastaDomingo);
    
    const diasIncluidos: number[] = [];
    const fechaTemp = new Date(fechaInicioSemana);
    
    // Incluir días desde la fecha actual hasta el domingo (o hasta el final de la dieta)
    const diasEnEstaSemana = Math.min(diasHastaDomingo + 1, duracion - diaActual);
    for (let i = 0; i < diasEnEstaSemana && diaActual < duracion; i++) {
      diasIncluidos.push(diaActual);
      fechaTemp.setDate(fechaTemp.getDate() + 1);
      diaActual++;
    }
    
    if (diasIncluidos.length > 0) {
      semanas.push({
        semana: semanaActual,
        fechaInicio: new Date(fechaInicioSemana),
        fechaFin: new Date(fechaFinSemana),
        diasIncluidos
      });
    }
    
    // Mover al lunes de la siguiente semana
    fechaActual.setDate(fechaFinSemana.getDate() + 1);
    semanaActual++;
  }

  return semanas;
};

/**
 * Extrae ingredientes de los platos de una dieta para días específicos
 * Agrupa por nombre de ingrediente y suma las cantidades
 */
export const extraerIngredientesDias = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dieta: any,
  diasIncluidos: number[]
): Promise<Map<string, IngredienteListaCompra>> => {
  const ingredientesMap = new Map<string, IngredienteListaCompra>();

  for (const diaIndex of diasIncluidos) {
    if (!dieta.dias[diaIndex]) continue;

    const dia = dieta.dias[diaIndex];
    
    for (const comida of dia.comidas) {
      for (const plato of comida.platos) {
        // Solo procesar ingredientes personalizados (las recetas son solo referencias)
        if (plato.ingredientesPersonalizados && plato.ingredientesPersonalizados.length > 0) {
          for (const ingredientePlato of plato.ingredientesPersonalizados) {
            // Manejar tanto ObjectId como objeto poblado
            const ingredienteId = typeof ingredientePlato.ingrediente === 'object' && ingredientePlato.ingrediente._id
              ? ingredientePlato.ingrediente._id.toString()
              : ingredientePlato.ingrediente.toString();
            
            const peso = ingredientePlato.peso || 0;
            
            // Obtener nombre del ingrediente para usar como clave de agrupación
            const nombreIngrediente = typeof ingredientePlato.ingrediente === 'object' && ingredientePlato.ingrediente.nombre
              ? ingredientePlato.ingrediente.nombre
              : '';

            if (ingredientesMap.has(nombreIngrediente)) {
              // Sumar al peso existente del mismo ingrediente
              const existente = ingredientesMap.get(nombreIngrediente)!;
              existente.pesoTotal += peso;
            } else {
              // Crear nueva entrada agrupada por nombre
              ingredientesMap.set(nombreIngrediente, {
                ingredienteId,
                nombre: nombreIngrediente,
                pesoTotal: peso,
                unidad: 'g',
                fuente: typeof ingredientePlato.ingrediente === 'object' && ingredientePlato.ingrediente.fuente
                  ? ingredientePlato.ingrediente.fuente
                  : 'Interna'
              });
            }
          }
        }
      }
    }
  }

  return ingredientesMap;
};

/**
 * Procesa los ingredientes ya agrupados
 */
export const procesarIngredientesAgrupados = (
  ingredientesMap: Map<string, IngredienteListaCompra>
): IngredienteListaCompra[] => {
  const ingredientesProcesados: IngredienteListaCompra[] = [];

  // Procesar cada ingrediente del mapa
  for (const [nombreIngrediente, ingredienteData] of ingredientesMap) {
    if (nombreIngrediente && ingredienteData.pesoTotal > 0) {
      ingredientesProcesados.push({
        ...ingredienteData,
        nombre: nombreIngrediente
      });
    }
  }

  // Ordenar alfabéticamente por nombre
  return ingredientesProcesados.sort((a, b) => a.nombre.localeCompare(b.nombre));
};



/**
 * Genera la lista de compra para una semana específica de una dieta
 */
export const generarListaCompraSemana = async (dietaId: string, semana: number): Promise<ListaCompraSemanal | null> => {
  try {
    logger.info('Generando lista de compra para semana específica', { dietaId, semana });

    // Obtener la dieta con todos los datos necesarios
    const dieta = await Dieta.findById(dietaId)
      .populate({
        path: 'dias.comidas.platos.ingredientesPersonalizados.ingrediente',
        model: 'Ingrediente',
        select: 'nombre fuente'
      });

    if (!dieta) {
      throw new Error('Dieta no encontrada');
    }

    // Calcular las semanas
    const duracion = dieta.duracion || 0;
    const semanasCalculadas = calcularSemanasDieta(dieta.fechaInicio, duracion);
    
    // Buscar la semana específica
    const semanaCalculada = semanasCalculadas.find(s => s.semana === semana);
    
    if (!semanaCalculada) {
      logger.warn('Semana no encontrada', { dietaId, semana, totalSemanas: semanasCalculadas.length });
      return null;
    }

    logger.debug('Procesando semana', { 
      semana: semanaCalculada.semana, 
      diasIncluidos: semanaCalculada.diasIncluidos 
    });

    // Extraer ingredientes para esta semana (ya agrupados por nombre)
    const ingredientesMap = await extraerIngredientesDias(dieta, semanaCalculada.diasIncluidos);
    
    // Procesar ingredientes agrupados y asignar categorías
    const ingredientes = procesarIngredientesAgrupados(ingredientesMap);
    
    // Calcular totales
    const pesoTotalSemana = ingredientes.reduce((sum, ing) => sum + ing.pesoTotal, 0);

    const listaCompraSemana: ListaCompraSemanal = {
      semana: semanaCalculada.semana,
      fechaInicio: semanaCalculada.fechaInicio.toISOString().split('T')[0],
      fechaFin: semanaCalculada.fechaFin.toISOString().split('T')[0],
      diasIncluidos: semanaCalculada.diasIncluidos,
      ingredientes,
      totalIngredientes: ingredientes.length,
      pesoTotal: pesoTotalSemana
    };

    logger.info('Lista de compra de semana generada exitosamente', {
      dietaId,
      semana,
      totalIngredientes: listaCompraSemana.totalIngredientes,
      pesoTotal: listaCompraSemana.pesoTotal
    });

    return listaCompraSemana;

  } catch (error) {
    logger.error('Error al generar lista de compra de semana', { dietaId, semana, error });
    throw error;
  }
};

