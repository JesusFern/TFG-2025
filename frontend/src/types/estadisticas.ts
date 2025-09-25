// Tipos para estadísticas de entrenamiento personal

export interface EstadisticasCliente {
  clienteId: string;
  periodo: {
    inicio: Date;
    fin: Date;
  };
  asistencia: {
    sesionesProgramadas: number;
    sesionesCompletadas: number;
    porcentajeAsistencia: number;
    sesionesAtrasadas: number;
  };
  progresoEjercicios: ProgresoEjercicio[];
  consistencia: {
    diasEntrenados: number;
    diasDisponibles: number;
    porcentajeConsistencia: number;
  };
  rendimiento: {
    tiempoPromedioSesion: number;
    ejerciciosCompletados: number;
    ejerciciosTotal: number;
    porcentajeCompletitud: number;
  };
  tendencias: {
    ejerciciosEnMejora: number;
    ejerciciosEstables: number;
    ejerciciosEnBaja: number;
    tendenciaGeneral: 'mejora' | 'estable' | 'baja';
  };
}

export interface EstadisticasSemanal {
  semana: {
    numero: number;
    inicio: Date;
    fin: Date;
  };
  asistencia: {
    sesionesProgramadas: number;
    sesionesCompletadas: number;
    porcentajeAsistencia: number;
  };
  progreso: {
    ejerciciosRegistrados: number;
    ejerciciosCompletados: number;
    porcentajeCompletitud: number;
    cargaTotalUtilizada: number;
    tiempoTotalEntrenamiento: number;
  };
  tendencias: {
    ejerciciosEnMejora: number;
    ejerciciosEstables: number;
    ejerciciosEnBaja: number;
    tendenciaGeneral: 'mejora' | 'estable' | 'baja';
  };
  resumen: {
    tiempoTotalEntrenado: number;
    cargaTotalLevantada: number;
    repeticionesTotales: number;
  };
}

export interface ProgresoEjercicio {
  ejercicioId: string;
  ejercicioNombre: string;
  grupoMuscular: string;
  registros: {
    fecha: string;
    cargaUtilizada: number;
    repeticionesRealizadas: number;
    seriesCompletadas: number;
    nivelEsfuerzo: number;
    completado: boolean;
  }[];
  progreso: {
    mejoraCarga: number;
    mejoraRepeticiones: number;
    mejoraSeries: number;
    tendencia: 'mejora' | 'estable' | 'baja';
  };
  estadisticas: {
    cargaMaxima: number;
    repeticionesMaximas: number;
    seriesMaximas: number;
    promedioSesiones: number;
    totalSesiones: number;
  };
}

export interface EstadisticasResponse {
  success: boolean;
  message: string;
  estadisticas: EstadisticasCliente | EstadisticasSemanal;
}

export interface ProgresoEjerciciosResponse {
  success: boolean;
  message: string;
  progreso: ProgresoEjercicio[];
  cantidad: number;
}
