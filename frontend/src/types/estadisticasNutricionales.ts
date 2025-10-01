// Interfaces para estadísticas nutricionales

export interface EstadisticasNutricionalesGenerales {
  totalDietas: number;
  dietasActivas: number;
  dietasCompletadas: number;
  promedioSatisfaccion: number;
  promedioCumplimiento: number;
  totalComidasRegistradas: number;
  totalComidasPlanificadas: number;
  porcentajeCumplimientoGeneral: number;
}

export interface EstadisticasNutricionalesSemanal {
  semana: {
    numero: number;
    año: number;
    fechaInicio: string;
    fechaFin: string;
  };
  progreso: {
    comidasRegistradas: number;
    comidasPlanificadas: number;
    porcentajeCompletitud: number;
    promedioSatisfaccion: number;
    promedioCumplimiento: number;
  };
  asistencia: {
    comidasConsumidas: number;
    comidasOmitidas: number;
    comidasParciales: number;
    porcentajeAsistencia: number;
  };
  tendencias: {
    satisfaccion: 'mejorando' | 'empeorando' | 'estable';
    cumplimiento: 'mejorando' | 'empeorando' | 'estable';
  };
}

export interface ProgresoComida {
  comidaId: string;
  nombreComida: string;
  dietaId: string;
  nombreDieta: string;
  estadisticas: {
    totalRegistros: number;
    satisfaccionPromedio: number;
    cumplimientoPromedio: number;
    ultimaConsumida: string;
    tendenciaSatisfaccion: 'mejorando' | 'empeorando' | 'estable';
    tendenciaCumplimiento: 'mejorando' | 'empeorando' | 'estable';
  };
  progreso: {
    satisfaccionInicial: number;
    satisfaccionActual: number;
    cumplimientoInicial: number;
    cumplimientoActual: number;
    mejoraSatisfaccion: number;
    mejoraCumplimiento: number;
  };
}

export interface RachasNutricionales {
  rachaActual: {
    dias: number;
    semanas: number;
  };
  rachaMaxima: {
    dias: number;
    semanas: number;
  };
  ultimaComida: string | null;
  diasSinRegistrar: number;
}

export interface ComparacionSemanaAnterior {
  cumplimiento: {
    actual: number;
    porcentajeCambio: number;
  };
  satisfaccion: {
    actual: number;
    porcentajeCambio: number;
  };
  comidasRegistradas: {
    actual: number;
    porcentajeCambio: number;
  };
  comidasFavoritas: {
    actual: number;
    porcentajeCambio: number;
  };
}

export interface DistribucionHorarios {
  desayuno: number;
  almuerzo: number;
  merienda: number;
  cena: number;
  snack: number;
}

export interface RespuestaEstadisticasNutricionales {
  success: boolean;
  estadisticas?: EstadisticasNutricionalesGenerales;
  error?: string;
}

export interface RespuestaEstadisticasNutricionalesSemanal {
  success: boolean;
  estadisticas?: EstadisticasNutricionalesSemanal;
  error?: string;
}

export interface RespuestaProgresoComidas {
  success: boolean;
  progreso?: ProgresoComida[];
  error?: string;
}

export interface RespuestaRachasNutricionales {
  success: boolean;
  rachas?: RachasNutricionales;
  error?: string;
}
