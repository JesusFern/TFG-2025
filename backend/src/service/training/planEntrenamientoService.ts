import mongoose from 'mongoose';
import PlanEntrenamiento from '../../models/training/planEntrenamiento';
import User from '../../models/users/user';
import Sesion from '../../models/training/sesion';
import { EjercicioDistribucionService } from './ejercicioDistribucionService';
import { notificacionIntegracionService } from '../notificaciones/notificacionIntegracionService';
import { recordatorioService } from '../notificaciones/recordatorioService';

interface EjercicioSesion {
  ejercicio: string;
  nombre: string;
  slug: string;
  grupoMuscular: string;
  equipamiento: string;
  tipoEjercicio: string;
  instrucciones?: string;
  videoDemostrativo?: string;
  series: number;
  repeticiones: number;
  peso: number;
  tiempoDescanso: number;
  nivelIntensidad: string;
  opcionesProgresion: {
    aumentarPeso: boolean;
    masRepeticiones: boolean;
    mayorIntensidad: boolean;
  };
}

// Función auxiliar para crear sesiones para un cliente
async function crearSesionesParaCliente(
  planId: string,
  clienteId: string,
  entrenadorId: string,
  fechaInicio: string,
  diasSemana: number[],
  duracionDias: number
) {
  const sesiones = [];
  const fechaInicioDate = new Date(fechaInicio);
  
  // Calcular todas las fechas de sesiones
  const fechasSesiones = [];
  for (let dia = 0; dia < duracionDias; dia++) {
    const fechaActual = new Date(fechaInicioDate);
    fechaActual.setDate(fechaActual.getDate() + dia);
    
    const diaSemana = fechaActual.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    if (diasSemana.includes(diaSemana)) {
      fechasSesiones.push(fechaActual);
    }
  }
  
  // Crear una sesión para cada fecha
  for (const fecha of fechasSesiones) {
    const sesion = new Sesion({
      entrenador: entrenadorId,
      cliente: clienteId,
      plan: planId,
      fecha: fecha.toISOString(),
      tipoEntrenamiento: 'Fuerza', // Por defecto, se puede cambiar después
      duracion: 60, // 60 minutos por defecto
      ejercicios: [], // Se pueden añadir ejercicios después
      completada: false
    });
    
    await sesion.save();
    sesiones.push(sesion);
  }
  
  return sesiones;
}

