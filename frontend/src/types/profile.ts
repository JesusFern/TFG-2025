export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'worker' | 'user';
  gender?: string;
  birthDate?: Date;
  profilePicture?: string | null;
  workerType?: string;
  biography?: string;
  availability?: string;
  satisfactionRating?: number;
  datosSaludYNutricion?: string;
  datosActividadFisica?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatosSaludYNutricion {
  _id: string;
  userId: string;
  altura: number;
  pesoActual: number;
  objetivoPeso: number;
  condicionesMedicas: string[];
  restriccionesDieteticas: string[];
  alergiasIntolerancias: string[];
  medicacionActual: string[];
  preferenciasAlimentarias: string[];
  horariosComidas: Array<{
    comida: string;
    hora: string;
  }>;
}

export interface DatosActividadFisica {
  _id: string;
  userId: string;
  frecuenciaEjercicio: string;
  tipoEjercicioPractica: string[];
  objetivosPrincipales: string[];
  preferenciasEjercicios: string[];
  limitacionesFisicas: string[];
  numeroContactoEmergencia: string;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: string;
  birthDate?: Date | null;
  profilePicture?: string | null;
  workerType?: string;
  biography?: string;
  availability?: string;
}

export interface ProfileFormErrors {
  [key: string]: string;
}
