import mongoose from 'mongoose';
import Receta from '../../models/diets/receta';
import Ingrediente from '../../models/diets/ingrediente';

interface RecetaTemplate {
  nombreReceta: string;
  ingredientes: Array<{
    nombreIngrediente: string;
    peso: number;
  }>;
  pasosPreparacion: string[];
  tiempoPreparacion: string;
  tiposDieta: string[];
  comidas: string[]; // ['Desayuno', 'Almuerzo', 'Cena', etc.]
  categoriasNutricionales: string[];
}

// Funciones helper para generar pasos de preparación comunes
const pasosComunes = {
  cocinar: (ingrediente: string) => `Cocinar ${ingrediente}`,
  cortar: (ingrediente: string, forma: string = 'cubos') => `Cortar ${ingrediente} en ${forma}`,
  lavar: (ingrediente: string) => `Lavar ${ingrediente}`,
  mezclar: (ingredientes: string) => `Mezclar ${ingredientes}`,
  saltear: (ingredientes: string, conAceite: boolean = true) => 
    `Saltear ${ingredientes}${conAceite ? ' con aceite de oliva' : ''}`,
  servir: (temperatura: string = 'caliente') => `Servir ${temperatura}`,
  añadir: (ingrediente: string, a: string) => `Añadir ${ingrediente} a ${a}`,
  triturar: (ingredientes: string) => `Triturar ${ingredientes}`,
  batir: (ingredientes: string) => `Batir ${ingredientes} hasta obtener una mezcla homogénea`
};

// Plantillas de pasos reutilizables
const plantillasPasos = {
  ensalada: (ingredientes: string[]) => [
    ...ingredientes.map(ing => pasosComunes.lavar(ing)),
    ...ingredientes.map(ing => pasosComunes.cortar(ing)),
    pasosComunes.mezclar('todos los ingredientes'),
    pasosComunes.servir('frío')
  ],
  cerealConVerduras: (cereal: string, verduras: string[]) => [
    pasosComunes.cocinar(cereal),
    ...verduras.map(verdura => pasosComunes.cortar(verdura)),
    pasosComunes.saltear(verduras.join(', ')),
    pasosComunes.mezclar(`con ${cereal} cocida`)
  ],
  pastaConSalsa: (pasta: string, ingredientes: string[]) => [
    pasosComunes.cocinar(pasta),
    ...ingredientes.map(ing => pasosComunes.cortar(ing)),
    pasosComunes.saltear(ingredientes.join(', ')),
    pasosComunes.mezclar(`con ${pasta}`)
  ],
  legumbresConVerduras: (legumbre: string, verduras: string[]) => [
    pasosComunes.cocinar(legumbre),
    ...verduras.map(verdura => pasosComunes.cortar(verdura)),
    pasosComunes.saltear(verduras.join(', ')),
    pasosComunes.añadir(legumbre, 'las verduras'),
    pasosComunes.servir()
  ]
};

