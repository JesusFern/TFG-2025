import Sesion from '../../models/training/sesion';
import PlanEntrenamiento from '../../models/training/planEntrenamiento';
import User from '../../models/users/user';
import Ejercicio from '../../models/training/ejercicio';


export async function crearSesionService({
  entrenadorId,
  clienteId,
  planId,
  fecha,
  hora,
  tipoEntrenamiento,
  duracion,
  ejercicios
}: {
  entrenadorId: string;
  clienteId: string;
  planId?: string;
  fecha: string;
  hora?: string;
  tipoEntrenamiento: string;
  duracion: number;
  ejercicios: Array<{
    ejercicio: string;
    orden: number;
    series: number;
    repeticiones: number;
    peso?: number;
    tiempoDescanso: number;
    nivelIntensidad: string;
    ejerciciosAlternativos?: string[];
    opcionesProgresion?: {
      aumentarPeso: boolean;
      masRepeticiones: boolean;
      mayorIntensidad: boolean;
    };
  }>;
}) {
  // Validar que el entrenador es un worker
  const entrenadorUser = await User.findById(entrenadorId);
  if (!entrenadorUser || entrenadorUser.role !== 'worker') {
    throw new Error('El entrenador debe ser un usuario con rol worker');
  }

  // Validar que el cliente existe y tiene rol 'user'
  const clienteUser = await User.findById(clienteId);
  if (!clienteUser || clienteUser.role !== 'user') {
    throw new Error('El cliente debe existir y tener rol user');
  }

  // Si se proporciona un plan, validar que existe y que el entrenador y cliente están asignados
  if (planId) {
    const plan = await PlanEntrenamiento.findById(planId);
    if (!plan || !plan.activo) {
      throw new Error('Plan de entrenamiento no encontrado');
    }
    if (plan.entrenador.toString() !== entrenadorId) {
      throw new Error('No tienes permisos para crear sesiones para este plan');
    }
    if (!plan.clientes.some(id => id.toString() === clienteId)) {
      throw new Error('El cliente no está asignado a este plan');
    }
  }

  // Validar que todos los ejercicios existen
  const ejerciciosIds = ejercicios.map(e => e.ejercicio);
  const ejerciciosExistentes = await Ejercicio.find({ 
    _id: { $in: ejerciciosIds },
    activo: true 
  });
  if (ejerciciosExistentes.length !== ejerciciosIds.length) {
    throw new Error('Algunos ejercicios no existen o no están activos');
  }

  // Validar que no hay ejercicios duplicados en el mismo orden
  const ordenes = ejercicios.map(e => e.orden);
  const ordenesUnicos = new Set(ordenes);
  if (ordenes.length !== ordenesUnicos.size) {
    throw new Error('No puede haber ejercicios con el mismo orden');
  }

  // Validar fecha
  const fechaSesion = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fechaSesion < hoy) {
    throw new Error('La fecha de la sesión no puede ser anterior al día actual');
  }

  const sesion = new Sesion({
    fecha: fechaSesion,
    hora,
    tipoEntrenamiento,
    duracion,
    ejercicios,
    entrenador: entrenadorId,
    cliente: clienteId
  });

  await sesion.save();

  // Si la sesión está asociada a un plan, agregarla al plan
  if (planId) {
    await PlanEntrenamiento.findByIdAndUpdate(planId, {
      $push: { sesiones: sesion._id }
    });
  }

  return sesion;
}

export async function obtenerSesionesService(filtros: {
  entrenador?: string;
  cliente?: string;
  plan?: string;
  fecha?: string;
  tipoEntrenamiento?: string;
  completada?: boolean;
}) {
  const query: { entrenador?: string; cliente?: string; _id?: { $in: unknown[] }; fecha?: { $gte: Date; $lt: Date }; tipoEntrenamiento?: string; completada?: boolean } = {};

  if (filtros.entrenador) {
    query.entrenador = filtros.entrenador;
  }
  if (filtros.cliente) {
    query.cliente = filtros.cliente;
  }
  if (filtros.plan) {
    query._id = { $in: await PlanEntrenamiento.findById(filtros.plan).then(p => p?.sesiones || []) };
  }
  if (filtros.fecha) {
    const fecha = new Date(filtros.fecha);
    const siguienteDia = new Date(fecha);
    siguienteDia.setDate(siguienteDia.getDate() + 1);
    query.fecha = { $gte: fecha, $lt: siguienteDia };
  }
  if (filtros.tipoEntrenamiento) {
    query.tipoEntrenamiento = filtros.tipoEntrenamiento;
  }
  if (filtros.completada !== undefined) {
    query.completada = filtros.completada;
  }

  const sesiones = await Sesion.find(query)
    .populate('entrenador', 'nombre email')
    .populate('cliente', 'nombre email')
    .populate('ejercicios.ejercicio')
    .populate('ejercicios.ejerciciosAlternativos')
    .sort({ fecha: 1, hora: 1 });

  return sesiones;
}

