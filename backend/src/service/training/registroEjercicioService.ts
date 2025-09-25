import RegistroEjercicio from '../../models/training/registroEjercicio';
import Sesion from '../../models/training/sesion';
import Ejercicio from '../../models/training/ejercicio';
import User from '../../models/users/user';
import logger from '../../utils/logger';
import mongoose from 'mongoose';

export async function crearRegistroEjercicioService({
  ejercicioId,
  sesionId,
  clienteId,
  cargaUtilizada,
  repeticionesRealizadas,
  seriesCompletadas,
  nivelEsfuerzo,
  videoCliente,
  notas,
  tiempoDescanso,
  duracionEjercicio,
  ordenEnSesion,
  completado
}: {
  ejercicioId: string;
  sesionId: string;
  clienteId: string;
  cargaUtilizada?: number;
  repeticionesRealizadas: number;
  seriesCompletadas: number;
  nivelEsfuerzo: number;
  videoCliente?: string;
  notas?: string;
  tiempoDescanso?: number;
  duracionEjercicio?: number;
  ordenEnSesion?: number;
  completado?: boolean;
}) {
  // Validar que el cliente existe y tiene rol 'user'
  const clienteUser = await User.findById(clienteId);
  if (!clienteUser || clienteUser.role !== 'user') {
    throw new Error('El cliente debe existir y tener rol user');
  }

  // Validar que la sesión existe y pertenece al cliente
  const sesion = await Sesion.findById(sesionId);
  if (!sesion) {
    throw new Error('Sesión no encontrada');
  }
  if (sesion.cliente.toString() !== clienteId) {
    throw new Error('No tienes permisos para registrar ejercicios en esta sesión');
  }

  // Validar que el ejercicio existe y está activo
  const ejercicio = await Ejercicio.findById(ejercicioId);
  if (!ejercicio || !ejercicio.activo) {
    throw new Error('Ejercicio no encontrado o no está activo');
  }

  // Validar que el ejercicio está en la sesión
  const ejercicioEnSesion = sesion.ejercicios.find(e => e.ejercicio.toString() === ejercicioId);
  if (!ejercicioEnSesion) {
    throw new Error('El ejercicio no está incluido en esta sesión');
  }

  // Verificar si ya existe un registro para este ejercicio en esta sesión
  const registroExistente = await RegistroEjercicio.findOne({
    ejercicio: ejercicioId,
    sesion: sesionId,
    cliente: clienteId
  });

  if (registroExistente) {
    throw new Error('Ya existe un registro para este ejercicio en esta sesión');
  }

  // Validar que la sesión no esté completada
  if (sesion.completada) {
    throw new Error('No se pueden registrar ejercicios en una sesión ya completada');
  }

  // Validar que la fecha de la sesión no sea futura
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSesion = new Date(sesion.fecha);
  fechaSesion.setHours(0, 0, 0, 0);
  
  if (fechaSesion > hoy) {
    throw new Error('No se pueden registrar ejercicios en sesiones futuras');
  }

  const registro = new RegistroEjercicio({
    ejercicio: ejercicioId,
    sesion: sesionId,
    cliente: clienteId,
    cargaUtilizada,
    repeticionesRealizadas,
    seriesCompletadas,
    nivelEsfuerzo,
    videoCliente,
    notas,
    tiempoDescanso,
    duracionEjercicio,
    ordenEnSesion: ordenEnSesion || ejercicioEnSesion.orden,
    completado: completado !== undefined ? completado : true, // Usar el valor enviado o true por defecto
    fecha: new Date()
  });

  await registro.save();

  logger.info('Registro de ejercicio creado correctamente', {
    registroId: registro._id,
    ejercicioId,
    sesionId,
    clienteId
  });

  return registro;
}

