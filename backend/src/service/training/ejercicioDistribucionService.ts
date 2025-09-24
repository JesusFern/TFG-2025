import { randomBytes } from 'crypto';
import Ejercicio from '../../models/training/ejercicio';

// Interfaces para tipos
interface EjercicioDB {
  _id: string;
  nombre: string;
  slug: string;
  grupoMuscular: string;
  equipamiento: string;
  nivelDificultad: string;
  tipoEjercicio: string;
  instrucciones?: string;
  videoDemostrativo?: string;
}

interface EjercicioSesionGenerado {
  ejercicio: string;
  nombre: string;
  slug: string;
  grupoMuscular: string;
  equipamiento: string;
  tipoEjercicio: string;
  instrucciones?: string;
  videoDemostrativo?: string;
  series: number;
  repeticiones: number;
  tiempoDescanso: number;
  nivelIntensidad: string;
  opcionesProgresion: {
    aumentarPeso: boolean;
    masRepeticiones: boolean;
    mayorIntensidad: boolean;
  };
}

interface SesionGenerada {
  nombre: string;
  descripcion: string;
  tipoEntrenamiento: string;
  duracion: number;
  ejercicios: EjercicioSesionGenerado[];
}

// Estrategias de distribución según días por semana
export enum EstrategiaDistribucion {
  FULL_BODY = 'full_body',
  PUSH_PULL_LEGS = 'push_pull_legs',
  UPPER_LOWER = 'upper_lower',
  ESPECIALIZACION = 'especializacion'
}

// Configuración de grupos musculares por estrategia
export const CONFIGURACION_ESTRATEGIAS = {
  [EstrategiaDistribucion.FULL_BODY]: {
    dias: 2,
    gruposPorSesion: ['todos'],
    descripcion: 'Todos los grupos musculares en cada sesión',
    ejerciciosMinimos: 6
  },
  [EstrategiaDistribucion.UPPER_LOWER]: {
    dias: 3,
    gruposPorSesion: [
      ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
      ['Piernas', 'Glúteos', 'Core'],
      ['Pecho', 'Espalda', 'Hombros', 'Brazos']
    ],
    descripcion: 'Tren superior, tren inferior, tren superior',
    ejerciciosMinimos: 6
  },
  [EstrategiaDistribucion.PUSH_PULL_LEGS]: {
    dias: 4,
    gruposPorSesion: [
      ['Pecho', 'Hombros', 'Tríceps', 'Core'], // Push + Core
      ['Espalda', 'Bíceps', 'Hombros'], // Pull + Hombros
      ['Piernas', 'Glúteos', 'Core'], // Legs + Core
      ['Core', 'Pantorrillas', 'Brazos'] // Core + Pantorrillas + Brazos
    ],
    descripcion: 'Push, Pull, Legs, Core',
    ejerciciosMinimos: 4
  },
  [EstrategiaDistribucion.ESPECIALIZACION]: {
    dias: 5,
    gruposPorSesion: [
      ['Pecho', 'Tríceps'],
      ['Espalda', 'Bíceps'],
      ['Piernas', 'Glúteos'],
      ['Hombros', 'Core'],
      ['Brazos', 'Core']
    ],
    descripcion: 'Especialización por grupo muscular',
    ejerciciosMinimos: 4
  }
};

