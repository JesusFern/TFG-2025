import PlanEntrenamiento from '../../models/training/planEntrenamiento';
import User from '../../models/users/user';

export async function crearPlanEntrenamientoService({
  entrenadorId,
  nombre,
  descripcion,
  objetivo,
  duracionDias,
  sesionesPorSemana,
  clientes,
  publico
}: {
  entrenadorId: string;
  nombre: string;
  descripcion?: string;
  objetivo: string;
  duracionDias: number;
  sesionesPorSemana: number;
  clientes: string[];
  publico: boolean;
}) {
  // Validar que el entrenador es un worker
  const entrenadorUser = await User.findById(entrenadorId);
  if (!entrenadorUser || entrenadorUser.role !== 'worker') {
    throw new Error('El entrenador debe ser un usuario con rol worker');
  }

  // Validar que todos los clientes existen y tienen rol 'user'
  if (clientes && clientes.length > 0) {
    const usuarios = await User.find({ _id: { $in: clientes } });
    if (usuarios.length !== clientes.length) {
      throw new Error('Algunos clientes no existen');
    }
    
    const noUser = usuarios.find(u => u.role !== 'user');
    if (noUser) {
      throw new Error('Todos los clientes asignados deben tener rol user');
    }
  }

  // Validar que las sesiones por semana no excedan la duración
  if (sesionesPorSemana > duracionDias) {
    throw new Error('Las sesiones por semana no pueden exceder la duración en días');
  }

  // Validar que no existe un plan con el mismo nombre del mismo entrenador
  const planExistente = await PlanEntrenamiento.findOne({
    nombre,
    entrenador: entrenadorId,
    activo: true
  });
  if (planExistente) {
    throw new Error('Ya existe un plan de entrenamiento con ese nombre');
  }

  const plan = new PlanEntrenamiento({
    nombre,
    descripcion,
    objetivo,
    duracionDias,
    sesionesPorSemana,
    entrenador: entrenadorId,
    clientes,
    publico
  });

  await plan.save();
  return plan;
}

export async function obtenerPlanesEntrenamientoService(filtros: {
  entrenador?: string;
  cliente?: string;
  objetivo?: string;
  publico?: boolean;
  activo?: boolean;
}) {
  const query: { entrenador?: string; clientes?: string; objetivo?: string; publico?: boolean; activo?: boolean } = {};

  if (filtros.entrenador) {
    query.entrenador = filtros.entrenador;
  }
  if (filtros.cliente) {
    query.clientes = filtros.cliente;
  }
  if (filtros.objetivo) {
    query.objetivo = filtros.objetivo;
  }
  if (filtros.publico !== undefined) {
    query.publico = filtros.publico;
  }
  if (filtros.activo !== undefined) {
    query.activo = filtros.activo;
  } else {
    query.activo = true;
  }

  const planes = await PlanEntrenamiento.find(query)
    .populate('entrenador', 'nombre email')
    .populate('clientes', 'nombre email')
    .populate('sesiones')
    .sort({ createdAt: -1 });

  return planes;
}

export async function obtenerPlanEntrenamientoPorIdService(planId: string) {
  const plan = await PlanEntrenamiento.findById(planId)
    .populate('entrenador', 'nombre email')
    .populate('clientes', 'nombre email')
    .populate('sesiones');
  
  if (!plan || !plan.activo) {
    throw new Error('Plan de entrenamiento no encontrado');
  }

  return plan;
}

