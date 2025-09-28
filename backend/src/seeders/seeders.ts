import { seedAdminUser, seedUsers } from './users/seedUsers';
import { seedWorkers } from './users/seedWorkers';
import { seedSuscriptionPlans } from './suscriptionPlans/seedSuscriptionPlans';
import { seedIngredientes } from './diets/seedIngredientes';
import { seedRecetas } from './diets/seedRecetas';
import { seedEjercicios } from './training/seedEjercicios';
import mongoose from 'mongoose';
import User from '../models/users/user';
import dotenv from 'dotenv';

dotenv.config();

// Establecer variables de entorno para el proceso de seeding
process.env.SKIP_VALIDATIONS = 'true';

async function runSeed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
    await mongoose.connect(mongoUri);
    console.log('Conectado a MongoDB');

    await User.deleteMany({});
    console.log('Colección de usuarios borrada.');

    // Crear usuarios en orden: admin, usuarios regulares, trabajadores
    await seedAdminUser();
    await seedUsers();
    await seedWorkers();

    // Crear planes de suscripción
    await seedSuscriptionPlans();

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