// Configuración de ejercicios por objetivo y tipo de ejercicio
export const EJERCICIOS_POR_OBJETIVO: Record<string, {
  tiposEjercicio: string[];
  gruposMusculares: string[];
  equipamiento: string[];
  nivelDificultad: string[];
}> = {
  'Ganancia muscular': {
    tiposEjercicio: ['Fuerza'],
    gruposMusculares: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Glúteos'],
    equipamiento: ['Barra', 'Mancuernas', 'Peso corporal', 'Kettlebell'],
    nivelDificultad: ['Intermedio', 'Avanzado']
  },
  'Pérdida de peso': {
    tiposEjercicio: ['HIIT', 'Cardio', 'Fuerza'],
    gruposMusculares: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Glúteos'],
    equipamiento: ['Peso corporal', 'Mancuernas', 'Kettlebell'],
    nivelDificultad: ['Principiante', 'Intermedio']
  },
  'Resistencia': {
    tiposEjercicio: ['Resistencia', 'Cardio', 'Fuerza'],
    gruposMusculares: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Glúteos'],
    equipamiento: ['Peso corporal', 'Mancuernas'],
    nivelDificultad: ['Principiante', 'Intermedio']
  },
  'Flexibilidad': {
    tiposEjercicio: ['Flexibilidad', 'Movilidad', 'Estabilidad'],
    gruposMusculares: ['Core', 'Piernas', 'Espalda', 'Hombros'],
    equipamiento: ['Peso corporal'],
    nivelDificultad: ['Principiante']
  },
  'Mantenimiento': {
    tiposEjercicio: ['Fuerza', 'Resistencia'],
    gruposMusculares: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Glúteos'],
    equipamiento: ['Peso corporal', 'Mancuernas', 'Barra'],
    nivelDificultad: ['Principiante', 'Intermedio']
  },
  'Potencia': {
    tiposEjercicio: ['Potencia', 'Fuerza'],
    gruposMusculares: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Glúteos'],
    equipamiento: ['Barra', 'Mancuernas', 'Peso corporal', 'Kettlebell'],
    nivelDificultad: ['Intermedio', 'Avanzado']
  },
  'Estabilidad': {
    tiposEjercicio: ['Estabilidad', 'Movilidad'],
    gruposMusculares: ['Core', 'Piernas', 'Espalda', 'Hombros'],
    equipamiento: ['Peso corporal', 'Bandas de resistencia'],
    nivelDificultad: ['Principiante', 'Intermedio']
  },
  'Salud general': {
    tiposEjercicio: ['Fuerza', 'Resistencia', 'Movilidad'],
    gruposMusculares: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Glúteos'],
    equipamiento: ['Peso corporal', 'Mancuernas'],
    nivelDificultad: ['Principiante', 'Intermedio']
  }
};

// Configuración de intensidad por objetivo
export const CONFIGURACION_INTENSIDAD: Record<string, {
  series: { min: number; max: number };
  repeticiones: { min: number; max: number };
  descanso: { min: number; max: number };
  nivelIntensidad: string;
}> = {
  'Ganancia muscular': {
    series: { min: 3, max: 5 },
    repeticiones: { min: 6, max: 12 },
    descanso: { min: 60, max: 120 },
    nivelIntensidad: 'Alta'
  },
  'Pérdida de peso': {
    series: { min: 2, max: 4 },
    repeticiones: { min: 12, max: 20 },
    descanso: { min: 30, max: 60 },
    nivelIntensidad: 'Media'
  },
  'Resistencia': {
    series: { min: 2, max: 3 },
    repeticiones: { min: 15, max: 30 },
    descanso: { min: 30, max: 45 },
    nivelIntensidad: 'Media'
  },
  'Flexibilidad': {
    series: { min: 1, max: 2 },
    repeticiones: { min: 30, max: 60 },
    descanso: { min: 15, max: 30 },
    nivelIntensidad: 'Baja'
  },
  'Mantenimiento': {
    series: { min: 2, max: 3 },
    repeticiones: { min: 8, max: 15 },
    descanso: { min: 45, max: 90 },
    nivelIntensidad: 'Media'
  },
  'Potencia': {
    series: { min: 3, max: 5 },
    repeticiones: { min: 3, max: 8 },
    descanso: { min: 120, max: 180 },
    nivelIntensidad: 'Alta'
  },
  'Estabilidad': {
    series: { min: 2, max: 4 },
    repeticiones: { min: 20, max: 45 },
    descanso: { min: 30, max: 60 },
    nivelIntensidad: 'Media'
  },
  'Salud general': {
    series: { min: 2, max: 3 },
    repeticiones: { min: 10, max: 15 },
    descanso: { min: 45, max: 75 },
    nivelIntensidad: 'Media'
  }
};

export class EjercicioDistribucionService {
  /**
   * Determina la estrategia de distribución según días por semana
   */
  static determinarEstrategia(diasPorSemana: number): EstrategiaDistribucion {
    if (diasPorSemana <= 2) return EstrategiaDistribucion.FULL_BODY;
    if (diasPorSemana === 3) return EstrategiaDistribucion.UPPER_LOWER;
    if (diasPorSemana === 4) return EstrategiaDistribucion.PUSH_PULL_LEGS;
    return EstrategiaDistribucion.ESPECIALIZACION;
  }

