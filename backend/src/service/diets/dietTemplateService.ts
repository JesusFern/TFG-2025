import mongoose from 'mongoose';
import Dieta from '../../models/diets/dieta';
import Receta from '../../models/diets/receta';
import Ingrediente from '../../models/diets/ingrediente';
import { TIPOS_DIETA } from '../../constants/dietTypes';

interface PlatoTemplate {
  orden: number;
  nombre: string;
  receta?: mongoose.Types.ObjectId;
  ingredientesPersonalizados?: Array<{
    ingrediente: mongoose.Types.ObjectId;
    peso: number;
  }>;
  caloriasEstimadas: number;
}

interface ComidaTemplate {
  horaEstimada: string;
  nombreComida: string;
  platos: PlatoTemplate[];
  caloriasTotales: number;
}

interface DiaTemplate {
  caloriasTotales: number;
  proteinas: number;
  hidratosCarbono: number;
  grasas: number;
  numeroComidas: number;
  cumplimiento: boolean;
  comidas: ComidaTemplate[];
}

// Configuraciones específicas para cada tipo de dieta (extraídas del seeder)
const CONFIGURACIONES_DIETA = {
  'Mediterránea': {
    nombre: "Dieta Mediterránea Tradicional Española",
    descripcion: "Dieta mediterránea tradicional española con 5 comidas diarias. Incluye desayunos con tostadas y aceite de oliva, variedad de almuerzos (3 días con legumbres: lentejas, garbanzos, judías blancas; 2 días con arroz/pasta), cenas alternando pescado mediterráneo y carne magra, snacks con ingredientes directos alternando frutos secos mixtos y frutas frescas, y abundante aceite de oliva. Ideal como base para personalizar según las necesidades del cliente.",
    caloriasObjetivo: 2000
  },
  'Vegetariana': {
    nombre: "Dieta Vegetariana Equilibrada",
    descripcion: "Dieta vegetariana equilibrada con 5 comidas diarias. Incluye desayunos con avena y frutas, almuerzos con legumbres, quinoa y verduras, cenas con huevos y lácteos, snacks con frutos secos y frutas. Rica en proteínas vegetales, fibra y vitaminas. Ideal como base para personalizar según las necesidades del cliente.",
    caloriasObjetivo: 1800
  },
  'Vegana': {
    nombre: "Dieta Vegana Completa",
    descripcion: "Dieta vegana completa con 5 comidas diarias. Incluye desayunos con avena y frutas, almuerzos con legumbres, quinoa y verduras, cenas con tofu y tempeh, snacks con frutos secos y frutas. Rica en proteínas vegetales, fibra, vitaminas B12 y hierro. Ideal como base para personalizar según las necesidades del cliente.",
    caloriasObjetivo: 1900
  },
  'Keto': {
    nombre: "Dieta Cetogénica",
    descripcion: "Dieta cetogénica con 5 comidas diarias. Alta en grasas saludables (70-80%), moderada en proteínas (15-20%) y muy baja en carbohidratos (5-10%). Incluye desayunos con huevos y aguacate, almuerzos con carnes y verduras, cenas con pescado y aceite de oliva, snacks con frutos secos. Ideal para pérdida de peso y control de azúcar en sangre.",
    caloriasObjetivo: 1600
  },
  'Sin gluten': {
    nombre: "Dieta Sin Gluten",
    descripcion: "Dieta sin gluten con 5 comidas diarias. Incluye desayunos con avena sin gluten y frutas, almuerzos con arroz, quinoa y verduras, cenas con carnes y pescados, snacks con frutos secos y frutas. Libre de trigo, cebada, centeno y avena contaminada. Ideal para personas con celiaquía o sensibilidad al gluten.",
    caloriasObjetivo: 2000
  },
  'Baja en carbohidratos': {
    nombre: "Dieta Baja en Carbohidratos",
    descripcion: "Dieta baja en carbohidratos con 5 comidas diarias. Moderada en carbohidratos (20-30%), alta en proteínas (25-30%) y grasas saludables (40-50%). Incluye desayunos con huevos y verduras, almuerzos con carnes y ensaladas, cenas con pescado y verduras, snacks con frutos secos. Ideal para control de peso y azúcar en sangre.",
    caloriasObjetivo: 1700
  },
  'Alta en proteínas': {
    nombre: "Dieta Alta en Proteínas",
    descripcion: "Dieta alta en proteínas con 5 comidas diarias. Alta en proteínas (30-35%), moderada en carbohidratos (35-40%) y grasas (25-30%). Incluye desayunos con huevos y lácteos, almuerzos con carnes y legumbres, cenas con pescado y verduras, snacks con yogur y frutos secos. Ideal para ganancia de masa muscular y recuperación deportiva.",
    caloriasObjetivo: 2200
  }
};

