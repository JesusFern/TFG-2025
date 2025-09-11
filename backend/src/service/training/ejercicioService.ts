import Ejercicio from '../../models/training/ejercicio';
import User from '../../models/users/user';

export async function crearEjercicioService({
  creadorId,
  nombre,
  descripcion,
  grupoMuscular,
  equipamiento,
  series,
  repeticiones,
  tiempoDescanso,
  nivelDificultad,
  nivelIntensidad,
  videoDemostrativo,
  publico = false
}: {
  creadorId: string;
  nombre: string;
  descripcion: string;
  grupoMuscular: string;
  equipamiento: string;
  series: number;
  repeticiones: number;
  tiempoDescanso: number;
  nivelDificultad: string;
  nivelIntensidad: string;
  videoDemostrativo?: string;
  publico?: boolean;
}) {
  // Validar que el creador es un worker
  const creadorUser = await User.findById(creadorId);
  if (!creadorUser || creadorUser.role !== 'worker') {
    throw new Error('El creador debe ser un usuario con rol worker');
  }

  // Validar que no existe un ejercicio con el mismo nombre del mismo creador
  const ejercicioExistente = await Ejercicio.findOne({ 
    nombre, 
    creador: creadorId,
    activo: true 
  });
  if (ejercicioExistente) {
    throw new Error('Ya existe un ejercicio con ese nombre');
  }

  const ejercicio = new Ejercicio({
    nombre,
    descripcion,
    grupoMuscular,
    equipamiento,
    series,
    repeticiones,
    tiempoDescanso,
    nivelDificultad,
    nivelIntensidad,
    videoDemostrativo,
    publico,
    creador: creadorId
  });

  await ejercicio.save();
  return ejercicio;
}

export async function obtenerEjerciciosService(filtros: {
  grupoMuscular?: string;
  nivelDificultad?: string;
  equipamiento?: string;
  creador?: string;
  publico?: boolean;
}) {
  const query: { activo: boolean; grupoMuscular?: string; nivelDificultad?: string; equipamiento?: string; creador?: string } = { activo: true };

  if (filtros.grupoMuscular) {
    query.grupoMuscular = filtros.grupoMuscular;
  }
  if (filtros.nivelDificultad) {
    query.nivelDificultad = filtros.nivelDificultad;
  }
  if (filtros.equipamiento) {
    query.equipamiento = filtros.equipamiento;
  }
  if (filtros.creador) {
    query.creador = filtros.creador;
  }

  const ejercicios = await Ejercicio.find(query)
    .populate('creador', 'nombre email')
    .sort({ createdAt: -1 });

  return ejercicios;
}

export async function obtenerEjercicioPorIdService(ejercicioId: string) {
  const ejercicio = await Ejercicio.findById(ejercicioId)
    .populate('creador', 'nombre email');
  
  if (!ejercicio || !ejercicio.activo) {
    throw new Error('Ejercicio no encontrado');
  }

  return ejercicio;
}

export async function actualizarEjercicioService(
  ejercicioId: string,
  creadorId: string,
  datosActualizacion: Partial<{
    nombre: string;
    descripcion: string;
    grupoMuscular: string;
    equipamiento: string;
    series: number;
    repeticiones: number;
    tiempoDescanso: number;
    nivelDificultad: string;
    nivelIntensidad: string;
    videoDemostrativo: string;
    publico: boolean;
  }>
) {
  const ejercicio = await Ejercicio.findById(ejercicioId);
  if (!ejercicio || !ejercicio.activo) {
    throw new Error('Ejercicio no encontrado');
  }

  // Verificar que el usuario es el creador del ejercicio
  if (ejercicio.creador.toString() !== creadorId) {
    throw new Error('No tienes permisos para editar este ejercicio');
  }

  // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
  if (datosActualizacion.nombre && datosActualizacion.nombre !== ejercicio.nombre) {
    const ejercicioExistente = await Ejercicio.findOne()
      .where('nombre').equals(datosActualizacion.nombre)
      .where('creador').equals(creadorId)
      .where('activo').equals(true)
      .where('_id').ne(ejercicioId);
    if (ejercicioExistente) {
      throw new Error('Ya existe un ejercicio con ese nombre');
    }
  }

  Object.assign(ejercicio, datosActualizacion);
  await ejercicio.save();

  return ejercicio;
}

export async function eliminarEjercicioService(ejercicioId: string, creadorId: string) {
  const ejercicio = await Ejercicio.findById(ejercicioId);
  if (!ejercicio || !ejercicio.activo) {
    throw new Error('Ejercicio no encontrado');
  }

  // Verificar que el usuario es el creador del ejercicio
  if (ejercicio.creador.toString() !== creadorId) {
    throw new Error('No tienes permisos para eliminar este ejercicio');
  }

  ejercicio.activo = false;
  await ejercicio.save();

  return { message: 'Ejercicio eliminado correctamente' };
}
