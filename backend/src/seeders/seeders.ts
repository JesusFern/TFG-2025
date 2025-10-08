import { seedAdminUser, seedUsers } from './users/seedUsers';
import { seedWorkers } from './users/seedWorkers';
import { seedDatosSaludYNutricion } from './users/seedDatosSaludYNutricion';
import { seedDatosActividadFisica } from './users/seedDatosActividadFisica';
import { seedUserSuscriptions } from './users/seedUserSuscriptions';
import { seedUserTracking } from './users/seedUserTracking';
import { seedSuscriptionPlans } from './suscriptionPlans/seedSuscriptionPlans';
import { seedIngredientes } from './diets/seedIngredientes';
import { seedRecetas } from './diets/seedRecetas';
import { seedEjercicios } from './training/seedEjercicios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Establecer variables de entorno para el proceso de seeding
process.env.SKIP_VALIDATIONS = 'true';

async function runSeed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
    await mongoose.connect(mongoUri);
    console.log('Conectado a MongoDB');

    // ===== ELIMINAR TODAS LAS COLECCIONES =====
    console.log('🧹 Limpiando todas las colecciones...');
    
    if (!mongoose.connection.db) {
      throw new Error('Base de datos no disponible');
    }
    
    const collections = await mongoose.connection.db.collections();
    let totalEliminados = 0;
    
    for (const collection of collections) {
      const result = await collection.deleteMany({});
      totalEliminados += result.deletedCount || 0;
      console.log(`   ✓ ${collection.collectionName}: ${result.deletedCount || 0} documentos eliminados`);
    }
    
    console.log(`🗑️ Total de documentos eliminados: ${totalEliminados}`);
    console.log('✅ Todas las colecciones han sido limpiadas\n');

    // Crear usuarios en orden: admin, usuarios regulares, trabajadores
    await seedAdminUser();
    await seedUsers();
    await seedWorkers();

    // Crear planes de suscripción
    await seedSuscriptionPlans();

    // Crear datos de salud y nutrición para usuarios
    await seedDatosSaludYNutricion();

    // Crear datos de actividad física para usuarios
    await seedDatosActividadFisica();

    // Asignar suscripciones a usuarios
    await seedUserSuscriptions();

    // Crear registros de seguimiento para usuarios
    await seedUserTracking();

    // Cargar ingredientes (requiere JSON generado previamente)
    await seedIngredientes();

    // Crear recetas reusables
    await seedRecetas();

    // Crear ejercicios de entrenamiento
    await seedEjercicios();

    console.log('Seed finalizado exitosamente');
  } catch (error) {
    console.error('Error en el seed:', error);
    process.exit(1);
  } finally {
    // Asegurar que la conexión se cierre siempre
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Desconectado de MongoDB');
    }
  }
}

runSeed().catch((err) => {
  console.error('Error general en el seed:', err);
  process.exit(1);
});