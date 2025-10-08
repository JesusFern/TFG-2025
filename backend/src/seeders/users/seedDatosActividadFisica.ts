import User from '../../models/users/user';
import DatosActividadFisica from '../../models/users/datosActividadFisica';

export async function seedDatosActividadFisica() {
  try {
    // Eliminar datos existentes
    await DatosActividadFisica.deleteMany({});
    console.log('Colección de datos de actividad física borrada.');

    // Obtener usuarios
    const user1 = await User.findOne({ email: 'user1@example.com' });
    const user2 = await User.findOne({ email: 'user2@example.com' });

    if (!user1 || !user2) {
      console.log('⚠️ No se encontraron los usuarios para crear datos de actividad física');
      return;
    }

    // Datos de actividad física para User1
    const datosActividadUser1 = new DatosActividadFisica({
      userId: user1._id,
      frecuenciaEjercicio: 'Regular',
      tipoEjercicioPractica: ['Musculación', 'Running', 'Natación'],
      objetivosPrincipales: ['Ganancia muscular', 'Resistencia'],
      preferenciasEjercicios: ['Ejercicios con peso libre', 'Entrenamientos HIIT'],
      limitacionesFisicas: []
    });

    await datosActividadUser1.save();
    
    // Actualizar referencia en User1
    await User.findByIdAndUpdate(user1._id, { 
      datosActividadFisica: datosActividadUser1._id 
    });
    console.log('✅ Datos de actividad física creados para User1');

    // Datos de actividad física para User2
    const datosActividadUser2 = new DatosActividadFisica({
      userId: user2._id,
      frecuenciaEjercicio: 'Ocasional',
      tipoEjercicioPractica: ['Yoga/Pilates', 'Running', 'Ciclismo'],
      objetivosPrincipales: ['Pérdida de peso', 'Flexibilidad', 'Salud general'],
      preferenciasEjercicios: ['Yoga matutino', 'Ejercicios de bajo impacto'],
      limitacionesFisicas: ['Problemas leves de rodilla']
    });

    await datosActividadUser2.save();
    
    // Actualizar referencia en User2
    await User.findByIdAndUpdate(user2._id, { 
      datosActividadFisica: datosActividadUser2._id 
    });
    console.log('✅ Datos de actividad física creados para User2');

  } catch (error) {
    console.error('Error al crear datos de actividad física:', error);
    throw error;
  }
}

