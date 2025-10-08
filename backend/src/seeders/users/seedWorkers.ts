import User from '../../models/users/user';

export async function seedWorkers() {
  try {
    const workersData = [
      {
        fullName: 'Nutricionista 1',
        email: 'nutricionista1@example.com',
        password: 'Worker1',
        phoneNumber: '666111222',
        gender: 'Masculino',
        birthDate: new Date('1985-05-15'),
        role: 'worker',
        workerType: 'Nutricionista',
        biography: 'Nutricionista con más de 10 años de experiencia en nutrición deportiva y asesoramiento nutricional personalizado.',
        availability: 'Lunes a Viernes de 9:00 a 18:00',
        isWorkerAvailable: true
      },
      {
        fullName: 'Entrenador 1',
        email: 'entrenador1@example.com',
        password: 'Worker2',
        phoneNumber: '666333444',
        gender: 'Femenino',
        birthDate: new Date('1988-03-20'),
        role: 'worker',
        workerType: 'Entrenador personal',
        biography: 'Entrenadora personal especializada en pérdida de peso y tonificación muscular.',
        availability: 'Lunes a Sábado de 7:00 a 21:00',
        isWorkerAvailable: true
      },
      {
        fullName: 'Nutricionista y Entrenador',
        email: 'nutrientrenador@example.com',
        password: 'Worker3',
        phoneNumber: '666555666',
        gender: 'Masculino',
        birthDate: new Date('1990-08-10'),
        role: 'worker',
        workerType: 'Nutricionista y Entrenador personal',
        biography: 'Profesional dual con formación avanzada tanto en nutrición como en entrenamiento físico. Especializado en transformaciones físicas completas.',
        availability: 'Martes a Domingo de 8:00 a 20:00',
        isWorkerAvailable: true
      }
    ];

    for (const workerData of workersData) {
      const exists = await User.findOne({ email: workerData.email });
      if (exists) {
        console.log(`El trabajador ${workerData.fullName} ya existe.`);
        continue;
      }
      const worker = new User(workerData);
      await worker.save();
      console.log(`Trabajador ${workerData.fullName} creado`);
    }

    // Asignar clientes a trabajadores
    await asignarClientesATrabajadores();
  } catch (error) {
    console.error('Error al crear trabajadores:', error);
    throw error;  // Propagamos el error para manejo centralizado
  }
}

async function asignarClientesATrabajadores() {
  try {
    // Buscar el trabajador dual (Nutricionista y Entrenador)
    const nutriEntrenador = await User.findOne({ email: 'nutrientrenador@example.com' });
    if (!nutriEntrenador) {
      console.log('⚠️ Nutricionista y Entrenador no encontrado.');
      return;
    }

    // Buscar los usuarios clientes
    const user1 = await User.findOne({ email: 'user1@example.com' });
    const user2 = await User.findOne({ email: 'user2@example.com' });

    if (!user1 || !user2) {
      console.log('⚠️ No se encontraron los usuarios clientes.');
      return;
    }

    console.log('🔧 Asignando clientes al Nutricionista y Entrenador...');
    console.log('   Trabajador ID:', nutriEntrenador._id);
    console.log('   User1 ID:', user1._id);
    console.log('   User2 ID:', user2._id);

    // Asignar clientes al trabajador dual
    // User1 aparece DOS veces: una como Nutricionista y otra como Entrenador
    // User2 aparece UNA vez: solo como Nutricionista
    await User.updateOne(
      { _id: nutriEntrenador._id },
      { 
        $set: { 
          clientesAsignados: [
            // User1 - asignación como Nutricionista
            {
              clienteId: user1._id,
              tipoAsignacion: 'Nutricionista'
            },
            // User1 - asignación como Entrenador personal
            {
              clienteId: user1._id,
              tipoAsignacion: 'Entrenador personal'
            }
          ]
        }
      }
    );

    // Verificar la asignación
    const trabajadorActualizado = await User.findById(nutriEntrenador._id);
    console.log(`✅ Clientes asignados a ${nutriEntrenador.fullName}:`);
    console.log(`   - ${user1.fullName} (como Nutricionista)`);
    console.log(`   - ${user1.fullName} (como Entrenador personal)`);
    console.log(`   - ${user2.fullName} (como Nutricionista)`);
    console.log('   Total asignaciones:', trabajadorActualizado?.clientesAsignados?.length || 0);
    
  } catch (error) {
    console.error('Error al asignar clientes a trabajadores:', error);
    throw error;
  }
}
