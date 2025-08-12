export interface CrearDietaDTO {
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  fechaInicio: string;
  asignadaA?: string;
}

export interface DietaResponse {
  _id: string;
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  fechaInicio: string;
  creador?: string;
  asignadaA?: string[];
  dias?: Array<{
    caloriasTotales?: number | null;
    macronutrientes?: string;
    micronutrientes?: string;
    numeroComidas?: number | null;
    genero?: string;
    requerimientosHidratacion?: string;
    cumplimiento?: boolean;
    comidas?: Array<{
      horaEstimada?: string | null;
      platos?: Array<{
        _id?: string;
        orden?: number;
        nombre?: string;
        receta?: string | null;
      }>;
    }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
}