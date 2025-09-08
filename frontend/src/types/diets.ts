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

export interface Receta {
  _id?: string;
  nombreReceta: string;
  ingredientes?: string[];
  pasosPreparacion?: string[];
  tiempoPreparacion?: string;
  informacionNutricional?: string;
  imagen?: string;
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