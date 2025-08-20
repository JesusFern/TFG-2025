export type RegisterFormState = {
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string | Date | null;
  password: string;
  genero: string;
  altura: string | number;
  peso: string | number;
  objetivoPeso: string | number;
  condiciones: string;
  nivelActividad: string;
  frecuenciaEjercicio: number | string;
  tipoEjercicio: string[];
  otrosEjercicios: string;
  disponibilidad: string;
  objetivo: string;
  preferencias: string;
  comidasDia: number | string;
  restricciones: string;
  alergias: string;
  [key: string]: string | number | string[] | Date | null;
};

export type RegisterFormErrors = { [key: string]: string };


