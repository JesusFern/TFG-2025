// Tipos para citas en el frontend
export interface Cita {
  _id: string;
  cliente: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  profesional: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    workerType?: string;
  };
  tipo: TipoCita;
  estado: EstadoCita;
  fecha: string; // ISO string
  hora: string;
  duracion: number;
  motivo: string;
  motivoCancelacion?: string;
  reagendadaDesde?: string;
  createdAt: string;
  updatedAt: string;
}

export type TipoCita = 'seguimiento' | 'consulta_nutricion' | 'consulta_entrenamiento' | 'evaluacion' | 'revision';

export type EstadoCita = 'pendiente' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'reagendada';

// DTOs para crear/actualizar citas
export interface CrearCitaDTO {
  cliente: string;
  profesional: string;
  tipo: TipoCita;
  fecha: string; // ISO string
  hora: string;
  duracion?: number;
  motivo: string;
}

export interface ActualizarCitaDTO {
  tipo?: TipoCita;
  fecha?: string;
  hora?: string;
  duracion?: number;
  motivo?: string;
  estado?: EstadoCita;
  motivoCancelacion?: string;
}

// DTOs para reagendar y cancelar
export interface ReagendarCitaDTO {
  nuevaFecha: string;
  nuevaHora: string;
  motivo?: string;
}

export interface CancelarCitaDTO {
  motivo: string;
}

// Filtros para obtener citas
export interface FiltrosCitas {
  cliente?: string;
  profesional?: string;
  tipo?: TipoCita;
  estado?: EstadoCita;
  fechaDesde?: string;
  fechaHasta?: string;
  limit?: number;
  offset?: number;
  estadosActivos?: boolean; // Para filtrar solo citas activas (pendientes, confirmadas, en_progreso)
}

// Respuesta de API con paginación
export interface CitasResponse {
  message: string;
  citas: Cita[];
  total: number;
  limit: number;
  offset: number;
}

// Disponibilidad de profesional
export interface DisponibilidadProfesional {
  profesionalId: string;
  disponibilidad: string;
  citasExistentes: Cita[];
  horariosDisponibles: string[];
}

// Estadísticas de citas
export interface EstadisticasCitas {
  totalCitas: number;
  citasPendientes: number;
  citasConfirmadas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasPorTipo: Record<TipoCita, number>;
  citasPorMes: Array<{
    mes: string;
    cantidad: number;
  }>;
}

// Opciones para formularios
export interface TipoCitaOption {
  value: TipoCita;
  label: string;
  description: string;
  icon: string;
}

export interface EstadoCitaOption {
  value: EstadoCita;
  label: string;
  color: string;
  icon: string;
}

// Horarios disponibles
export interface HorarioDisponible {
  hora: string;
  disponible: boolean;
  motivo?: string; // Si no está disponible, el motivo
}

// Información del profesional para citas
export interface ProfesionalCita {
  _id: string;
  fullName: string;
  email: string;
  workerType: string;
  specialties?: string[];
  bio?: string;
  profilePicture?: string;
  availability?: string;
}

// Formulario de nueva cita
export interface FormularioNuevaCita {
  profesional: string;
  tipo: TipoCita;
  fecha: Date | null;
  hora: string;
  duracion: number;
  motivo: string;
}

// Datos para el calendario de citas
export interface CitaCalendario {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  tipo: TipoCita;
  estado: EstadoCita;
  profesional: string;
  cliente: string;
  motivo: string;
}

// Notificaciones de citas
export interface NotificacionCita {
  id: string;
  tipo: 'nueva_cita' | 'cita_confirmada' | 'cita_cancelada' | 'recordatorio';
  citaId: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}