// Variaciones de snacks con diferentes pesos
const VARIACIONES_SNACKS = {
  frutosSecos: [
    { nombre: "Almendras", peso: 10 }, { nombre: "Nueces", peso: 8 }, { nombre: "Avellanas", peso: 7 },
    { nombre: "Almendras", peso: 12 }, { nombre: "Nueces", peso: 6 }, { nombre: "Avellanas", peso: 7 },
    { nombre: "Almendras", peso: 11 }, { nombre: "Nueces", peso: 7 }, { nombre: "Avellanas", peso: 7 },
    { nombre: "Almendras", peso: 10 }, { nombre: "Nueces", peso: 8 }, { nombre: "Avellanas", peso: 7 },
    { nombre: "Almendras", peso: 11 }, { nombre: "Nueces", peso: 7 }, { nombre: "Avellanas", peso: 7 }
  ],
  ensaladaFrutas: [
    { nombre: "Manzana", peso: 80 }, { nombre: "Plátano", peso: 60 }, { nombre: "Naranja", peso: 100 },
    { nombre: "Manzana", peso: 90 }, { nombre: "Plátano", peso: 50 }, { nombre: "Naranja", peso: 110 },
    { nombre: "Manzana", peso: 85 }, { nombre: "Plátano", peso: 55 }, { nombre: "Naranja", peso: 105 },
    { nombre: "Manzana", peso: 80 }, { nombre: "Plátano", peso: 60 }, { nombre: "Naranja", peso: 100 },
    { nombre: "Manzana", peso: 80 }, { nombre: "Plátano", peso: 60 }, { nombre: "Naranja", peso: 100 }
  ]
};

// Función helper para crear snacks con variaciones
const crearSnack = (tipo: 'frutosSecos' | 'ensaladaFrutas', diaIndex: number) => ({
  tipo: "ingredientes" as const,
  nombre: tipo === 'frutosSecos' ? "Frutos secos mixtos" : "Ensalada de frutas",
  ingredientes: tipo === 'frutosSecos' 
    ? VARIACIONES_SNACKS.frutosSecos.slice(diaIndex * 3, (diaIndex * 3) + 3)
    : VARIACIONES_SNACKS.ensaladaFrutas.slice(diaIndex * 3, (diaIndex * 3) + 3)
});

// Plantillas de comidas por día (refactorizadas)
const PLANTILLAS_COMIDAS = [
  // Lunes - Legumbres + Verduras
  {
    desayuno: ["Tostada con tomate y aceite de oliva", "Avena con frutas"],
    mediaManana: crearSnack('frutosSecos', 0),
    almuerzo: ["Lentejas con verduras"],
    merienda: crearSnack('ensaladaFrutas', 0),
    cena: ["Arroz con verduras"]
  },
  // Martes - Arroz/Pasta + Verduras
  {
    desayuno: ["Tostada con tomate y aceite de oliva", "Smoothie verde"],
    mediaManana: crearSnack('frutosSecos', 1),
    almuerzo: ["Pasta con tomate"],
    merienda: crearSnack('ensaladaFrutas', 1),
    cena: ["Quinoa con verduras"]
  },
  // Miércoles - Legumbres + Verduras
  {
    desayuno: ["Tostada con tomate y aceite de oliva", "Avena con frutas"],
    mediaManana: crearSnack('frutosSecos', 2),
    almuerzo: ["Garbanzos con espinacas"],
    merienda: crearSnack('ensaladaFrutas', 2),
    cena: ["Sopa de verduras"]
  },
  // Jueves - Arroz/Pasta + Verduras
  {
    desayuno: ["Tostada con tomate y aceite de oliva", "Smoothie verde"],
    mediaManana: crearSnack('frutosSecos', 3),
    almuerzo: ["Ensalada de quinoa con verduras"],
    merienda: crearSnack('ensaladaFrutas', 3),
    cena: ["Mijo con calabaza"]
  },
  // Viernes - Legumbres + Verduras
  {
    desayuno: ["Tostada con tomate y aceite de oliva", "Avena con frutas"],
    mediaManana: crearSnack('frutosSecos', 4),
    almuerzo: ["Judías blancas con verduras"],
    merienda: crearSnack('ensaladaFrutas', 4),
    cena: ["Sopa de verduras"]
  }
];

