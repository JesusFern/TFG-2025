export interface CrearDietaDTO {
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  fechaInicio: string;
  asignadaA?: string;
  horasComidas?: string[];
  nombreComidas?: string[];
}

export interface DietaResponse {
  _id: string;
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  fechaInicio: string;
  creador?: string;
  asignadaA?: string[];
  dias?: Array<{
    caloriasTotales?: number | null;
    macronutrientes?: string;
    micronutrientes?: string;
    numeroComidas?: number | null;
    genero?: string;
    requerimientosHidratacion?: string;
    cumplimiento?: boolean;
    comidas?: Array<{
      horaEstimada?: string | null;
      platos?: Array<{
        _id?: string;
        orden?: number;
        nombre?: string;
        receta?: string | null;
      }>;
    }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
  draftMode?: boolean;
}

// Información nutricional del ingrediente (por 100g)
export interface InformacionNutricional {
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  fibra?: number;
  azucares?: number;
  sal?: number;
  sodio?: number;
}

// Ingrediente con información nutricional completa (para formularios)
export interface Ingrediente {
  nombre: string;
  peso: number;
  informacionNutricional: InformacionNutricional;
  marca?: string;
  id?: string | null; // ID del ingrediente (null para OpenFoodFacts)
  codigoBarras?: string; // Campo temporal para compatibilidad
  imagenIngrediente?: string;
  fuente?: 'Interna' | 'Openfoodfacts' | 'Trabajador'; // Para identificar el origen
}

// Ingrediente poblado desde la base de datos (para mostrar en recetas)
export interface IngredientePoblado {
  ingrediente: {
    _id: string;
    nombre: string;
    calorias: number;
    proteinas: number;
    grasas: number;
    hidratosCarbono: number;
    fibra?: number;
    azucares?: number;
    sal?: number;
    sodio?: number;
    marca?: string;
    imagenIngrediente?: string;
    fuente: 'Interna' | 'Openfoodfacts' | 'Trabajador';
  };
  peso: number;
  _id: string;
}

// Respuesta de búsqueda de OpenFoodFacts
export interface AlimentoOpenFoodFacts {
  id: string;
  nombre: string;
  marca?: string;
  categorias?: string;
  pais?: string;
  imagen?: string;
  informacionNutricional: InformacionNutricional;
  tamanoPorcion?: string;
  calificacionNutricional?: string;
  tiendas?: string;
}

export interface Receta {
  _id?: string;
  nombreReceta: string;
  ingredientes: (Ingrediente | IngredientePoblado | string)[]; // Puede ser string (formato antiguo), Ingrediente (formulario) o IngredientePoblado (desde BD)
  pasosPreparacion?: string[];
  tiempoPreparacion?: string;
  imagenes?: string[];
  creador?: string;
  publica?: boolean;
  informacionNutricional?: string;
}

export interface DietaActualizacionDTO {
  nombre?: string;
  descripcion?: string;
  tipo?: string[];
  duracion?: number;
  comidasDiarias?: number;
  fechaInicio?: string;
  draftMode?: boolean;
  dias?: Array<{
    _dayIndex: number;
    caloriasTotales?: number;
    macronutrientes?: string;
    micronutrientes?: string;
    numeroComidas?: number;
    requerimientosHidratacion?: string;
    cumplimiento?: boolean;
    comidas?: Array<{
      horaEstimada?: string;
      nombreComida?: string;
    }>;
  }>;
}

export interface Plato {
  idPlato?: string;
  _id?: string;
  nombre: string | null;
  orden: number;
  receta: string | null;
  ingredientesPersonalizados?: Array<{
    ingrediente: string; // ObjectId del ingrediente
    peso: number;
  }>;
  dietaId?: string;
  diaIndex?: number;
  comidaIndex?: number;
}

export interface Comida {
  horaEstimada: string;
  nombreComida?: string;
  platos: Plato[];
}

export interface DiaDieta {
  caloriasTotales?: number;
  macronutrientes?: string;
  micronutrientes?: string;
  numeroComidas?: number;
  requerimientosHidratacion?: string;
  cumplimiento: boolean;
  comidas: Comida[];
}

export interface DayInfo {
  weekDayIndex: number;
  dietDayIndex: number;
  weekDayName: string;
  fecha: Date;
  fechaFormateada: string;
  nombreCompleto: string;
  data: DiaDieta;
}

export interface Dieta {
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  dias: DiaDieta[];
  fechaInicio: string;
  creador?: string;
  asignadaA: string[];
  createdAt?: string;
  updatedAt?: string;
  draftMode: boolean;
}