const RECETAS_TEMPLATES: RecetaTemplate[] = [
  // DESAYUNOS MEDITERRÁNEOS
  {
    nombreReceta: "Tostada con tomate y aceite de oliva",
    ingredientes: [
      { nombreIngrediente: "Pan integral", peso: 60 },
      { nombreIngrediente: "Tomate", peso: 100 },
      { nombreIngrediente: "Aceite de oliva", peso: 10 }
    ],
    pasosPreparacion: [
      "Tostar el pan integral",
      "Cortar el tomate en rodajas",
      "Colocar el tomate sobre la tostada",
      "Añadir aceite de oliva al gusto"
    ],
    tiempoPreparacion: "5 minutos",
    tiposDieta: ["Mediterránea"],
    comidas: ["Desayuno"],
    categoriasNutricionales: ["Rica en vitaminas"]
  },
  {
    nombreReceta: "Avena con frutas",
    ingredientes: [
      { nombreIngrediente: "Avena", peso: 50 },
      { nombreIngrediente: "Plátano", peso: 100 },
      { nombreIngrediente: "Manzana", peso: 80 }
    ],
    pasosPreparacion: [
      "Cocinar la avena con agua",
      "Cortar el plátano en rodajas",
      "Cortar la manzana en cubos",
      "Añadir las frutas a la avena"
    ],
    tiempoPreparacion: "10 minutos",
    tiposDieta: ["Vegetariana", "Mediterránea"],
    comidas: ["Desayuno"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Smoothie verde",
    ingredientes: [
      { nombreIngrediente: "Espinacas", peso: 50 },
      { nombreIngrediente: "Plátano", peso: 100 },
      { nombreIngrediente: "Manzana", peso: 80 }
    ],
    pasosPreparacion: [
      "Lavar las espinacas",
      "Pelar el plátano",
      "Cortar la manzana",
      "Mezclar todos los ingredientes en la licuadora",
      "Batir hasta obtener una mezcla homogénea"
    ],
    tiempoPreparacion: "5 minutos",
    tiposDieta: ["Vegetariana"],
    comidas: ["Desayuno", "Merienda"],
    categoriasNutricionales: ["Rica en vitaminas"]
  },

  // ALMUERZOS MEDITERRÁNEOS
  {
    nombreReceta: "Ensalada mediterránea",
    ingredientes: [
      { nombreIngrediente: "Lechuga", peso: 100 },
      { nombreIngrediente: "Tomate", peso: 150 },
      { nombreIngrediente: "Pepino", peso: 100 },
      { nombreIngrediente: "Aceite de oliva", peso: 15 }
    ],
    pasosPreparacion: [
      ...plantillasPasos.ensalada(["lechuga", "tomate", "pepino"]),
      "Aliñar con aceite de oliva"
    ],
    tiempoPreparacion: "10 minutos",
    tiposDieta: ["Mediterránea", "Vegetariana"],
    comidas: ["Almuerzo"],
    categoriasNutricionales: ["Baja en calorías"]
  },
  {
    nombreReceta: "Quinoa con verduras",
    ingredientes: [
      { nombreIngrediente: "Quinoa", peso: 80 },
      { nombreIngrediente: "Calabacín", peso: 100 },
      { nombreIngrediente: "Pimiento rojo", peso: 80 },
      { nombreIngrediente: "Aceite de oliva", peso: 10 }
    ],
    pasosPreparacion: plantillasPasos.cerealConVerduras("la quinoa", ["calabacín", "pimiento rojo"]),
    tiempoPreparacion: "20 minutos",
    tiposDieta: ["Vegetariana", "Sin gluten"],
    comidas: ["Almuerzo"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Pasta con tomate",
    ingredientes: [
      { nombreIngrediente: "Pasta", peso: 80 },
      { nombreIngrediente: "Tomate", peso: 120 },
      { nombreIngrediente: "Aceite de oliva", peso: 10 }
    ],
    pasosPreparacion: plantillasPasos.pastaConSalsa("la pasta", ["tomate"]),
    tiempoPreparacion: "15 minutos",
    tiposDieta: ["Mediterránea", "Vegetariana"],
    comidas: ["Almuerzo"],
    categoriasNutricionales: ["Energética"]
  },

  // CENAS MEDITERRÁNEAS
  {
    nombreReceta: "Arroz con verduras",
    ingredientes: [
      { nombreIngrediente: "Arroz", peso: 80 },
      { nombreIngrediente: "Zanahoria", peso: 80 },
      { nombreIngrediente: "Guisante verde", peso: 60 },
      { nombreIngrediente: "Aceite de oliva", peso: 10 }
    ],
    pasosPreparacion: plantillasPasos.cerealConVerduras("el arroz", ["zanahoria", "guisante verde"]),
    tiempoPreparacion: "25 minutos",
    tiposDieta: ["Vegetariana", "Mediterránea"],
    comidas: ["Cena"],
    categoriasNutricionales: ["Energética"]
  },
  {
    nombreReceta: "Lentejas con verduras",
    ingredientes: [
      { nombreIngrediente: "Lentejas, brotes", peso: 80 },
      { nombreIngrediente: "Cebolla", peso: 50 },
      { nombreIngrediente: "Zanahoria", peso: 80 },
      { nombreIngrediente: "Aceite de oliva", peso: 10 }
    ],
    pasosPreparacion: [
      ...plantillasPasos.legumbresConVerduras("las lentejas", ["cebolla", "zanahoria"]),
      "Cocinar 10 minutos más"
    ],
    tiempoPreparacion: "35 minutos",
    tiposDieta: ["Vegetariana", "Mediterránea"],
    comidas: ["Cena"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Sopa de verduras",
    ingredientes: [
      { nombreIngrediente: "Calabacín", peso: 100 },
      { nombreIngrediente: "Zanahoria", peso: 80 },
      { nombreIngrediente: "Cebolla", peso: 50 },
      { nombreIngrediente: "Tomate", peso: 100 }
    ],
    pasosPreparacion: [
      "Picar todas las verduras",
      "Cocinar en agua con sal",
      "Cocinar 20 minutos",
      "Servir caliente"
    ],
    tiempoPreparacion: "25 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Cena"],
    categoriasNutricionales: ["Baja en calorías"]
  },

  // SNACKS Y MERIENDAS
  {
    nombreReceta: "Frutos secos mixtos",
    ingredientes: [
      { nombreIngrediente: "Almendras", peso: 15 },
      { nombreIngrediente: "Nueces", peso: 10 },
      { nombreIngrediente: "Avellanas", peso: 10 }
    ],
    pasosPreparacion: [
      "Mezclar los frutos secos",
      "Servir en un bol pequeño"
    ],
    tiempoPreparacion: "2 minutos",
    tiposDieta: ["Mediterránea", "Vegetariana", "Vegana"],
    comidas: ["Merienda", "Snack"],
    categoriasNutricionales: ["Rica en grasas saludables"]
  },
  {
    nombreReceta: "Ensalada de frutas",
    ingredientes: [
      { nombreIngrediente: "Manzana", peso: 100 },
      { nombreIngrediente: "Plátano", peso: 80 },
      { nombreIngrediente: "Naranja", peso: 120 }
    ],
    pasosPreparacion: [
      "Cortar todas las frutas en trozos",
      "Mezclar en un bol",
      "Servir fresco"
    ],
    tiempoPreparacion: "8 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Merienda", "Snack"],
    categoriasNutricionales: ["Rica en vitaminas"]
  },
  {
    nombreReceta: "Hummus de garbanzos",
    ingredientes: [
      { nombreIngrediente: "Garbanzo", peso: 100 },
      { nombreIngrediente: "Ajo", peso: 5 },
      { nombreIngrediente: "Aceite de oliva", peso: 15 }
    ],
    pasosPreparacion: [
      "Cocinar los garbanzos",
      "Triturar con ajo y aceite de oliva",
      "Servir con crudités"
    ],
    tiempoPreparacion: "15 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Merienda", "Snack"],
    categoriasNutricionales: ["Rica en fibra"]
  },

  // RECETAS ADICIONALES
  {
    nombreReceta: "Bulgur con tomate",
    ingredientes: [
      { nombreIngrediente: "Bulgur", peso: 80 },
      { nombreIngrediente: "Tomate", peso: 120 },
      { nombreIngrediente: "Cebolla", peso: 50 }
    ],
    pasosPreparacion: [
      "Cocinar el bulgur",
      "Picar tomate y cebolla",
      "Saltear las verduras",
      "Mezclar con el bulgur"
    ],
    tiempoPreparacion: "20 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Almuerzo"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Cuscús con verduras",
    ingredientes: [
      { nombreIngrediente: "Cuscús", peso: 60 },
      { nombreIngrediente: "Tomate", peso: 80 },
      { nombreIngrediente: "Pepino", peso: 60 }
    ],
    pasosPreparacion: [
      "Preparar el cuscús según instrucciones",
      ...plantillasPasos.ensalada(["tomate", "pepino"]).slice(1, 3), // Cortar y mezclar
      "Servir a temperatura ambiente"
    ],
    tiempoPreparacion: "10 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Desayuno"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Ensalada de lentejas",
    ingredientes: [
      { nombreIngrediente: "Lenteja", peso: 80 },
      { nombreIngrediente: "Tomate", peso: 100 },
      { nombreIngrediente: "Pepino", peso: 80 }
    ],
    pasosPreparacion: [
      pasosComunes.cocinar("las lentejas"),
      ...plantillasPasos.ensalada(["tomate", "pepino"]).slice(1) // Cortar, mezclar y servir frío
    ],
    tiempoPreparacion: "25 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Almuerzo"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Garbanzos con espinacas",
    ingredientes: [
      { nombreIngrediente: "Garbanzo", peso: 80 },
      { nombreIngrediente: "Espinaca", peso: 100 },
      { nombreIngrediente: "Tomate", peso: 80 }
    ],
    pasosPreparacion: [
      pasosComunes.cocinar("los garbanzos"),
      pasosComunes.lavar("las espinacas"),
      pasosComunes.cortar("tomate"),
      pasosComunes.mezclar("todos los ingredientes")
    ],
    tiempoPreparacion: "30 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Almuerzo"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Judías blancas con verduras",
    ingredientes: [
      { nombreIngrediente: "Judía blanca", peso: 80 },
      { nombreIngrediente: "Zanahoria", peso: 80 },
      { nombreIngrediente: "Cebolla", peso: 50 }
    ],
    pasosPreparacion: [
      ...plantillasPasos.legumbresConVerduras("las judías blancas", ["zanahoria", "cebolla"]),
      "Cocinar 15 minutos más"
    ],
    tiempoPreparacion: "45 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Almuerzo"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Mijo con calabaza",
    ingredientes: [
      { nombreIngrediente: "Mijo", peso: 80 },
      { nombreIngrediente: "Calabaza", peso: 100 },
      { nombreIngrediente: "Cebolla", peso: 50 }
    ],
    pasosPreparacion: plantillasPasos.cerealConVerduras("el mijo", ["calabaza", "cebolla"]),
    tiempoPreparacion: "25 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Cena"],
    categoriasNutricionales: ["Rica en vitaminas"]
  },
  {
    nombreReceta: "Cebada con verduras",
    ingredientes: [
      { nombreIngrediente: "Cebada", peso: 80 },
      { nombreIngrediente: "Pimiento verde", peso: 80 },
      { nombreIngrediente: "Tomate", peso: 100 }
    ],
    pasosPreparacion: plantillasPasos.cerealConVerduras("la cebada", ["pimiento verde", "tomate"]),
    tiempoPreparacion: "30 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Cena"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Ensalada de quinoa con verduras",
    ingredientes: [
      { nombreIngrediente: "Quinoa", peso: 80 },
      { nombreIngrediente: "Tomate", peso: 100 },
      { nombreIngrediente: "Pepino", peso: 80 }
    ],
    pasosPreparacion: [
      "Cocinar la quinoa según instrucciones",
      ...plantillasPasos.ensalada(["tomate", "pepino"]).slice(1) // Cortar, mezclar y servir frío
    ],
    tiempoPreparacion: "20 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Almuerzo"],
    categoriasNutricionales: ["Rica en fibra"]
  },
  {
    nombreReceta: "Pasta con verduras",
    ingredientes: [
      { nombreIngrediente: "Pasta", peso: 80 },
      { nombreIngrediente: "Calabacín", peso: 100 },
      { nombreIngrediente: "Tomate", peso: 100 }
    ],
    pasosPreparacion: plantillasPasos.pastaConSalsa("la pasta", ["calabacín", "tomate"]),
    tiempoPreparacion: "20 minutos",
    tiposDieta: ["Vegetariana", "Vegana"],
    comidas: ["Cena"],
    categoriasNutricionales: ["Energética"]
  }
];

