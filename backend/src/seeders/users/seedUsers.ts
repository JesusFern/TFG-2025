import mongoose from 'mongoose';
import User from '../../models/users/user';
import dotenv from 'dotenv';

dotenv.config();

export async function seedAdminUser() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';

  await mongoose.connect(mongoUri);

  const admin = new User({
    fullName: 'Administrador Principal',
    email: 'admin@example.com',
    password: 'Admin123',
    phoneNumber: '123456789',
    role: 'admin'
  });

  await admin.save();
  console.log('Usuario admin creado');
  await mongoose.disconnect();
}

export async function seedUsers() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
  await mongoose.connect(mongoUri);

  const usersData = [
    {
      fullName: 'User1',
      email: 'user1@example.com',
      password: 'User1',
      phoneNumber: '111111111',
      gender: 'Masculino',
      birthDate: new Date('2000-01-01'),
      role: 'user'
    },
    {
      fullName: 'User2',
      email: 'user2@example.com',
      password: 'User2',
      phoneNumber: '222222222',
      gender: 'Femenino',
      birthDate: new Date('2001-02-02'),
      role: 'user'
    }
  ];

  for (const userData of usersData) {
    const exists = await User.findOne({ email: userData.email, role: 'user' });
    if (exists) {
      console.log(`El usuario ${userData.fullName} ya existe.`);
      continue;
    }
    const user = new User({ ...userData });
    await user.save();
    console.log(`Usuario ${userData.fullName} creado`);
  }

  await mongoose.disconnect();
}