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
    // Nuevas métricas cuantitativas
    seriesTotales: number;
    repeticionesTotales: number;
    distribucionTipoEjercicio: {
      fuerza: number;
      cardio: number;
      movilidad: number;
      hiit: number;
      resistencia: number;
      potencia: number;
      estabilidad: number;
      flexibilidad: number;
    };
    // Métricas de cardio
    distanciaCardio: number; // en km
    tiempoCardio: number; // en minutos
  };
  // Información cualitativa
  percepcionEsfuerzo: {
    promedioRPE: number;
    distribucionRPE: {
      ligero: number; // RPE 1-4
      moderado: number; // RPE 5-7
      intenso: number; // RPE 8-10
    };
  };
  // Comparación con semana anterior
  comparacionSemanaAnterior: {
    sesionesCompletadas: {
      actual: number;
      anterior: number;
      diferencia: number;
      porcentajeCambio: number;
    };
    tiempoEntrenamiento: {
      actual: number;
      anterior: number;
      diferencia: number;
      porcentajeCambio: number;
    };
    cargaUtilizada: {
      actual: number;
      anterior: number;
      diferencia: number;
      porcentajeCambio: number;
    };
    ejerciciosCompletados: {
      actual: number;
      anterior: number;
      diferencia: number;
      porcentajeCambio: number;
    };
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

export interface RachasEntrenamiento {
  rachaActual: {
    dias: number;
    semanas: number;
  };
  rachaMaxima: {
    dias: number;
    semanas: number;
    fechaInicio: Date | null;
    fechaFin: Date | null;
  };
  ultimaSesion: Date | null;
  diasSinEntrenar: number;
}

// Tipos para detalles completos del cliente
export interface PlanEntrenamientoDetalle {
  id: string;
  nombre: string;
  objetivo: string;
  fechaInicio: string;
  duracionDias: number;
  sesionesPorSemana: number;
  sesiones: SesionDetalle[];
}

export interface SesionDetalle {
  id: string;
  nombre: string;
  tipoEntrenamiento: string;
  fecha: string;
  completada: boolean;
  ejercicios: EjercicioSesionDetalle[];
}

export interface EjercicioSesionDetalle {
  id: string;
  nombre: string;
  series: number;
  repeticiones: number;
  peso: number;
  tiempoDescanso: number;
}

export interface RegistroEjercicioDetalle {
  id: string;
  ejercicio: {
    id: string;
    nombre: string;
  };
  sesion: {
    id: string;
    nombre: string;
    tipoEntrenamiento: string;
    fecha: string;
  };
  cargaUtilizada: number;
  repeticionesRealizadas: number;
  seriesCompletadas: number;
  tiempoDescanso: number;
  nivelEsfuerzo: number;
  completado: boolean;
  notas: string;
  fecha: string;
}

export interface ClienteDetalleCompleto {
  id: string;
  nombre: string;
  email: string;
  planes: PlanEntrenamientoDetalle[];
  sesiones: SesionDetalle[];
  registros: RegistroEjercicioDetalle[];
  estadisticas: EstadisticasCliente;
  estadisticasSemanal: EstadisticasSemanal;
  rachas: RachasEntrenamiento;
  alertas: string[];
}
