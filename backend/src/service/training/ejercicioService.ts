import Ejercicio from '../../models/training/ejercicio';
import User from '../../models/users/user';

export async function crearEjercicioService({
  creadorId,
  nombre,
  slug,
  descripcion,
  grupoMuscular,
  equipamiento,
  nivelDificultad,
  tipoEjercicio,
  instrucciones,
  videoDemostrativo,
  publico = false
}: {
  creadorId: string;
  nombre: string;
  slug: string;
  descripcion: string;
  grupoMuscular: string;
  equipamiento: string;
  nivelDificultad: string;
  tipoEjercicio: string;
  instrucciones?: string;
  videoDemostrativo?: string;
  publico?: boolean;
}) {
  // Validar que el creador es un worker
  const creadorUser = await User.findById(creadorId);
  if (!creadorUser || creadorUser.role !== 'worker') {
    throw new Error('El creador debe ser un usuario con rol worker');
  }

  // Validar que no existe un ejercicio con el mismo slug
  const ejercicioExistente = await Ejercicio.findOne({ 
    slug,
    activo: true 
  });
  if (ejercicioExistente) {
    throw new Error('Ya existe un ejercicio con ese slug');
  }

  const ejercicio = new Ejercicio({
    nombre,
    slug,
    descripcion,
    grupoMuscular,
    equipamiento,
    nivelDificultad,
    tipoEjercicio,
    instrucciones,
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
  tipoEjercicio?: string;
  creador?: string;
  publico?: boolean;
  arquetipo?: boolean;
}) {
  const query: { 
    activo: boolean; 
    grupoMuscular?: string; 
    nivelDificultad?: string; 
    equipamiento?: string; 
    tipoEjercicio?: string;
    creador?: string;
    arquetipo?: boolean;
  } = { activo: true };

  if (filtros.grupoMuscular) {
    query.grupoMuscular = filtros.grupoMuscular;
  }
  if (filtros.nivelDificultad) {
    query.nivelDificultad = filtros.nivelDificultad;
  }
  if (filtros.equipamiento) {
    query.equipamiento = filtros.equipamiento;
  }
  if (filtros.tipoEjercicio) {
    query.tipoEjercicio = filtros.tipoEjercicio;
  }
  if (filtros.creador) {
    query.creador = filtros.creador;
  }
  if (filtros.arquetipo !== undefined) {
    query.arquetipo = filtros.arquetipo;
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

export async function obtenerEjercicioPorSlugService(slug: string) {
  const ejercicio = await Ejercicio.findOne({ slug, activo: true })
    .populate('creador', 'nombre email');
  
  if (!ejercicio) {
    throw new Error('Ejercicio no encontrado');
  }

  return ejercicio;
}

export async function actualizarEjercicioService(
  ejercicioId: string,
  creadorId: string,
  datosActualizacion: Partial<{
    nombre: string;
    slug: string;
    descripcion: string;
    grupoMuscular: string;
    equipamiento: string;
    nivelDificultad: string;
    tipoEjercicio: string;
    instrucciones: string;
    videoDemostrativo: string;
    publico: boolean;
  }>
) {
  const ejercicio = await Ejercicio.findById(ejercicioId);
  if (!ejercicio || !ejercicio.activo) {
    throw new Error('Ejercicio no encontrado');
  }

  // Verificar que el usuario es el creador del ejercicio
  if (!ejercicio.creador || ejercicio.creador.toString() !== creadorId) {
    throw new Error('No tienes permisos para editar este ejercicio');
  }

  // Si se está cambiando el slug, verificar que no exista otro con el mismo slug
  if (datosActualizacion.slug && datosActualizacion.slug !== ejercicio.slug) {
    const ejercicioExistente = await Ejercicio.findOne()
      .where('slug').equals(datosActualizacion.slug)
      .where('activo').equals(true)
      .where('_id').ne(ejercicioId);
    if (ejercicioExistente) {
      throw new Error('Ya existe un ejercicio con ese slug');
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
  if (!ejercicio.creador || ejercicio.creador.toString() !== creadorId) {
    throw new Error('No tienes permisos para eliminar este ejercicio');
  }

  ejercicio.activo = false;
  await ejercicio.save();

  return { message: 'Ejercicio eliminado correctamente' };
}

export async function crearEjercicioDesdeWgerService(
  wgerExercise: {
    id: number;
    name: string;
    description: string;
    category: string;
    muscles: string[];
    equipment: string[];
    videoUrl?: string;
  },
  creadorId: string,
  tipoEntrenamiento: string
) {
  // Validar y sanitizar datos de entrada
  if (!wgerExercise || typeof wgerExercise.id !== 'number' || wgerExercise.id <= 0) {
    throw new Error('ID de ejercicio wger inválido');
  }
  
  if (!wgerExercise.name || typeof wgerExercise.name !== 'string' || wgerExercise.name.trim().length === 0) {
    throw new Error('Nombre de ejercicio wger inválido');
  }
  
  if (!creadorId || typeof creadorId !== 'string' || creadorId.trim().length === 0) {
    throw new Error('ID de creador inválido');
  }
  
  if (!tipoEntrenamiento || typeof tipoEntrenamiento !== 'string' || tipoEntrenamiento.trim().length === 0) {
    throw new Error('Tipo de entrenamiento inválido');
  }

  // Validar que el creadorId sea un ObjectId válido
  if (!/^[0-9a-fA-F]{24}$/.test(creadorId.trim())) {
    throw new Error('ID de creador no es un ObjectId válido');
  }

  // Validar que el wgerId sea un número entero válido y dentro de un rango razonable
  if (!Number.isInteger(wgerExercise.id) || wgerExercise.id < 1 || wgerExercise.id > 999999) {
    throw new Error('ID de ejercicio wger debe ser un número entero válido entre 1 y 999999');
  }

  // Sanitizar datos
  const sanitizedWgerId = Math.floor(wgerExercise.id); // Asegurar que sea un entero
  const sanitizedCreadorId = creadorId.trim();
  const sanitizedTipoEntrenamiento = tipoEntrenamiento.trim();

  // Verificar que el creador existe y es un worker
  const creadorUser = await User.findById(sanitizedCreadorId);
  if (!creadorUser || creadorUser.role !== 'worker') {
    throw new Error('El creador debe ser un usuario con rol worker');
  }

  // Verificar si ya existe un ejercicio de wger con este ID (usando datos sanitizados)
  const ejercicioExistente = await Ejercicio.findOne({ 
    wgerId: sanitizedWgerId,
    esWger: true,
    activo: true 
  });

  if (ejercicioExistente) {
    return ejercicioExistente;
  }

  // Crear slug único (usando datos sanitizados)
  const sanitizedName = wgerExercise.name.trim();
  const baseSlug = sanitizedName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  let slug = baseSlug;
  let counter = 1;
  while (await Ejercicio.findOne({ slug, activo: true })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Mapear categoría de wger a grupo muscular del sistema
  const mapeoGrupoMuscular: Record<string, string> = {
    'Abs': 'Core',
    'Arms': 'Brazos',
    'Back': 'Espalda',
    'Calves': 'Pantorrillas',
    'Cardio': 'Piernas',
    'Chest': 'Pecho',
    'Legs': 'Piernas',
    'Shoulders': 'Hombros'
  };

  const grupoMuscular = mapeoGrupoMuscular[wgerExercise.category] || 'Core';

  // Mapear nivel de dificultad (por defecto Intermedio para ejercicios de wger)
  const nivelDificultad = 'Intermedio';

  // Sanitizar datos adicionales
  const sanitizedDescription = wgerExercise.description ? wgerExercise.description.trim() : '';
  const sanitizedEquipment = Array.isArray(wgerExercise.equipment) && wgerExercise.equipment.length > 0 
    ? wgerExercise.equipment[0].trim() 
    : 'Ninguno';
  const sanitizedVideoUrl = wgerExercise.videoUrl ? wgerExercise.videoUrl.trim() : undefined;

  const ejercicio = new Ejercicio({
    nombre: sanitizedName,
    slug,
    descripcion: sanitizedDescription,
    grupoMuscular,
    equipamiento: sanitizedEquipment,
    nivelDificultad,
    tipoEjercicio: sanitizedTipoEntrenamiento,
    instrucciones: sanitizedDescription,
    videoDemostrativo: sanitizedVideoUrl,
    creador: sanitizedCreadorId,
    arquetipo: false,
    publico: true,
    activo: true,
    esWger: true,
    wgerId: sanitizedWgerId
  });

  await ejercicio.save();
  return ejercicio;
}
