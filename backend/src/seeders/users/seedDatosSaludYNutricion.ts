import User from '../../models/users/user';
import DatosSaludYNutricion from '../../models/users/datosSaludYNutricion';

export async function seedDatosSaludYNutricion() {
  try {
    // Eliminar datos existentes
    await DatosSaludYNutricion.deleteMany({});
    console.log('Colección de datos de salud y nutrición borrada.');

    // Obtener usuarios
    const user1 = await User.findOne({ email: 'user1@example.com' });
    const user2 = await User.findOne({ email: 'user2@example.com' });

    if (!user1 || !user2) {
      console.log('⚠️ No se encontraron los usuarios para crear datos de salud');
      return;
    }

    // Datos de salud para User1
    const datosSaludUser1 = new DatosSaludYNutricion({
      userId: user1._id,
      altura: 175, // cm
      pesoActual: 80, // kg
      objetivoPeso: 75, // kg
      condicionesMedicas: ['Ninguna'],
      restriccionesDieteticas: ['Sin gluten'],
      alergiasIntolerancias: ['Lactosa'],
      medicacionActual: [],
      preferenciasAlimentarias: ['Mediterránea', 'Alta en proteínas'],
      horariosComidas: [
        { comida: 'Desayuno', hora: '08:00' },
        { comida: 'Media mañana', hora: '11:00' },
        { comida: 'Almuerzo', hora: '14:00' },
        { comida: 'Merienda', hora: '17:00' },
        { comida: 'Cena', hora: '21:00' }
      ]
    });

    await datosSaludUser1.save();
    
    // Actualizar referencia en User1
    await User.findByIdAndUpdate(user1._id, { 
      datosSaludYNutricion: datosSaludUser1._id 
    });
    console.log('✅ Datos de salud y nutrición creados para User1');

    // Datos de salud para User2
    const datosSaludUser2 = new DatosSaludYNutricion({
      userId: user2._id,
      altura: 165, // cm
      pesoActual: 65, // kg
      objetivoPeso: 60, // kg
      condicionesMedicas: [],
      restriccionesDieteticas: ['Vegetariana'],
      alergiasIntolerancias: ['Frutos secos'],
      medicacionActual: [],
      preferenciasAlimentarias: ['Vegetariana', 'Baja en grasas'],
      horariosComidas: [
        { comida: 'Desayuno', hora: '07:30' },
        { comida: 'Media mañana', hora: '10:30' },
        { comida: 'Almuerzo', hora: '13:30' },
        { comida: 'Merienda', hora: '17:30' },
        { comida: 'Cena', hora: '20:30' }
      ]
    });

    await datosSaludUser2.save();
    
    // Actualizar referencia en User2
    await User.findByIdAndUpdate(user2._id, { 
      datosSaludYNutricion: datosSaludUser2._id 
    });
    console.log('✅ Datos de salud y nutrición creados para User2');

  } catch (error) {
    console.error('Error al crear datos de salud y nutrición:', error);
    throw error;
  }
}

