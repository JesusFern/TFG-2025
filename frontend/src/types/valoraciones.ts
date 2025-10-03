// Tipos para valoraciones en el frontend
export interface Valoracion {
  _id: string;
  cliente: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  trabajador: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    workerType?: string;
  };
  calificacion: number; // 1-5
  descripcion: string;
  fechaValoracion: string; // ISO string
  tipoTrabajador: TipoTrabajador;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TipoTrabajador = 'Nutricionista' | 'Entrenador personal';

// DTOs para crear/actualizar valoraciones
export interface CrearValoracionDTO {
  trabajadorId: string;
  calificacion: number;
  descripcion: string;
  tipoTrabajador: TipoTrabajador;
  fechaValoracion?: string; // ISO string, opcional
}

export interface ActualizarValoracionDTO {
  calificacion?: number;
  descripcion?: string;
  fechaValoracion?: string;
}

// Filtros para búsqueda de valoraciones
export interface FiltrosValoraciones {
  trabajadorId?: string;
  clienteId?: string;
  calificacion?: number;
  tipoTrabajador?: TipoTrabajador;
  fechaDesde?: string;
  fechaHasta?: string;
  activa?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'fechaValoracion' | 'calificacion' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Respuesta de la API para listas de valoraciones
export interface ValoracionesResponse {
  data: Valoracion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Estadísticas de valoraciones
export interface EstadisticasValoraciones {
  totalValoraciones: number;
  calificacionPromedio: number; // Cambiado para coincidir con el backend
  distribucionCalificaciones: {
    calificacion: number;
    cantidad: number;
    porcentaje: number;
  }[];
  valoracionesPorTipo: {
    tipo: TipoTrabajador;
    cantidad: number;
    promedio: number;
  }[];
  tendenciaMensual: {
    mes: string;
    cantidad: number;
    promedio: number;
  }[];
}

// Estadísticas detalladas por tipo de trabajador
export interface EstadisticasValoracionesPorTipo {
  tipo: TipoTrabajador;
  totalValoraciones: number;
  calificacionPromedio: number; // Cambiado para coincidir con el backend
  distribucionCalificaciones: {
    calificacion: number;
    cantidad: number;
    porcentaje: number;
  }[];
  valoracionesRecientes: Valoracion[];
}

// Tipos disponibles para valorar
export interface TipoTrabajadorDisponible {
  tipo: TipoTrabajador;
  puedeValorar: boolean;
  yaValorado: boolean;
  valoracionId?: string;
}

export interface TiposTrabajadorDisponiblesResponse {
  tiposDisponibles: TipoTrabajadorDisponible[];
}

// Verificación de permisos
export interface VerificacionValoracion {
  puedeValorar: boolean;
  razon?: string;
  trabajador?: {
    _id: string;
    fullName: string;
    workerType: string;
  };
}

// Respuesta de verificación
export interface VerificacionValoracionResponse {
  data: VerificacionValoracion;
}

// Respuesta de estadísticas por tipo
export interface EstadisticasValoracionesPorTipoResponse {
  data: EstadisticasValoracionesPorTipo[];
}

// Respuesta de tipos disponibles
export interface TiposTrabajadorDisponiblesResponse {
  data: TiposTrabajadorDisponiblesResponse;
}

// Respuesta de estadísticas generales
export interface EstadisticasValoracionesResponse {
  data: EstadisticasValoraciones;
}

// Respuesta de valoraciones
export interface ValoracionesResponse {
  data: Valoracion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Respuesta de una valoración individual
export interface ValoracionResponse {
  data: Valoracion;
}

// Respuesta de creación/actualización
export interface CrearValoracionResponse {
  message: string;
  data: Valoracion;
}

export interface ActualizarValoracionResponse {
  message: string;
  data: Valoracion;
}

export interface EliminarValoracionResponse {
  message: string;
  data: Valoracion;
}
