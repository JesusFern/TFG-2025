// Tipos para citas
export interface ICita {
  _id: string;
  cliente: string;
  profesional: string;
  tipo: 'seguimiento' | 'consulta_nutricion' | 'consulta_entrenamiento' | 'evaluacion' | 'revision';
  estado: 'pendiente' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'reagendada';
  fecha: Date;
  hora: string;
  duracion: number;
  motivo: string;
  motivoCancelacion?: string;
  reagendadaDesde?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para crear/actualizar citas
export interface CrearCitaData {
  cliente: string;
  profesional: string;
  tipo: 'seguimiento' | 'consulta_nutricion' | 'consulta_entrenamiento' | 'evaluacion' | 'revision';
  fecha: string; // ISO string
  hora: string;
  duracion?: number;
  motivo: string;
}

export interface ActualizarCitaData {
  tipo?: 'seguimiento' | 'consulta_nutricion' | 'consulta_entrenamiento' | 'evaluacion' | 'revision';
  fecha?: string;
  hora?: string;
  duracion?: number;
  motivo?: string;
  estado?: 'pendiente' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'reagendada';
  motivoCancelacion?: string;
}

// Tipos para filtros
export interface FiltrosCitas {
  cliente?: string;
  profesional?: string;
  tipo?: string;
  estado?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  limit?: number;
  offset?: number;
  estadosActivos?: boolean; // Para filtrar solo citas activas (pendientes, confirmadas, en_progreso)
}

// Tipos para disponibilidad
export interface DisponibilidadProfesional {
  profesionalId: string;
  disponibilidad: string; // String con la disponibilidad del worker
  citasExistentes: ICita[];
  horariosDisponibles: string[];
}

// Tipos para reagendar cita
export interface ReagendarCitaData {
  nuevaFecha: string;
  nuevaHora: string;
  motivo?: string;
}


// Tipos para estadísticas
export interface EstadisticasCitas {
  totalCitas: number;
  citasPendientes: number;
  citasConfirmadas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasPorTipo: Record<string, number>;
  citasPorMes: Array<{
    mes: string;
    cantidad: number;
  }>;
}

// Tipos para respuestas de API
export interface RespuestaCitasAPI<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
