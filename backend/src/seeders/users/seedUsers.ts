import User from '../../models/users/user';

export async function seedAdminUser() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('El usuario admin ya existe.');
      return;
    }
    
    const admin = new User({
      fullName: 'Administrador Principal',
      email: 'admin@example.com',
      password: 'Admin123',
      phoneNumber: '123456789',
      role: 'admin'
    });

    await admin.save();
    console.log('Usuario admin creado');
  } catch (error) {
    console.error('Error al crear admin:', error);
    throw error;  // Propagamos el error para manejo centralizado
  }
}

export async function seedUsers() {
  try {
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
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`El usuario ${userData.fullName} ya existe.`);
        continue;
      }
      const user = new User(userData);
      await user.save();
      console.log(`Usuario ${userData.fullName} creado`);
    }
  } catch (error) {
    console.error('Error al crear usuarios:', error);
    throw error;  // Propagamos el error para manejo centralizado
  }
}