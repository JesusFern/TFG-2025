import mongoose from 'mongoose';
import Dieta from '../../models/diets/dieta';
import { TIPOS_DIETA } from '../../constants/dietTypes';

export interface CrearDietaDesdeExistenteDTO {
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  fechaInicio: Date;
  creador: mongoose.Types.ObjectId;
  asignadaA?: mongoose.Types.ObjectId[];
  dietaOrigenId: mongoose.Types.ObjectId;
  horasComidas?: string[]; // Horas personalizadas de cada comida
  nombreComidas?: string[]; // Nombres personalizados de cada comida
}

export async function crearDietaDesdeExistente(dto: CrearDietaDesdeExistenteDTO): Promise<mongoose.Document> {
  // Validar que el tipo de dieta está en los tipos válidos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tiposValidos = dto.tipo.filter(tipo => TIPOS_DIETA.includes(tipo as any));
  if (tiposValidos.length === 0) {
    throw new Error(`Tipo de dieta no válido. Tipos disponibles: ${TIPOS_DIETA.join(', ')}`);
  }

  // Validar duración
  if (dto.duracion < 1 || dto.duracion > 365) {
    throw new Error('La duración debe estar entre 1 y 365 días');
  }

  // Validar comidas diarias
  if (dto.comidasDiarias < 1 || dto.comidasDiarias > 10) {
    throw new Error('Las comidas diarias deben estar entre 1 y 10');
  }

  // Buscar la dieta origen
  const dietaOrigen = await Dieta.findById(dto.dietaOrigenId)
    .populate('dias.comidas.platos.receta')
    .populate('dias.comidas.platos.ingredientesPersonalizados.ingrediente');

  if (!dietaOrigen) {
    throw new Error('Dieta origen no encontrada');
  }

  // Verificar que la dieta origen es pública o del mismo creador
  if (!dietaOrigen.publica && dietaOrigen.creador?.toString() !== dto.creador.toString()) {
    throw new Error('No tienes permisos para copiar esta dieta');
  }

  // Crear los días adaptados
  const dias = [];
  const diasOrigen = dietaOrigen.dias;
  
  for (let i = 0; i < dto.duracion; i++) {
    const diaOrigenIndex = i % diasOrigen.length;
    const diaOrigen = diasOrigen[diaOrigenIndex];
    
    // Adaptar las comidas según el número de comidas diarias
    const comidasAdaptadas = adaptarComidas(
      diaOrigen.comidas, 
      dto.comidasDiarias, 
      dto.horasComidas, 
      dto.nombreComidas
    );
    
    // Calcular información nutricional del día
    const infoNutricional = calcularInfoNutricionalDia(comidasAdaptadas);
    
    dias.push({
      caloriasTotales: infoNutricional.calorias,
      proteinas: infoNutricional.proteinas,
      hidratosCarbono: infoNutricional.hidratosCarbono,
      grasas: infoNutricional.grasas,
      numeroComidas: dto.comidasDiarias,
      cumplimiento: true,
      comidas: comidasAdaptadas
    });
  }

  // Crear la nueva dieta
  const dieta = new Dieta({
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    tipo: dto.tipo,
    duracion: dto.duracion,
    comidasDiarias: dto.comidasDiarias,
    dias: dias,
    fechaInicio: dto.fechaInicio,
    creador: dto.creador,
    asignadaA: dto.asignadaA || [],
    publica: false,
    draftMode: true
  });

  await dieta.save();
  return dieta;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptarComidas(
  comidasOrigen: any[], 
  comidasDiarias: number,
  horasComidas?: string[],
  nombreComidas?: string[]
): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let comidasAdaptadas: any[] = [];
  
  // Valores por defecto si no se proporcionan nombres/horas personalizados
  const nombresDefault = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena'];
  const horasDefault = ['08:00', '11:00', '14:00', '17:00', '20:00'];
  
  if (comidasOrigen.length === comidasDiarias) {
    comidasAdaptadas = [...comidasOrigen];
  } else if (comidasOrigen.length > comidasDiarias) {
    // Cortar comidas si hay más de las necesarias
    comidasAdaptadas = comidasOrigen.slice(0, comidasDiarias);
  } else {
    // Si hay menos comidas, repetir la última comida
    comidasAdaptadas = [...comidasOrigen];
    while (comidasAdaptadas.length < comidasDiarias) {
      const ultimaComida = comidasOrigen[comidasOrigen.length - 1];
      const index = comidasAdaptadas.length;
      comidasAdaptadas.push({
        ...ultimaComida,
        nombreComida: nombreComidas?.[index] || nombresDefault[index] || `Comida ${index + 1}`,
        horaEstimada: horasComidas?.[index] || horasDefault[index] || calcularHoraComida(index)
      });
    }
  }
  
  // Actualizar nombres y horas de todas las comidas Y procesar platos en una sola operación
  return comidasAdaptadas.map((comida, index) => {
    // Primero procesar los platos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const platosAdaptados = (comida.platos || []).map((plato: any) => {
      // Si el plato tiene una receta, copiar sus ingredientes a ingredientes personalizados
      if (plato.receta && plato.receta.ingredientes) {
        // Solo copiar ingredientes de la receta si no hay ingredientes personalizados existentes
        // para evitar duplicaciones
        if (!plato.ingredientesPersonalizados || plato.ingredientesPersonalizados.length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ingredientesDeReceta = plato.receta.ingredientes.map((ing: any) => ({
            ingrediente: ing.ingrediente._id || ing.ingrediente,
            peso: ing.peso
          }));
          
          return {
            ...plato,
            ingredientesPersonalizados: ingredientesDeReceta
          };
        }
      }
      return plato;
    });
    
    // Luego crear la comida con todos los datos
    return {
      ...comida,
      nombreComida: nombreComidas?.[index] || comida.nombreComida || nombresDefault[index] || `Comida ${index + 1}`,
      horaEstimada: horasComidas?.[index] || comida.horaEstimada || horasDefault[index] || calcularHoraComida(index),
      platos: platosAdaptados
    };
  });
}

function calcularHoraComida(indiceComida: number): string {
  const horas = ['08:00', '11:00', '14:00', '17:00', '20:00', '22:00', '07:00', '10:00', '13:00', '16:00'];
  return horas[indiceComida - 1] || '12:00';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcularInfoNutricionalDia(comidas: any[]): { calorias: number; proteinas: number; hidratosCarbono: number; grasas: number } {
  let calorias = 0;
  let proteinas = 0;
  let hidratosCarbono = 0;
  let grasas = 0;

  comidas.forEach(comida => {
    if (comida.platos) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      comida.platos.forEach((plato: any) => {
        // Solo calcular desde ingredientes personalizados (ya incluyen los de recetas)
        if (plato.ingredientesPersonalizados) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          plato.ingredientesPersonalizados.forEach((ing: any) => {
            const ingrediente = ing.ingrediente;
            const peso = ing.peso;
            if (ingrediente && ingrediente.calorias) {
              calorias += (ingrediente.calorias * peso) / 100;
              proteinas += (ingrediente.proteinas * peso) / 100;
              hidratosCarbono += (ingrediente.hidratosCarbono * peso) / 100;
              grasas += (ingrediente.grasas * peso) / 100;
            }
          });
        }
      });
    }
  });

  return {
    calorias: Math.round(calorias),
    proteinas: Math.round(proteinas * 10) / 10,
    hidratosCarbono: Math.round(hidratosCarbono * 10) / 10,
    grasas: Math.round(grasas * 10) / 10
  };
}