export async function obtenerRegistrosEjercicioService(filtros: {
  sesion?: string;
  cliente?: string;
  ejercicio?: string;
  completado?: boolean;
  fecha?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  const query: Record<string, unknown> = {};

  if (filtros.sesion) {
    query.sesion = filtros.sesion;
  }
  if (filtros.cliente) {
    query.cliente = filtros.cliente;
  }
  if (filtros.ejercicio) {
    query.ejercicio = filtros.ejercicio;
  }
  if (filtros.completado !== undefined) {
    query.completado = filtros.completado;
  }
  if (filtros.fecha) {
    const fecha = new Date(filtros.fecha);
    const siguienteDia = new Date(fecha);
    siguienteDia.setDate(siguienteDia.getDate() + 1);
    query.fecha = { $gte: fecha, $lt: siguienteDia };
  }
  if (filtros.fechaDesde || filtros.fechaHasta) {
    query.fecha = {} as Record<string, unknown>;
    if (filtros.fechaDesde) {
      (query.fecha as Record<string, unknown>).$gte = new Date(filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setDate(fechaHasta.getDate() + 1);
      (query.fecha as Record<string, unknown>).$lt = fechaHasta;
    }
  }

  const registros = await RegistroEjercicio.find(query)
    .populate('ejercicio', 'nombre grupoMuscular equipamiento nivelDificultad')
    .populate('sesion', 'fecha tipoEntrenamiento duracion')
    .populate('cliente', 'nombre email')
    .sort({ fecha: -1, ordenEnSesion: 1 });

  return registros;
}

export async function obtenerRegistroEjercicioPorIdService(registroId: string) {
  const registro = await RegistroEjercicio.findById(registroId)
    .populate('ejercicio', 'nombre grupoMuscular equipamiento nivelDificultad instrucciones videoDemostrativo')
    .populate('sesion', 'fecha tipoEntrenamiento duracion ejercicios')
    .populate('cliente', 'nombre email');

  if (!registro) {
    throw new Error('Registro de ejercicio no encontrado');
  }

  return registro;
}

export async function actualizarRegistroEjercicioService(
  registroId: string,
  clienteId: string,
  datosActualizacion: Partial<{
    cargaUtilizada: number;
    repeticionesRealizadas: number;
    seriesCompletadas: number;
    nivelEsfuerzo: number;
    videoCliente: string;
    notas: string;
    tiempoDescanso: number;
    duracionEjercicio: number;
    completado: boolean;
  }>
) {
  const registro = await RegistroEjercicio.findById(registroId);
  if (!registro) {
    throw new Error('Registro de ejercicio no encontrado');
  }

  // Verificar que el usuario es el cliente del registro
  if (registro.cliente.toString() !== clienteId) {
    throw new Error('No tienes permisos para editar este registro');
  }

  // Verificar que la sesión no esté completada
  const sesion = await Sesion.findById(registro.sesion);
  if (sesion?.completada) {
    throw new Error('No se pueden editar registros de sesiones ya completadas');
  }

  Object.assign(registro, datosActualizacion);
  await registro.save();

  logger.info('Registro de ejercicio actualizado correctamente', {
    registroId,
    clienteId,
    datosActualizacion
  });

  return registro;
}

export async function eliminarRegistroEjercicioService(registroId: string, clienteId: string) {
  const registro = await RegistroEjercicio.findById(registroId);
  if (!registro) {
    throw new Error('Registro de ejercicio no encontrado');
  }

  // Verificar que el usuario es el cliente del registro
  if (registro.cliente.toString() !== clienteId) {
    throw new Error('No tienes permisos para eliminar este registro');
  }

  // Verificar que la sesión no esté completada
  const sesion = await Sesion.findById(registro.sesion);
  if (sesion?.completada) {
    throw new Error('No se pueden eliminar registros de sesiones ya completadas');
  }

  await RegistroEjercicio.findByIdAndDelete(registroId);

  logger.info('Registro de ejercicio eliminado correctamente', {
    registroId,
    clienteId
  });

  return { message: 'Registro de ejercicio eliminado correctamente' };
}

export async function marcarRegistroCompletadoService(registroId: string, clienteId: string) {
  const registro = await RegistroEjercicio.findById(registroId);
  if (!registro) {
    throw new Error('Registro de ejercicio no encontrado');
  }

  // Verificar que el usuario es el cliente del registro
  if (registro.cliente.toString() !== clienteId) {
    throw new Error('No tienes permisos para marcar este registro como completado');
  }

  registro.completado = true;
  await registro.save();

  logger.info('Registro de ejercicio marcado como completado', {
    registroId,
    clienteId
  });

  return registro;
}

export async function obtenerProgresoEjercicioService(ejercicioId: string, clienteId: string, fechaDesde?: string, fechaHasta?: string) {
  // Validar que los IDs sean ObjectIds válidos
  if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
    throw new Error('ID de ejercicio no válido');
  }
  if (!mongoose.Types.ObjectId.isValid(clienteId)) {
    throw new Error('ID de cliente no válido');
  }

  // Construir query de forma segura
  const query: Record<string, unknown> = {
    ejercicio: new mongoose.Types.ObjectId(ejercicioId),
    cliente: new mongoose.Types.ObjectId(clienteId),
    completado: true
  };

  // Validar y construir filtro de fechas de forma segura
  if (fechaDesde || fechaHasta) {
    query.fecha = {} as Record<string, unknown>;
    
    if (fechaDesde) {
      const fechaDesdeDate = new Date(fechaDesde);
      if (isNaN(fechaDesdeDate.getTime())) {
        throw new Error('Fecha desde no válida');
      }
      (query.fecha as Record<string, unknown>).$gte = fechaDesdeDate;
    }
    
    if (fechaHasta) {
      const fechaHastaDate = new Date(fechaHasta);
      if (isNaN(fechaHastaDate.getTime())) {
        throw new Error('Fecha hasta no válida');
      }
      fechaHastaDate.setDate(fechaHastaDate.getDate() + 1);
      (query.fecha as Record<string, unknown>).$lt = fechaHastaDate;
    }
  }

  const registros = await RegistroEjercicio.find(query)
    .populate('sesion', 'fecha tipoEntrenamiento')
    .sort({ fecha: 1 });

  return registros;
}

export async function verificarSesionCompletaService(sesionId: string, clienteId: string) {
  // Obtener la sesión con sus ejercicios
  const sesion = await Sesion.findById(sesionId)
    .populate('ejercicios.ejercicio');
  
  if (!sesion) {
    throw new Error('Sesión no encontrada');
  }

  // Verificar que el cliente tiene permisos
  if (sesion.cliente.toString() !== clienteId) {
    throw new Error('No tienes permisos para verificar esta sesión');
  }

  // Obtener todos los registros de ejercicios para esta sesión
  const registros = await RegistroEjercicio.find({
    sesion: sesionId,
    cliente: clienteId
  });

  // Verificar que todos los ejercicios de la sesión tienen registro
  const ejerciciosConRegistro = registros.map(r => r.ejercicio.toString());
  const ejerciciosSesion = sesion.ejercicios.map(e => e.ejercicio.toString());
  
  // Calcular ejercicios completados (con completado: true)
  const ejerciciosCompletados = registros
    .filter(r => r.completado)
    .map(r => r.ejercicio.toString());
  
  const ejerciciosFaltantes = ejerciciosSesion.filter(ejercicioId => 
    !ejerciciosConRegistro.includes(ejercicioId)
  );

  const porcentajeCompletado = ejerciciosSesion.length > 0 
    ? Math.round((ejerciciosCompletados.length / ejerciciosSesion.length) * 100)
    : 0;

  return {
    sesionCompleta: ejerciciosFaltantes.length === 0,
    ejerciciosFaltantes,
    totalEjercicios: ejerciciosSesion.length,
    ejerciciosRegistrados: ejerciciosConRegistro.length,
    ejerciciosCompletados: ejerciciosCompletados.length,
    porcentajeCompletado,
    registros
  };
}
