// Interfaces para el seguimiento de platos

export interface SeguimientoPlato {
  satisfaccion?: number; // 1-5
  cumplimiento?: number; // 1-5
  notaUsuario?: string;
}


// Interface para actualizar el seguimiento de un plato
export interface ActualizarSeguimientoPlatoRequest {
  satisfaccion?: number;
  cumplimiento?: number;
  notaUsuario?: string;
}

// Interface para estadísticas de seguimiento
export interface EstadisticasSeguimiento {
  satisfaccionPromedio: number;
  porcentajeCumplimiento: number;
  comidasFavoritas: string[];
  comidasMenosGustadas: string[];
  ingredientesMasModificados: string[];
  tendenciaSatisfaccion: 'mejorando' | 'empeorando' | 'estable';
  tendenciaCumplimiento: 'mejorando' | 'empeorando' | 'estable';
  totalComidas: number;
  comidasConsumidas: number;
  comidasOmitidas: number;
  comidasParciales: number;
}

// Interface para filtros de seguimiento
export interface FiltrosSeguimiento {
  fechaDesde?: Date;
  fechaHasta?: Date;
  satisfaccionMinima?: number;
  cumplimientoMinimo?: number;
}

// Interface para seguimiento de plato con información adicional
export interface SeguimientoPlatoConInfo extends SeguimientoPlato {
  diaIndex: number;
  comidaIndex: number;
  platoIndex: number;
  fecha: Date;
  nombreComida: string;
  nombrePlato: string;
}

// Interface para respuesta de seguimiento con paginación
export interface RespuestaSeguimientoPaginada {
  seguimientos: SeguimientoPlatoConInfo[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// Constantes para validación
export const SATISFACCION_MIN = 1;
export const SATISFACCION_MAX = 5;
export const CUMPLIMIENTO_MIN = 1;
export const CUMPLIMIENTO_MAX = 5;
export const NOTA_MAX_LENGTH = 500;
