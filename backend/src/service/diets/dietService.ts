import Dieta from '../../models/diets/dieta';
import User from '../../models/users/user';

export async function crearDietaService({
  creadorId,
  nombre,
  descripcion,
  tipo,
  duracion,
  asignadaA,
  fechaInicio
}: {
  creadorId: string;
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  asignadaA: string;
  fechaInicio: string;
}) {
  // Validar usuario asignado
  const usuarioAsignado = await User.findById(asignadaA);
  if (!usuarioAsignado || usuarioAsignado.role !== 'user') {
    throw new Error('El usuario asignado debe tener rol user');
  }

  if (!duracion || !Number.isInteger(duracion) || duracion < 1) {
    throw new Error('La duración debe ser un número entero mayor que 0');
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
    comidas: []
  }));

  const dieta = new Dieta({
    nombre,
    descripcion,
    tipo,
    duracion,
    dias,
    fechaInicio: fechaInicioDate,
    creador: creadorId,
    asignadaA: [asignadaA]
  });

  await dieta.save();
  return dieta;
}