async function buscarIngredientePorNombre(nombre: string): Promise<mongoose.Types.ObjectId | null> {
  const ingrediente = await Ingrediente.findOne({ 
    nombre: { $regex: new RegExp(nombre, 'i') } 
  });
  return ingrediente ? ingrediente._id : null;
}

async function buscarRecetaPorNombre(nombre: string): Promise<mongoose.Types.ObjectId | null> {
  const receta = await Receta.findOne({ 
    nombreReceta: { $regex: new RegExp(nombre, 'i') } 
  });
  return receta ? receta._id : null;
}

async function crearPlatoConIngredientes(
  orden: number,
  nombre: string,
  ingredientes: Array<{ nombre: string; peso: number }>
): Promise<PlatoTemplate> {
  const ingredientesPersonalizados = [];
  let caloriasTotales = 0;

  for (const ing of ingredientes) {
    const ingredienteId = await buscarIngredientePorNombre(ing.nombre);
    if (ingredienteId) {
      const ingrediente = await Ingrediente.findById(ingredienteId);
      if (ingrediente) {
        ingredientesPersonalizados.push({
          ingrediente: ingredienteId,
          peso: ing.peso
        });
        caloriasTotales += (ingrediente.calorias * ing.peso) / 100;
      }
    }
  }

  return {
    orden,
    nombre,
    ingredientesPersonalizados,
    caloriasEstimadas: Math.round(caloriasTotales)
  };
}

async function crearPlatoConReceta(
  orden: number,
  nombreReceta: string
): Promise<PlatoTemplate | null> {
  const recetaId = await buscarRecetaPorNombre(nombreReceta);
  if (!recetaId) {
    console.log(`⚠️ Receta "${nombreReceta}" no encontrada`);
    return null;
  }

  const receta = await Receta.findById(recetaId).populate('ingredientes.ingrediente');
  if (!receta) {
    return null;
  }

  // Crear ingredientes personalizados basados en los ingredientes de la receta
  // Mantener los pesos originales de la receta sin sumar duplicados
  const ingredientesPersonalizados = receta.ingredientes.map(ing => ({
    ingrediente: ing.ingrediente._id,
    peso: ing.peso
  }));

  return {
    orden,
    nombre: receta.nombreReceta,
    receta: recetaId,
    ingredientesPersonalizados,
    caloriasEstimadas: 0 // Se calculará después
  };
}

