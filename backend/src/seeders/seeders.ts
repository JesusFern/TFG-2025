import { seedAdminUser, seedUsers } from './users/seedUsers';
import { seedSuscriptionPlans } from './suscriptionPlans/seedSuscriptionPlans';
import mongoose from 'mongoose';
import User from '../models/users/user';
import dotenv from 'dotenv';

dotenv.config();

async function runSeed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
  await mongoose.connect(mongoUri);

  await User.deleteMany({});
  console.log('Colección de usuarios borrada.');

  await seedAdminUser();

  await seedUsers();

  await seedSuscriptionPlans();

  await mongoose.disconnect();
  console.log('Seed finalizado');
}

runSeed().catch((err) => {
  console.error('Error en el seed:', err);
  process.exit(1);
});