  /**
   * Obtiene ejercicios de la base de datos por grupo muscular y objetivo
   */
  static async obtenerEjerciciosPorGrupo(gruposMusculares: string[], objetivo: string): Promise<Map<string, EjercicioDB[]>> {
    const ejerciciosPorGrupo = new Map<string, EjercicioDB[]>();
    
    // Obtener configuración del objetivo
    const configObjetivo = EJERCICIOS_POR_OBJETIVO[objetivo] || EJERCICIOS_POR_OBJETIVO['Mantenimiento'];
    
    for (const grupo of gruposMusculares) {
      const ejercicios = await Ejercicio.find({
        grupoMuscular: grupo,
        activo: true,
        arquetipo: true,
        tipoEjercicio: { $in: configObjetivo.tiposEjercicio },
        equipamiento: { $in: configObjetivo.equipamiento },
        nivelDificultad: { $in: configObjetivo.nivelDificultad }
      }).select('nombre slug descripcion grupoMuscular equipamiento nivelDificultad tipoEjercicio instrucciones videoDemostrativo');
      
      // Convertir a tipo EjercicioDB
      const ejerciciosDB: EjercicioDB[] = ejercicios.map(ej => ({
        _id: ej._id.toString(),
        nombre: ej.nombre,
        slug: ej.slug,
        grupoMuscular: ej.grupoMuscular,
        equipamiento: ej.equipamiento,
        nivelDificultad: ej.nivelDificultad,
        tipoEjercicio: ej.tipoEjercicio,
        instrucciones: ej.instrucciones || undefined,
        videoDemostrativo: ej.videoDemostrativo || undefined
      }));
      
      ejerciciosPorGrupo.set(grupo, ejerciciosDB);
    }
    
    return ejerciciosPorGrupo;
  }

  /**
   * Selecciona ejercicios para una sesión específica
   */
  static async seleccionarEjerciciosParaSesion(
    gruposMusculares: string[],
    objetivo: string,
    nivelDificultad: 'Principiante' | 'Intermedio' | 'Avanzado' = 'Intermedio',
    cantidadEjercicios?: number
  ): Promise<EjercicioSesionGenerado[]> {
    const ejerciciosPorGrupo = await this.obtenerEjerciciosPorGrupo(gruposMusculares, objetivo);
    const ejerciciosSeleccionados = [];
    
    // Configuración de intensidad para el objetivo
    const configIntensidad = CONFIGURACION_INTENSIDAD[objetivo] || CONFIGURACION_INTENSIDAD['Mantenimiento'];
    
    // Si se especifica cantidad de ejercicios, distribuir equitativamente
    if (cantidadEjercicios) {
      const ejerciciosDisponibles = [];
      for (const grupo of gruposMusculares) {
        const ejerciciosGrupo = ejerciciosPorGrupo.get(grupo) || [];
        const ejerciciosFiltrados = ejerciciosGrupo.filter(ej => 
          ej.nivelDificultad === nivelDificultad || 
          (nivelDificultad === 'Principiante' && ej.nivelDificultad === 'Intermedio') ||
          (nivelDificultad === 'Avanzado' && ej.nivelDificultad === 'Intermedio')
        );
        ejerciciosDisponibles.push(...(ejerciciosFiltrados.length > 0 ? ejerciciosFiltrados : ejerciciosGrupo));
      }
      
      // Seleccionar la cantidad especificada de ejercicios
      const ejerciciosSeleccionadosGrupo = this.seleccionarEjerciciosAleatorios(
        ejerciciosDisponibles,
        Math.min(cantidadEjercicios, ejerciciosDisponibles.length)
      );
      
      // Añadir configuración de series y repeticiones
      for (const ejercicio of ejerciciosSeleccionadosGrupo) {
        ejerciciosSeleccionados.push({
          ejercicio: ejercicio._id,
          nombre: ejercicio.nombre,
          slug: ejercicio.slug,
          grupoMuscular: ejercicio.grupoMuscular,
          equipamiento: ejercicio.equipamiento,
          tipoEjercicio: ejercicio.tipoEjercicio,
          instrucciones: ejercicio.instrucciones,
          videoDemostrativo: ejercicio.videoDemostrativo,
          series: this.generarSeries(configIntensidad),
          repeticiones: this.generarRepeticiones(configIntensidad),
          tiempoDescanso: this.generarTiempoDescanso(configIntensidad),
          nivelIntensidad: configIntensidad.nivelIntensidad,
          opcionesProgresion: this.generarOpcionesProgresion(objetivo)
        });
      }
    } else {
      // Lógica original para otras estrategias
      for (const grupo of gruposMusculares) {
        const ejerciciosDisponibles = ejerciciosPorGrupo.get(grupo) || [];
        
        if (ejerciciosDisponibles.length === 0) continue;
        
        // Filtrar por nivel de dificultad
        const ejerciciosFiltrados = ejerciciosDisponibles.filter(ej => 
          ej.nivelDificultad === nivelDificultad || 
          (nivelDificultad === 'Principiante' && ej.nivelDificultad === 'Intermedio') ||
          (nivelDificultad === 'Avanzado' && ej.nivelDificultad === 'Intermedio')
        );
        
        // Seleccionar 1-3 ejercicios por grupo muscular según la estrategia
        const cantidadEjerciciosGrupo = gruposMusculares.length === 1 ? 3 : 2; // Más ejercicios si es especialización
        const ejerciciosSeleccionadosGrupo = this.seleccionarEjerciciosAleatorios(
          ejerciciosFiltrados.length > 0 ? ejerciciosFiltrados : ejerciciosDisponibles,
          Math.min(cantidadEjerciciosGrupo, ejerciciosDisponibles.length)
        );
      
        // Añadir configuración de series y repeticiones
        for (const ejercicio of ejerciciosSeleccionadosGrupo) {
          ejerciciosSeleccionados.push({
            ejercicio: ejercicio._id,
            nombre: ejercicio.nombre,
            slug: ejercicio.slug,
            grupoMuscular: ejercicio.grupoMuscular,
            equipamiento: ejercicio.equipamiento,
            tipoEjercicio: ejercicio.tipoEjercicio,
            instrucciones: ejercicio.instrucciones,
            videoDemostrativo: ejercicio.videoDemostrativo,
            series: this.generarSeries(configIntensidad),
            repeticiones: this.generarRepeticiones(configIntensidad),
            tiempoDescanso: this.generarTiempoDescanso(configIntensidad),
            nivelIntensidad: configIntensidad.nivelIntensidad,
            opcionesProgresion: this.generarOpcionesProgresion(objetivo)
          });
        }
      }
    }
    
    return ejerciciosSeleccionados;
  }

