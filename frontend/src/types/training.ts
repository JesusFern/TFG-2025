export interface Ejercicio {
  _id?: string;
  nombre: string;
  descripcion: string;
  grupoMuscular: string;
  equipamiento: string;
  series: number;
  repeticiones: number;
  tiempoDescanso: number;
  nivelDificultad: string;
  nivelIntensidad: string;
  videoDemostrativo?: string;
  creador?: string;
  publico?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanEntrenamiento {
  _id?: string;
  entrenador: string;
  nombre: string;
  descripcion?: string;
  objetivo: string;
  duracionDias: number;
  sesionesPorSemana: number;
  fechaInicio: string;
  diasSemana: number[];
  clientes: string[];
  publico: boolean;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SesionPlan {
  _id?: string;
  entrenador: string;
  cliente: string;
  plan?: string;
  fecha: string; // ISO date
  hora?: string;
  tipoEntrenamiento: string;
  duracion: number; // minutos
  ejercicios: Array<{
    ejercicio: string; // id de Ejercicio
    orden: number;
    series: number;
    repeticiones: number;
    peso?: number;
    tiempoDescanso: number;
    ejerciciosAlternativos?: string[];
    opcionesProgresion?: {
      aumentarPeso: boolean;
      masRepeticiones: boolean;
      mayorIntensidad: boolean;
    };
  }>;
  completada?: boolean;
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CrearEjercicioDTO = Omit<Ejercicio, '_id' | 'creador' | 'createdAt' | 'updatedAt'>;
export type ActualizarEjercicioDTO = Partial<CrearEjercicioDTO>;

export type CrearPlanDTO = Omit<PlanEntrenamiento, '_id' | 'entrenador' | 'activo' | 'createdAt' | 'updatedAt'>;
export type ActualizarPlanDTO = Partial<CrearPlanDTO>;

export type CrearSesionDTO = Omit<SesionPlan, '_id' | 'createdAt' | 'updatedAt'>;
export type ActualizarSesionDTO = Partial<CrearSesionDTO>;

export interface Paginado<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}