async function crearDiaTemplate(diaIndex: number, comidasDiarias: number): Promise<DiaTemplate> {
  const plantillaDia = PLANTILLAS_COMIDAS[diaIndex % PLANTILLAS_COMIDAS.length];
  const comidas: ComidaTemplate[] = [];
  
  const mealNames = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena'];
  const mealTimes = ['08:00', '11:00', '14:00', '17:00', '20:00'];

  // Crear solo las comidas que se necesitan según comidasDiarias
  for (let i = 0; i < comidasDiarias; i++) {
    const platos: PlatoTemplate[] = [];
    let caloriasComida = 0;

    switch (i) {
      case 0: // Desayuno
        if (plantillaDia.desayuno && Array.isArray(plantillaDia.desayuno)) {
          for (let j = 0; j < plantillaDia.desayuno.length; j++) {
            const plato = await crearPlatoConReceta(j + 1, plantillaDia.desayuno[j]);
            if (plato) {
              platos.push(plato);
            }
          }
        }
        break;
        
      case 1: // Media mañana
        if (plantillaDia.mediaManana && plantillaDia.mediaManana.tipo === "ingredientes") {
          const plato = await crearPlatoConIngredientes(1, plantillaDia.mediaManana.nombre, plantillaDia.mediaManana.ingredientes);
          platos.push(plato);
          caloriasComida += plato.caloriasEstimadas;
        }
        break;
        
      case 2: // Almuerzo
        if (plantillaDia.almuerzo && Array.isArray(plantillaDia.almuerzo)) {
          for (let j = 0; j < plantillaDia.almuerzo.length; j++) {
            const plato = await crearPlatoConReceta(j + 1, plantillaDia.almuerzo[j]);
            if (plato) {
              platos.push(plato);
            }
          }
        }
        break;
        
      case 3: // Merienda
        if (plantillaDia.merienda && plantillaDia.merienda.tipo === "ingredientes") {
          const plato = await crearPlatoConIngredientes(1, plantillaDia.merienda.nombre, plantillaDia.merienda.ingredientes);
          platos.push(plato);
          caloriasComida += plato.caloriasEstimadas;
        }
        break;
        
      case 4: // Cena
        if (plantillaDia.cena && Array.isArray(plantillaDia.cena)) {
          for (let j = 0; j < plantillaDia.cena.length; j++) {
            const plato = await crearPlatoConReceta(j + 1, plantillaDia.cena[j]);
            if (plato) {
              platos.push(plato);
            }
          }
        }
        break;
    }

    comidas.push({
      horaEstimada: mealTimes[i] || `${8 + i * 3}:00`,
      nombreComida: mealNames[i] || `Comida ${i + 1}`,
      platos,
      caloriasTotales: caloriasComida
    });
  }

  // Calcular totales nutricionales del día
  let totalCalorias = 0;
  let totalProteinas = 0;
  let totalHidratosCarbono = 0;
  let totalGrasas = 0;

  // Obtener todos los IDs de ingredientes únicos del día
  const ingredientesIds = new Set<string>();
  for (const comida of comidas) {
    for (const plato of comida.platos) {
      if (plato.ingredientesPersonalizados) {
        for (const item of plato.ingredientesPersonalizados) {
          ingredientesIds.add(item.ingrediente.toString());
        }
      }
    }
  }

  // Obtener todos los ingredientes de una vez
  const ingredientes = await Ingrediente.find({ _id: { $in: Array.from(ingredientesIds) } });
  const ingredientesMap = new Map(ingredientes.map(ing => [ing._id.toString(), ing]));

  // Calcular totales nutricionales
  for (const comida of comidas) {
    for (const plato of comida.platos) {
      if (plato.ingredientesPersonalizados) {
        for (const item of plato.ingredientesPersonalizados) {
          const ingrediente = ingredientesMap.get(item.ingrediente.toString());
          if (ingrediente) {
            const factor = item.peso / 100; // Los valores nutricionales están por 100g
            totalCalorias += ingrediente.calorias * factor;
            totalProteinas += ingrediente.proteinas * factor;
            totalHidratosCarbono += ingrediente.hidratosCarbono * factor;
            totalGrasas += ingrediente.grasas * factor;
          }
        }
      }
    }
  }

  return {
    caloriasTotales: Math.round(totalCalorias),
    proteinas: Math.round(totalProteinas * 100) / 100,
    hidratosCarbono: Math.round(totalHidratosCarbono * 100) / 100,
    grasas: Math.round(totalGrasas * 100) / 100,
    numeroComidas: comidasDiarias,
    cumplimiento: true,
    comidas
  };
}

export interface CrearDietaDesdeTemplateDTO {
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  fechaInicio: Date;
  creador: mongoose.Types.ObjectId;
  asignadaA?: mongoose.Types.ObjectId[];
  tipoArquetipo: string;
}

export async function crearDietaDesdeTemplate(dto: CrearDietaDesdeTemplateDTO): Promise<mongoose.Document> {
  // Validar que el tipo de arquetipo existe
  if (!CONFIGURACIONES_DIETA[dto.tipoArquetipo as keyof typeof CONFIGURACIONES_DIETA]) {
    throw new Error(`Tipo de arquetipo "${dto.tipoArquetipo}" no válido. Tipos disponibles: ${Object.keys(CONFIGURACIONES_DIETA).join(', ')}`);
  }

  // Validar que el tipo de dieta está en los tipos válidos
  const tiposValidos = dto.tipo.filter(tipo => TIPOS_DIETA.includes(tipo as (typeof TIPOS_DIETA)[number]));
  if (tiposValidos.length === 0) {
    throw new Error(`Ninguno de los tipos de dieta proporcionados es válido. Tipos disponibles: ${TIPOS_DIETA.join(', ')}`);
  }

  // Crear los días de la dieta
  const dias: DiaTemplate[] = [];
  
  for (let i = 0; i < dto.duracion; i++) {
    const dia = await crearDiaTemplate(i, dto.comidasDiarias);
    dias.push(dia);
  }

  // Crear la dieta
  const dieta = new Dieta({
    nombre: dto.nombre,
    descripcion: dto.descripcion || CONFIGURACIONES_DIETA[dto.tipoArquetipo as keyof typeof CONFIGURACIONES_DIETA].descripcion,
    tipo: tiposValidos,
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

export function obtenerTiposArquetipoDisponibles(): string[] {
  return Object.keys(CONFIGURACIONES_DIETA);
}

export function obtenerConfiguracionArquetipo(tipo: string) {
  return CONFIGURACIONES_DIETA[tipo as keyof typeof CONFIGURACIONES_DIETA];
}