  /**
   * Genera sesiones para un plan de entrenamiento
   */
  static async generarSesionesParaPlan(
    objetivo: string,
    diasPorSemana: number,
    duracionSemanas: number,
    diasSemana: number[],
    nivelDificultad: 'Principiante' | 'Intermedio' | 'Avanzado' = 'Intermedio'
  ): Promise<SesionGenerada[]> {
    const estrategia = this.determinarEstrategia(diasPorSemana);
    const configuracion = CONFIGURACION_ESTRATEGIAS[estrategia];
    const sesiones = [];
    
    // Caso especial para Full Body - generar sesiones balanceadas
    if (estrategia === EstrategiaDistribucion.FULL_BODY) {
      const gruposMusculares = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Glúteos'];
      const ejerciciosPorSesion = Math.max(6, Math.floor(12 / diasPorSemana)); // Mínimo 6 ejercicios por sesión
      
      for (let i = 0; i < diasPorSemana; i++) {
        const ejercicios = await this.seleccionarEjerciciosParaSesion(
          gruposMusculares, 
          objetivo, 
          nivelDificultad,
          ejerciciosPorSesion
        );
        
        if (ejercicios.length > 0) {
          sesiones.push({
            nombre: `Entrenamiento Full Body - Sesión ${i + 1}`,
            descripcion: 'Entrenamiento completo que trabaja todos los grupos musculares',
            tipoEntrenamiento: this.determinarTipoEntrenamiento(objetivo),
            duracion: this.calcularDuracionSesion(ejercicios.length, objetivo),
            ejercicios: ejercicios
          });
        }
      }
    } else {
      // Para otras estrategias, usar la lógica original con mínimo de ejercicios
      const ejerciciosMinimos = configuracion.ejerciciosMinimos || 4;
      
      for (let i = 0; i < Math.min(diasPorSemana, configuracion.gruposPorSesion.length); i++) {
        const gruposMusculares = configuracion.gruposPorSesion[i];
        const gruposParaBuscar = gruposMusculares as string[];
        
        const ejercicios = await this.seleccionarEjerciciosParaSesion(
          gruposParaBuscar, 
          objetivo, 
          nivelDificultad,
          ejerciciosMinimos
        );
        
        if (ejercicios.length > 0) {
          sesiones.push({
            nombre: this.generarNombreSesion(gruposMusculares as string[], i + 1),
            descripcion: this.generarDescripcionSesion(gruposMusculares as string[], estrategia),
            tipoEntrenamiento: this.determinarTipoEntrenamiento(objetivo),
            duracion: this.calcularDuracionSesion(ejercicios.length, objetivo),
            ejercicios: ejercicios
          });
        }
      }
    }
    
    return sesiones;
  }

