import Dieta from '../../models/diets/dieta';
import User from '../../models/users/user';
import mongoose from 'mongoose';

export async function crearDietaService({
  creadorId,
  nombre,
  descripcion,
  tipo,
  duracion,
  comidasDiarias,
  asignadaA,
  fechaInicio,
  horasComidas,
  nombreComidas,
  draftMode = true
}: {
  creadorId: string;
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  asignadaA: string;
  fechaInicio: string;
  horasComidas: string[];
  nombreComidas: string[];
  draftMode?: boolean;
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
  
  if (!horasComidas || !Array.isArray(horasComidas) || horasComidas.length !== comidasDiarias) {
    throw new Error(`El array horasComidas debe tener exactamente ${comidasDiarias} elementos`);
  }

  if (!nombreComidas || !Array.isArray(nombreComidas) || nombreComidas.length !== comidasDiarias) {
    throw new Error(`El array nombreComidas debe tener exactamente ${comidasDiarias} elementos`);
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
    numeroComidas: comidasDiarias,
    requerimientosHidratacion: '',
    cumplimiento: false,
    comidas: Array.from({ length: comidasDiarias }, (_, comidaIndex) => ({
        horaEstimada: horasComidas[comidaIndex],
        nombreComida: nombreComidas[comidaIndex],
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
    asignadaA: [asignadaA],
    draftMode
  });

  await dieta.save();
  return dieta;
}

export async function obtenerDietaService(dietaId: string, userId: string) {
  if (!mongoose.Types.ObjectId.isValid(dietaId)) {
    throw new Error('ID de dieta inválido');
  }

  const dieta = await Dieta.findById(dietaId)
    .populate('creador', 'fullName email')
    .populate('asignadaA', 'fullName email');

  if (!dieta) {
    throw new Error('Dieta no encontrada');
  }

  console.log('Validando permisos para dieta:', {
    dietaId,
    userId,
    creador: dieta.creador?._id || dieta.creador,
    asignadaA: dieta.asignadaA?.map(u => u._id || u)
  });

  const esCreador = dieta.creador && 
    (dieta.creador._id?.toString() === userId || dieta.creador.toString() === userId);
  
  let esAsignado = false;
  if (dieta.asignadaA && Array.isArray(dieta.asignadaA)) {
    esAsignado = dieta.asignadaA.some(user => {
      const userId2Compare = user._id ? user._id.toString() : user.toString();
      return userId2Compare === userId;
    });
  }

  console.log('Resultados de verificación:', { esCreador, esAsignado });

  if (!esCreador && !esAsignado) {
    throw new Error('No tienes permisos para ver esta dieta');
  }

  return dieta;
}
export async function actualizarDietaService(
  dietaId: string, 
  userId: string, 
  datosActualizacion: {
    nombre?: string;
    descripcion?: string;
    tipo?: string[];
    duracion?: number;
    comidasDiarias?: number;
    fechaInicio?: string;
    dias?: Array<{
      _dayIndex?: number;
      caloriasTotales?: number;
      macronutrientes?: string;
      micronutrientes?: string;
      numeroComidas?: number;
      requerimientosHidratacion?: string;
      cumplimiento?: boolean;
      comidas?: Array<{
        horaEstimada?: string;
        nombreComida?: string;
      }>;
    }>;
    draftMode?: boolean;
  }
) {
  if (!mongoose.Types.ObjectId.isValid(dietaId)) {
    throw new Error('ID de dieta inv�lido');
  }

  const dieta = await Dieta.findById(dietaId);
  if (!dieta) {
    throw new Error('Dieta no encontrada');
  }

  if (dieta.creador.toString() !== userId) {
    throw new Error('No tienes permisos para actualizar esta dieta');
  }

  if (datosActualizacion.dias && Array.isArray(datosActualizacion.dias)) {
    for (const diaActualizado of datosActualizacion.dias) {
      if (typeof diaActualizado._dayIndex === 'number') {
        const index = diaActualizado._dayIndex;
        
        if (index >= 0 && index < dieta.dias.length) {
          const diaExistente = dieta.dias[index];
          
          if (typeof diaActualizado.caloriasTotales === 'number') 
            diaExistente.caloriasTotales = diaActualizado.caloriasTotales;
            
          if (typeof diaActualizado.macronutrientes === 'string')
            diaExistente.macronutrientes = diaActualizado.macronutrientes;
            
          if (typeof diaActualizado.micronutrientes === 'string')
            diaExistente.micronutrientes = diaActualizado.micronutrientes;
            
          if (typeof diaActualizado.numeroComidas === 'number')
            diaExistente.numeroComidas = diaActualizado.numeroComidas;
            
          if (typeof diaActualizado.requerimientosHidratacion === 'string')
            diaExistente.requerimientosHidratacion = diaActualizado.requerimientosHidratacion;
            
          if (typeof diaActualizado.cumplimiento === 'boolean')
            diaExistente.cumplimiento = diaActualizado.cumplimiento;
            
          if (diaActualizado.comidas && Array.isArray(diaActualizado.comidas)) {
            diaActualizado.comidas.forEach((comidaActualizada, comidaIndex) => {
              if (comidaIndex < diaExistente.comidas.length) {
                if (typeof comidaActualizada.horaEstimada === 'string') {
                  diaExistente.comidas[comidaIndex].horaEstimada = comidaActualizada.horaEstimada;
                }
                
                if (typeof comidaActualizada.nombreComida === 'string') {
                  diaExistente.comidas[comidaIndex].nombreComida = comidaActualizada.nombreComida;
                }
              }
            });
          }
        }
      }
    }
  }

  if (datosActualizacion.nombre) dieta.nombre = datosActualizacion.nombre;
  if (datosActualizacion.descripcion) dieta.descripcion = datosActualizacion.descripcion;
  if (datosActualizacion.tipo && Array.isArray(datosActualizacion.tipo)) dieta.tipo = datosActualizacion.tipo;
  if (typeof datosActualizacion.draftMode === 'boolean') dieta.draftMode = datosActualizacion.draftMode;

  await dieta.save();
  return dieta;
}

export async function actualizarDiaDietaService(
  dietaId: string,
  userId: string,
  diaIndex: number,
  datosDia: {
    caloriasTotales?: number;
    macronutrientes?: string;
    micronutrientes?: string;
    numeroComidas?: number;
    requerimientosHidratacion?: string;
    cumplimiento?: boolean;
    comidas?: Array<{
      horaEstimada?: string;
      nombreComida?: string;
    }>;
  }
) {
  if (!mongoose.Types.ObjectId.isValid(dietaId)) {
    throw new Error('ID de dieta inválido');
  }

  const dieta = await Dieta.findById(dietaId);
  if (!dieta) {
    throw new Error('Dieta no encontrada');
  }

  if (dieta.creador.toString() !== userId) {
    throw new Error('No tienes permisos para actualizar esta dieta');
  }

  if (diaIndex < 0 || diaIndex >= dieta.dias.length) {
    throw new Error('Índice de día inválido');
  }

  const diaExistente = dieta.dias[diaIndex];
  
  if (typeof datosDia.caloriasTotales === 'number') 
    diaExistente.caloriasTotales = datosDia.caloriasTotales;
    
  if (typeof datosDia.macronutrientes === 'string')
    diaExistente.macronutrientes = datosDia.macronutrientes;
    
  if (typeof datosDia.micronutrientes === 'string')
    diaExistente.micronutrientes = datosDia.micronutrientes;
    
  if (typeof datosDia.numeroComidas === 'number')
    diaExistente.numeroComidas = datosDia.numeroComidas;
    
  if (typeof datosDia.requerimientosHidratacion === 'string')
    diaExistente.requerimientosHidratacion = datosDia.requerimientosHidratacion;
    
  if (typeof datosDia.cumplimiento === 'boolean')
    diaExistente.cumplimiento = datosDia.cumplimiento;
  
  if (datosDia.comidas && Array.isArray(datosDia.comidas)) {
    datosDia.comidas.forEach((comidaActualizada, comidaIndex) => {
      if (comidaIndex < diaExistente.comidas.length) {
        if (typeof comidaActualizada.horaEstimada === 'string') {
          diaExistente.comidas[comidaIndex].horaEstimada = comidaActualizada.horaEstimada;
        }
        
        if (typeof comidaActualizada.nombreComida === 'string') {
          diaExistente.comidas[comidaIndex].nombreComida = comidaActualizada.nombreComida;
        }
      }
    });
  }

  await dieta.save();
  
  return diaExistente;
}
