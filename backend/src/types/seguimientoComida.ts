// Interfaces mínimas para el seguimiento de platos (solo las que usa el backend)

export interface SeguimientoPlato {
  satisfaccion?: number; // 1-5
  cumplimiento?: number; // 1-5
  notaUsuario?: string;
}

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

export interface RespuestaSeguimientoPaginada {
  seguimientos: SeguimientoPlatoConInfo[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface SeguimientoPlatoConInfo extends SeguimientoPlato {
  diaIndex: number;
  comidaIndex: number;
  platoIndex: number;
  fecha: Date;
  nombreComida: string;
  nombrePlato: string;
}

// Constantes para validación
export const SATISFACCION_MIN = 1;
export const SATISFACCION_MAX = 5;
export const CUMPLIMIENTO_MIN = 1;
export const CUMPLIMIENTO_MAX = 5;
export const NOTA_MAX_LENGTH = 500;