  // Métodos auxiliares
  private static secureRandom(): number {
    const bytes = randomBytes(4);
    return bytes.readUInt32BE(0) / 0xffffffff;
  }

  private static seleccionarEjerciciosAleatorios(ejercicios: EjercicioDB[], cantidad: number): EjercicioDB[] {
    const shuffled = [...ejercicios].sort(() => 0.5 - this.secureRandom());
    return shuffled.slice(0, cantidad);
  }

  private static generarSeries(configIntensidad: {
    series: { min: number; max: number };
    repeticiones: { min: number; max: number };
    descanso: { min: number; max: number };
    nivelIntensidad: string;
  }): number {
    const { min, max } = configIntensidad.series;
    return Math.floor(this.secureRandom() * (max - min + 1)) + min;
  }

  private static generarRepeticiones(configIntensidad: {
    series: { min: number; max: number };
    repeticiones: { min: number; max: number };
    descanso: { min: number; max: number };
    nivelIntensidad: string;
  }): number {
    const { min, max } = configIntensidad.repeticiones;
    return Math.floor(this.secureRandom() * (max - min + 1)) + min;
  }

  private static generarTiempoDescanso(configIntensidad: {
    series: { min: number; max: number };
    repeticiones: { min: number; max: number };
    descanso: { min: number; max: number };
    nivelIntensidad: string;
  }): number {
    const { min, max } = configIntensidad.descanso;
    return Math.floor(this.secureRandom() * (max - min + 1)) + min;
  }

  private static generarOpcionesProgresion(objetivo: string): {
    aumentarPeso: boolean;
    masRepeticiones: boolean;
    mayorIntensidad: boolean;
  } {
    const baseOptions = {
      aumentarPeso: objetivo === 'Ganancia muscular',
      masRepeticiones: true,
      mayorIntensidad: objetivo !== 'Flexibilidad'
    };
    
    return baseOptions;
  }

  private static generarNombreSesion(gruposMusculares: string[], numeroSesion: number): string {
    if (gruposMusculares.length === 1) {
      return `Entrenamiento de ${gruposMusculares[0]} - Sesión ${numeroSesion}`;
    } else if (gruposMusculares.includes('todos')) {
      return `Entrenamiento Full Body - Sesión ${numeroSesion}`;
    } else {
      return `Entrenamiento ${gruposMusculares.join(' + ')} - Sesión ${numeroSesion}`;
    }
  }

  private static generarDescripcionSesion(gruposMusculares: string[], estrategia: EstrategiaDistribucion): string {
    const descripciones = {
      [EstrategiaDistribucion.FULL_BODY]: 'Entrenamiento completo que trabaja todos los grupos musculares en una sola sesión',
      [EstrategiaDistribucion.UPPER_LOWER]: 'Entrenamiento enfocado en tren superior e inferior',
      [EstrategiaDistribucion.PUSH_PULL_LEGS]: 'Entrenamiento dividido por patrones de movimiento',
      [EstrategiaDistribucion.ESPECIALIZACION]: 'Entrenamiento especializado por grupo muscular'
    };
    
    return descripciones[estrategia] || 'Entrenamiento personalizado';
  }

  private static determinarTipoEntrenamiento(objetivo: string): string {
    const tipos: Record<string, string> = {
      'Ganancia muscular': 'Fuerza',
      'Pérdida de peso': 'HIIT',
      'Resistencia': 'Resistencia',
      'Flexibilidad': 'Flexibilidad',
      'Mantenimiento': 'Fuerza',
      'Salud general': 'Fuerza'
    };
    
    return tipos[objetivo] || 'Fuerza';
  }

  private static calcularDuracionSesion(cantidadEjercicios: number, objetivo: string): number {
    const duracionesBase: Record<string, number> = {
      'Ganancia muscular': 60,
      'Pérdida de peso': 45,
      'Resistencia': 50,
      'Flexibilidad': 30,
      'Mantenimiento': 55,
      'Salud general': 50
    };
    
    const duracionBase = duracionesBase[objetivo] || 50;
    const duracionPorEjercicio = objetivo === 'Flexibilidad' ? 5 : 8;
    
    return duracionBase + (cantidadEjercicios * duracionPorEjercicio);
  }
}
