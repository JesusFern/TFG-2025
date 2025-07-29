import Dieta from '../../models/diets/dieta';
import User from '../../models/users/user';

export async function crearDietaService({
  creadorId,
  nombre,
  descripcion,
  tipo,
  duracion,
  comidasDiarias,
  asignadaA,
  fechaInicio
}: {
  creadorId: string;
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  asignadaA: string;
  fechaInicio: string;
}) {
  const usuarioAsignado = await User.findById(asignadaA);
  if (!usuarioAsignado || usuarioAsignado.role !== 'user') {
    throw new Error('El usuario asignado debe tener rol user');
  }

  if (!duracion || !Number.isInteger(duracion) || duracion < 1) {
    throw new Error('La duración debe ser un número entero mayor que 0');
  }

if (
  !comidasDiarias ||
  !Number.isInteger(comidasDiarias) ||
  comidasDiarias <= 1 ||
  comidasDiarias >= 10
) {
  throw new Error('El número de comidas diarias debe ser un número entero mayor que 1 y menor que 10');
}

  if (!fechaInicio) {
    throw new Error('La fecha de inicio es obligatoria');
  }
  const [day, month, year] = fechaInicio.split('-').map(Number);
  const fechaInicioDate = new Date(year, month - 1, day);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fechaInicioDate <= hoy) {
    throw new Error('La fecha de inicio debe ser posterior al día actual');
  }

  const dias = Array.from({ length: duracion }, () => ({
    caloriasTotales: null,
    macronutrientes: '',
    micronutrientes: '',
    numeroComidas: null,
    genero: '',
    requerimientosHidratacion: '',
    cumplimiento: false,
    comidas: Array.from({ length: comidasDiarias }, () => ({
        horaEstimada: null,
        platos: Array.from({ length: 3 }, (_, i) => ({
            orden: i,
            nombre: null,
            receta: null
            }))
        }))
    }));

  const dieta = new Dieta({
    nombre,
    descripcion,
    tipo,
    duracion,
    comidasDiarias,
    dias,
    fechaInicio: fechaInicioDate,
    creador: creadorId,
    asignadaA: [asignadaA]
  });

  await dieta.save();
  return dieta;
}