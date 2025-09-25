export interface Ejercicio {
  _id?: string;
  nombre: string;
  slug: string;
  descripcion: string;
  grupoMuscular: string;
  equipamiento: string;
  nivelDificultad: string;
  tipoEjercicio: string;
  instrucciones?: string;
  videoDemostrativo?: string;
  arquetipo?: boolean;
  creador?: string;
  publico?: boolean;
  activo?: boolean;
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
  draftMode: boolean;
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
    nivelIntensidad: string;
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

export type CrearEjercicioDTO = Omit<Ejercicio, '_id' | 'creador' | 'arquetipo' | 'activo' | 'createdAt' | 'updatedAt'> & {
  publico: boolean;
};
export type ActualizarEjercicioDTO = Partial<CrearEjercicioDTO>;

export type CrearPlanDTO = Omit<PlanEntrenamiento, '_id' | 'entrenador' | 'activo' | 'createdAt' | 'updatedAt'>;
export type ActualizarPlanDTO = Partial<CrearPlanDTO>;

export type CrearSesionDTO = Omit<SesionPlan, '_id' | 'createdAt' | 'updatedAt'>;

// Tipo específico para la API que usa clienteId y planId
export type CrearSesionAPIDTO = {
  clienteId: string;
  planId?: string;
  fecha: string;
  hora?: string;
  tipoEntrenamiento: string;
  duracion: number;
  ejercicios: Array<{
    ejercicio: string;
    orden: number;
    series: number;
    repeticiones: number;
    peso?: number;
    tiempoDescanso: number;
    nivelIntensidad: string;
    ejerciciosAlternativos?: string[];
    opcionesProgresion?: {
      aumentarPeso: boolean;
      masRepeticiones: boolean;
      mayorIntensidad: boolean;
    };
  }>;
  notas?: string;
};

export type ActualizarSesionDTO = Partial<CrearSesionDTO>;

export interface Paginado<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}


