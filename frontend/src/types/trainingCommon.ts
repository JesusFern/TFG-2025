// Tipos compartidos para el módulo de entrenamiento

export interface OpcionesProgresion {
  aumentarPeso: boolean;
  masRepeticiones: boolean;
  mayorIntensidad: boolean;
}

export interface EjercicioSesion {
  ejercicio: string;
  orden: number;
  series: number;
  repeticiones: number;
  peso?: number;
  tiempoDescanso: number;
  ejerciciosAlternativos?: string[];
  opcionesProgresion?: OpcionesProgresion;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SesionInfo {
  weekDayIndex: number;
  sesionIndex: number;
  weekDayName: string;
  fecha: Date;
  fechaFormateada: string;
  nombreCompleto: string;
  data: any | null;
}