export async function actualizarPlanEntrenamientoService(
  planId: string,
  entrenadorId: string,
  datosActualizacion: Partial<{
    nombre: string;
    descripcion: string;
    objetivo: string;
    duracionDias: number;
    sesionesPorSemana: number;
    clientes: string[];
    publico: boolean;
  }>
) {
  const plan = await PlanEntrenamiento.findById(planId);
  if (!plan || !plan.activo) {
    throw new Error('Plan de entrenamiento no encontrado');
  }

  // Verificar que el usuario es el entrenador del plan
  if (plan.entrenador.toString() !== entrenadorId) {
    throw new Error('No tienes permisos para editar este plan');
  }

  // Si se están cambiando los clientes, validar que todos existen y tienen rol 'user'
  if (datosActualizacion.clientes) {
    const usuarios = await User.find({ _id: { $in: datosActualizacion.clientes } });
    if (usuarios.length !== datosActualizacion.clientes.length) {
      throw new Error('Algunos clientes no existen');
    }
    
    const noUser = usuarios.find(u => u.role !== 'user');
    if (noUser) {
      throw new Error('Todos los clientes asignados deben tener rol user');
    }
  }

  // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
  if (datosActualizacion.nombre && datosActualizacion.nombre !== plan.nombre) {
    const planExistente = await PlanEntrenamiento.findOne({
      nombre: datosActualizacion.nombre,
      entrenador: entrenadorId,
      activo: true,
      _id: { $ne: planId }
    });
    if (planExistente) {
      throw new Error('Ya existe un plan de entrenamiento con ese nombre');
    }
  }

  // Validar que las sesiones por semana no excedan la duración
  if (datosActualizacion.sesionesPorSemana && datosActualizacion.duracionDias) {
    if (datosActualizacion.sesionesPorSemana > datosActualizacion.duracionDias) {
      throw new Error('Las sesiones por semana no pueden exceder la duración en días');
    }
  } else if (datosActualizacion.sesionesPorSemana && plan.duracionDias) {
    if (datosActualizacion.sesionesPorSemana > plan.duracionDias) {
      throw new Error('Las sesiones por semana no pueden exceder la duración en días');
    }
  } else if (datosActualizacion.duracionDias && plan.sesionesPorSemana) {
    if (plan.sesionesPorSemana > datosActualizacion.duracionDias) {
      throw new Error('Las sesiones por semana no pueden exceder la duración en días');
    }
  }

  Object.assign(plan, datosActualizacion);
  await plan.save();

  return plan;
}

export async function eliminarPlanEntrenamientoService(planId: string, entrenadorId: string) {
  const plan = await PlanEntrenamiento.findById(planId);
  if (!plan || !plan.activo) {
    throw new Error('Plan de entrenamiento no encontrado');
  }

  // Verificar que el usuario es el entrenador del plan
  if (plan.entrenador.toString() !== entrenadorId) {
    throw new Error('No tienes permisos para eliminar este plan');
  }

  // Soft delete - marcar como inactivo
  plan.activo = false;
  await plan.save();

  return { message: 'Plan de entrenamiento eliminado correctamente' };
}

export async function asignarClienteService(planId: string, entrenadorId: string, clienteId: string) {
  const plan = await PlanEntrenamiento.findById(planId);
  if (!plan || !plan.activo) {
    throw new Error('Plan de entrenamiento no encontrado');
  }

  // Verificar que el usuario es el entrenador del plan
  if (plan.entrenador.toString() !== entrenadorId) {
    throw new Error('No tienes permisos para modificar este plan');
  }

  // Verificar que el cliente existe y tiene rol 'user'
  const cliente = await User.findById(clienteId);
  if (!cliente || cliente.role !== 'user') {
    throw new Error('El cliente debe existir y tener rol user');
  }

  // Verificar que el cliente no esté ya asignado
  if (plan.clientes.some(id => id.toString() === clienteId)) {
    throw new Error('El cliente ya está asignado a este plan');
  }

  (plan.clientes as unknown as string[]).push(clienteId);
  await plan.save();

  return plan;
}

export async function removerClienteService(planId: string, entrenadorId: string, clienteId: string) {
  const plan = await PlanEntrenamiento.findById(planId);
  if (!plan || !plan.activo) {
    throw new Error('Plan de entrenamiento no encontrado');
  }

  // Verificar que el usuario es el entrenador del plan
  if (plan.entrenador.toString() !== entrenadorId) {
    throw new Error('No tienes permisos para modificar este plan');
  }

  // Verificar que el cliente esté asignado
  if (!plan.clientes.some(id => id.toString() === clienteId)) {
    throw new Error('El cliente no está asignado a este plan');
  }

  plan.clientes = plan.clientes.filter(id => id.toString() !== clienteId);
  await plan.save();

  return plan;
}
