export const TIPOS_DIETA = [
  'Mediterránea',
  'Vegetariana',
  'Vegana',
  'Keto',
  'Sin gluten',
  'Baja en carbohidratos',
  'Alta en proteínas',
  'Otras'
] as const;

export type TipoDieta = typeof TIPOS_DIETA[number];