async function buscarIngredientePorNombre(nombre: string): Promise<mongoose.Types.ObjectId | null> {
  const ingrediente = await Ingrediente.findOne({ 
    nombre: { $regex: new RegExp(nombre, 'i') } 
  });
  return ingrediente ? ingrediente._id : null;
}

async function crearReceta(template: RecetaTemplate): Promise<void> {
  // Buscar ingredientes
  const ingredientes = [];
  for (const ing of template.ingredientes) {
    const ingredienteId = await buscarIngredientePorNombre(ing.nombreIngrediente);
    if (!ingredienteId) {
      throw new Error(`Ingrediente "${ing.nombreIngrediente}" no encontrado`);
    }
    ingredientes.push({
      ingrediente: ingredienteId,
      peso: ing.peso
    });
  }

  // Crear la receta
  const receta = new Receta({
    nombreReceta: template.nombreReceta,
    ingredientes,
    pasosPreparacion: template.pasosPreparacion,
    tiempoPreparacion: template.tiempoPreparacion,
    publica: true,
    categoriasNutricionales: template.categoriasNutricionales
  });

  await receta.save();
}

export async function seedRecetas(): Promise<void> {
  console.log('🍽️ Iniciando seed de recetas...');
  
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB no está conectado. Saltando seed de recetas.');
      return;
    }

    // Verificar que hay ingredientes en la base de datos
    const countIngredientes = await Ingrediente.countDocuments();
    if (countIngredientes === 0) {
      console.log('⚠️ No hay ingredientes en la base de datos. Ejecuta primero: npm run seed:ingredientes');
      return;
    }

    console.log(`📊 Total de ingredientes disponibles: ${countIngredientes}`);
    console.log(`📋 Total de recetas a crear: ${RECETAS_TEMPLATES.length}`);

    // Eliminar recetas existentes para evitar duplicados
    console.log('🧹 Eliminando recetas existentes...');
    const eliminadas = await Receta.deleteMany({});
    console.log(`🗑️ Eliminadas ${eliminadas.deletedCount} recetas existentes`);

    // Crear todas las recetas
    for (const template of RECETAS_TEMPLATES) {
      await crearReceta(template);
    }

    const totalRecetas = await Receta.countDocuments();
    
    console.log('✅ Seed de recetas completado:');
    console.log(`   ✅ Recetas creadas: ${RECETAS_TEMPLATES.length}`);
    console.log(`   📋 Total de recetas en BD: ${totalRecetas}`);
    
  } catch (error) {
    console.error('❌ Error en seed de recetas:', error instanceof Error ? error.message : error);
    throw error;
  }
}