export async function obtenerSesionPorIdService(sesionId: string) {
  const sesion = await Sesion.findById(sesionId)
    .populate('entrenador', 'nombre email')
    .populate('cliente', 'nombre email')
    .populate('ejercicios.ejercicio')
    .populate('ejercicios.ejerciciosAlternativos');
  
  if (!sesion) {
    throw new Error('Sesión no encontrada');
  }

  return sesion;
}

export async function actualizarSesionService(
  sesionId: string,
  entrenadorId: string,
  datosActualizacion: Partial<{
    fecha: string;
    hora: string;
    tipoEntrenamiento: string;
    duracion: number;
    ejercicios: Array<{
      ejercicio: string;
      orden: number;
      series: number;
      repeticiones: number;
      peso?: number;
      tiempoDescanso: number;
      nivelIntensidad: string;
      ejerciciosAlternativos?: string[];
      opcionesProgresion?: {
        aumentarPeso: boolean;
        masRepeticiones: boolean;
        mayorIntensidad: boolean;
      };
    }>;
    notas: string;
  }>
) {
  const sesion = await Sesion.findById(sesionId);
  if (!sesion) {
    throw new Error('Sesión no encontrada');
  }

  // Verificar que el usuario es el entrenador de la sesión
  if (sesion.entrenador.toString() !== entrenadorId) {
    throw new Error('No tienes permisos para editar esta sesión');
  }

  // Si se están cambiando los ejercicios, validar que todos existen
  if (datosActualizacion.ejercicios) {
    const ejerciciosIds = datosActualizacion.ejercicios.map(e => e.ejercicio);
    
    // Buscar ejercicios existentes con un pequeño retraso para ejercicios recién creados
    let ejerciciosExistentes = await Ejercicio.find({ 
      _id: { $in: ejerciciosIds },
      activo: true 
    });
    
    // Si no se encuentran todos los ejercicios, esperar un poco y volver a intentar
    if (ejerciciosExistentes.length !== ejerciciosIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
      ejerciciosExistentes = await Ejercicio.find({ 
        _id: { $in: ejerciciosIds },
        activo: true 
      });
      
      if (ejerciciosExistentes.length !== ejerciciosIds.length) {
        throw new Error('Algunos ejercicios no existen o no están activos');
      }
    }

    // Validar que no hay ejercicios duplicados en el mismo orden
    const ordenes = datosActualizacion.ejercicios.map(e => e.orden);
    const ordenesUnicos = new Set(ordenes);
    if (ordenes.length !== ordenesUnicos.size) {
      throw new Error('No puede haber ejercicios con el mismo orden');
    }
  }

  // Si se está cambiando la fecha, validar que no sea anterior al día actual
  if (datosActualizacion.fecha) {
    const fechaSesion = new Date(datosActualizacion.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaSesion < hoy) {
      throw new Error('La fecha de la sesión no puede ser anterior al día actual');
    }
  }

  Object.assign(sesion, datosActualizacion);
  await sesion.save();

  return sesion;
}

export async function eliminarSesionService(sesionId: string, entrenadorId: string) {
  const sesion = await Sesion.findById(sesionId);
  if (!sesion) {
    throw new Error('Sesión no encontrada');
  }

  // Verificar que el usuario es el entrenador de la sesión
  if (sesion.entrenador.toString() !== entrenadorId) {
    throw new Error('No tienes permisos para eliminar esta sesión');
  }

  await Sesion.findByIdAndDelete(sesionId);

  return { message: 'Sesión eliminada correctamente' };
}

export async function marcarSesionCompletadaService(sesionId: string, clienteId: string) {
  const sesion = await Sesion.findById(sesionId);
  if (!sesion) {
    throw new Error('Sesión no encontrada');
  }

  // Verificar que el usuario es el cliente de la sesión
  if (sesion.cliente.toString() !== clienteId) {
    throw new Error('No tienes permisos para marcar esta sesión como completada');
  }

  sesion.completada = true;
  await sesion.save();

  return sesion;
}

export async function agregarNotasSesionService(sesionId: string, clienteId: string, notas: string) {
  const sesion = await Sesion.findById(sesionId);
  if (!sesion) {
    throw new Error('Sesión no encontrada');
  }

  // Verificar que el usuario es el cliente de la sesión
  if (sesion.cliente.toString() !== clienteId) {
    throw new Error('No tienes permisos para agregar notas a esta sesión');
  }

  sesion.notas = notas;
  await sesion.save();

  return sesion;
}