export async function crearPlanEntrenamientoService({
  entrenadorId,
  nombre,
  descripcion,
  objetivo,
  duracionDias,
  sesionesPorSemana,
  fechaInicio,
  diasSemana,
  clientes,
  publico
}: {
  entrenadorId: string;
  nombre: string;
  descripcion?: string;
  objetivo: string;
  duracionDias: number;
  sesionesPorSemana: number;
  fechaInicio: string;
  diasSemana: number[];
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
    fechaInicio: new Date(fechaInicio),
    diasSemana,
    entrenador: entrenadorId,
    clientes,
    publico
  });

  await plan.save();

  // Crear sesiones automáticamente para cada cliente
  const sesionesCreadas = [];
  for (const clienteId of clientes) {
    const sesionesDelCliente = await crearSesionesParaCliente(plan._id.toString(), clienteId, entrenadorId, fechaInicio, diasSemana, duracionDias);
    sesionesCreadas.push(...sesionesDelCliente);
  }

  // Actualizar el plan con las sesiones creadas
  plan.sesiones = sesionesCreadas.map(sesion => sesion._id);
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
  
  const query: { 
    entrenador?: string; 
    clientes?: string; 
    objetivo?: string; 
    publico?: boolean; 
    activo?: boolean;
    draftMode?: boolean;
  } = {};

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
  // Pero solo si no se está filtrando también por entrenador (es decir, es una consulta directa del cliente)
  if (filtros.cliente && !filtros.entrenador) {
    query.draftMode = false;
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

// ===== FUNCIONES DE GENERACIÓN AUTOMÁTICA =====

// Obtener todos los objetivos disponibles (ahora dinámicos)
export async function obtenerObjetivosDisponiblesService() {
  return [
    {
      objetivo: 'Ganancia muscular',
      descripcion: 'Desarrollo de masa muscular y fuerza',
      nivelDificultad: 'Intermedio',
      equipamiento: ['Peso corporal', 'Mancuernas', 'Barra'],
      gruposMusculares: ['Pecho', 'Piernas', 'Espalda', 'Hombros', 'Brazos', 'Core'],
      estrategiasDisponibles: ['full_body', 'upper_lower', 'push_pull_legs', 'especializacion']
    },
    {
      objetivo: 'Pérdida de peso',
      descripcion: 'Quema de grasa y mejora de composición corporal',
      nivelDificultad: 'Principiante',
      equipamiento: ['Peso corporal', 'Mancuernas'],
      gruposMusculares: ['Pecho', 'Piernas', 'Espalda', 'Hombros', 'Brazos', 'Core'],
      estrategiasDisponibles: ['full_body', 'upper_lower', 'push_pull_legs']
    },
    {
      objetivo: 'Resistencia',
      descripcion: 'Mejora de resistencia cardiovascular y muscular',
      nivelDificultad: 'Intermedio',
      equipamiento: ['Peso corporal', 'Mancuernas'],
      gruposMusculares: ['Pecho', 'Piernas', 'Espalda', 'Hombros', 'Brazos', 'Core'],
      estrategiasDisponibles: ['full_body', 'upper_lower', 'push_pull_legs']
    },
    {
      objetivo: 'Flexibilidad',
      descripcion: 'Mejora de movilidad y flexibilidad',
      nivelDificultad: 'Principiante',
      equipamiento: ['Peso corporal'],
      gruposMusculares: ['Core', 'Piernas', 'Espalda'],
      estrategiasDisponibles: ['full_body']
    },
    {
      objetivo: 'Mantenimiento',
      descripcion: 'Mantener condición física actual',
      nivelDificultad: 'Intermedio',
      equipamiento: ['Peso corporal', 'Mancuernas', 'Barra'],
      gruposMusculares: ['Pecho', 'Piernas', 'Espalda', 'Hombros', 'Brazos', 'Core'],
      estrategiasDisponibles: ['full_body', 'upper_lower', 'push_pull_legs']
    },
    {
      objetivo: 'Salud general',
      descripcion: 'Mejora general de la salud y bienestar',
      nivelDificultad: 'Principiante',
      equipamiento: ['Peso corporal', 'Mancuernas'],
      gruposMusculares: ['Pecho', 'Piernas', 'Espalda', 'Hombros', 'Brazos', 'Core'],
      estrategiasDisponibles: ['full_body', 'upper_lower']
    }
  ];
}

// Obtener plantilla por objetivo específico (ahora dinámica)
export async function obtenerPlantillaPorObjetivoService(objetivo: string) {
  const objetivos = await obtenerObjetivosDisponiblesService();
  return objetivos.find(obj => obj.objetivo === objetivo) || null;
}

// Obtener plantillas por filtros (ahora dinámicas)
export async function obtenerPlantillasPorFiltrosService(filtros: {
  objetivo?: string;
  nivelDificultad?: string;
  equipamiento?: string[];
  gruposMusculares?: string[];
}) {
  let objetivos = await obtenerObjetivosDisponiblesService();
  
  if (filtros.objetivo) {
    objetivos = objetivos.filter(obj => obj.objetivo === filtros.objetivo);
  }
  
  if (filtros.nivelDificultad) {
    objetivos = objetivos.filter(obj => obj.nivelDificultad === filtros.nivelDificultad);
  }
  
  if (filtros.equipamiento && filtros.equipamiento.length > 0) {
    objetivos = objetivos.filter(obj => 
      filtros.equipamiento!.some(eq => obj.equipamiento.includes(eq))
    );
  }
  
  if (filtros.gruposMusculares && filtros.gruposMusculares.length > 0) {
    objetivos = objetivos.filter(obj => 
      filtros.gruposMusculares!.some(grupo => obj.gruposMusculares.includes(grupo))
    );
  }
  
  return objetivos;
}

// Buscar plantillas por texto (ahora dinámicas)
export async function buscarPlantillasService(termino: string) {
  const objetivos = await obtenerObjetivosDisponiblesService();
  const terminoLower = termino.toLowerCase();
  
  return objetivos.filter(obj => 
    obj.objetivo.toLowerCase().includes(terminoLower) ||
    obj.descripcion.toLowerCase().includes(terminoLower) ||
    obj.gruposMusculares.some(grupo => grupo.toLowerCase().includes(terminoLower))
  );
}

// Generar plan desde plantilla usando lógica dinámica
export async function generarPlanDesdePlantillaService({
  entrenadorId,
  objetivo,
  duracionSemanas,
  sesionesPorSemana,
  nombre,
  descripcion,
  fechaInicio,
  diasSemana,
  clientes,
  publico = false,
  nivelDificultad = 'Intermedio'
}: {
  entrenadorId: string;
  objetivo: string;
  duracionSemanas: number;
  sesionesPorSemana: number;
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  diasSemana: number[];
  clientes: string[];
  publico?: boolean;
  nivelDificultad?: 'Principiante' | 'Intermedio' | 'Avanzado';
}) {
  // Validar que el entrenador existe
  const entrenador = await User.findById(entrenadorId);
  if (!entrenador || entrenador.role !== 'worker') {
    throw new Error('Entrenador no encontrado o no válido');
  }

  // Validar que todos los clientes existen
  // Validar que todos los IDs son ObjectIds válidos
  const clientesValidos = clientes.filter(id => {
    try {
      return mongoose.Types.ObjectId.isValid(id);
    } catch {
      return false;
    }
  });
  
  if (clientesValidos.length !== clientes.length) {
    throw new Error('Algunos IDs de clientes no son válidos');
  }
  
  const clientesExistentes = await User.find({ 
    _id: { $in: clientesValidos }, 
    role: 'user' 
  });
  
  if (clientesExistentes.length !== clientesValidos.length) {
    throw new Error('Algunos clientes no fueron encontrados');
  }

  // Generar sesiones usando la nueva lógica de distribución
  const sesionesTemplate = await EjercicioDistribucionService.generarSesionesParaPlan(
    objetivo,
    sesionesPorSemana,
    duracionSemanas,
    diasSemana,
    nivelDificultad
  );

  if (sesionesTemplate.length === 0) {
    throw new Error('No se pudieron generar sesiones para la configuración especificada');
  }

  // Crear el plan de entrenamiento
  const duracionDias = duracionSemanas * 7;
  const plan = new PlanEntrenamiento({
    entrenador: entrenadorId,
    nombre,
    descripcion: descripcion || `Plan de ${objetivo.toLowerCase()} - ${sesionesPorSemana} sesiones/semana`,
    objetivo,
    duracionDias,
    sesionesPorSemana,
    fechaInicio: new Date(fechaInicio),
    diasSemana,
    clientes,
    publico,
    draftMode: true
  });

  await plan.save();

  // Generar sesiones para cada cliente
  const sesionesCreadas = [];
  const fechaInicioDate = new Date(fechaInicio);

  // Calcular todas las fechas de sesiones
  const fechasSesiones = [];
  for (let semana = 0; semana < duracionSemanas; semana++) {
    for (let dia = 0; dia < 7; dia++) {
      const fechaActual = new Date(fechaInicioDate);
      fechaActual.setDate(fechaActual.getDate() + (semana * 7) + dia);
      
      const diaSemana = fechaActual.getDay();
      if (diasSemana.includes(diaSemana)) {
        fechasSesiones.push(fechaActual);
      }
    }
  }

  // Crear sesiones para cada cliente
  for (const clienteId of clientes) {
    for (let i = 0; i < fechasSesiones.length; i++) {
      const fechaSesion = fechasSesiones[i];
      const sesionTemplate = sesionesTemplate[i % sesionesTemplate.length]; // Rotar entre sesiones

      // Preparar ejercicios para la sesión
      const ejerciciosSesion = sesionTemplate.ejercicios.map((ejercicio: EjercicioSesion, index: number) => ({
        ejercicio: ejercicio.ejercicio,
        orden: index + 1,
        series: ejercicio.series,
        repeticiones: ejercicio.repeticiones,
        peso: ejercicio.peso || 0, // Usar el peso generado por ejercicioDistribucionService, 0 si es undefined
        tiempoDescanso: ejercicio.tiempoDescanso,
        nivelIntensidad: ejercicio.nivelIntensidad,
        ejerciciosAlternativos: [],
        opcionesProgresion: ejercicio.opcionesProgresion
      }));

      const sesion = new Sesion({
        entrenador: entrenadorId,
        cliente: clienteId,
        plan: plan._id,
        fecha: fechaSesion.toISOString(),
        tipoEntrenamiento: sesionTemplate.tipoEntrenamiento,
        duracion: sesionTemplate.duracion,
        ejercicios: ejerciciosSesion,
        completada: false
      });

      await sesion.save();
      sesionesCreadas.push(sesion);
    }
  }

  // Actualizar el plan con las sesiones creadas
  plan.sesiones = sesionesCreadas.map(s => s._id);
  await plan.save();

  return {
    plan,
    sesionesCreadas,
    plantillaUsada: {
      objetivo,
      descripcion: `Plan generado dinámicamente para ${objetivo}`,
      nivelDificultad,
      estrategia: EjercicioDistribucionService.determinarEstrategia(sesionesPorSemana)
    }
  };
}

// Publicar un plan de entrenamiento
export async function publicarPlanEntrenamientoService(planId: string, entrenadorId: string): Promise<typeof PlanEntrenamiento.prototype> {
  const plan = await PlanEntrenamiento.findById(planId);
  if (!plan) {
    throw new Error('Plan de entrenamiento no encontrado');
  }

  // Verificar que el entrenador es el creador del plan
  if (plan.entrenador.toString() !== entrenadorId) {
    throw new Error('No tienes permisos para publicar este plan');
  }

  plan.draftMode = false;
  await plan.save();

  // Enviar notificaciones a todos los clientes asignados
  if (plan.clientes && plan.clientes.length > 0) {
    // Enviar notificación a cada cliente asignado
    for (const clienteId of plan.clientes) {
      try {
        await notificacionIntegracionService.notificarPlanPublicado(
          clienteId.toString(),
          entrenadorId,
          planId,
          plan.nombre
        );
      } catch (error) {
        console.error(`Error al enviar notificación de plan publicado a cliente ${clienteId}:`, error);
        // No lanzar error para no interrumpir el proceso de publicación
      }
    }

    // Crear recordatorios de sesiones para todos los clientes
    try {
      console.log(`Buscando sesiones para plan ${planId}...`);
      
      // Obtener las sesiones del plan usando el método correcto
      const planConSesiones = await PlanEntrenamiento.findById(planId).populate({
        path: 'sesiones',
        populate: {
          path: 'cliente',
          model: 'User'
        }
      });
      const sesiones = (planConSesiones?.sesiones || []) as unknown[];
      console.log(`Sesiones encontradas: ${sesiones.length}`);
      
      if (sesiones.length === 0) {
        console.log('No se encontraron sesiones para crear recordatorios');
        return plan;
      }
      
      for (const sesionData of sesiones) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sesion = sesionData as any;
          const fechaHoraSesion = new Date(sesion.fecha);
          // Si no hay hora específica, usar 09:00 por defecto
          if (!sesion.hora) {
            fechaHoraSesion.setHours(9, 0, 0, 0);
          } else {
            const [horas, minutos] = sesion.hora.split(':').map(Number);
            fechaHoraSesion.setHours(horas, minutos, 0, 0);
          }
          
          console.log(`Creando recordatorio para sesión ${sesion._id} del cliente ${sesion.cliente._id} en ${fechaHoraSesion.toISOString()}`);
          
          await recordatorioService.crearRecordatorioSesion(
            sesion.cliente._id.toString(),
            entrenadorId,
            sesion._id.toString(),
            `${sesion.tipoEntrenamiento} - ${sesion.duracion} min`,
            fechaHoraSesion,
            planId
          );
          
          console.log(`Recordatorio de sesión creado exitosamente para ${sesion.cliente._id} en ${fechaHoraSesion.toISOString()}`);
        } catch (error) {
          console.error(`Error al crear recordatorio de sesión:`, error);
          // Continuar con las demás sesiones aunque una falle
        }
      }
      
      console.log(`Recordatorios de sesiones creados para plan ${planId}`);
    } catch (error) {
      console.error('Error al crear recordatorios de sesiones:', error);
      // No lanzar error para no interrumpir el proceso de publicación
    }
  }

  return plan;
}
