import User from '../../models/users/user';
import UserTracking from '../../models/users/userTracking';

export async function seedUserTracking() {
  try {
    // Eliminar datos de seguimiento existentes
    await UserTracking.deleteMany({});
    console.log('Colección de user tracking borrada.');

    // Obtener user1
    const user1 = await User.findOne({ email: 'user1@example.com' });

    if (!user1) {
      console.log('⚠️ User1 no encontrado para crear datos de seguimiento');
      return;
    }

    // Datos de seguimiento progresivos para user1
    const trackingData = [
      {
        userId: user1._id,
        fechaSeguimiento: new Date('2025-09-01'),
        pesoCorporal: 95,
        porcentajeGrasaCorporal: 30,
        porcentajeMasaMuscular: 30,
        perimetroCintura: 105,
        perimetroCadera: 110,
        perimetroPecho: 108,
        perimetroBrazoIzquierdo: 36,
        perimetroBrazoDerecho: 36,
        perimetroMusloIzquierdo: 62,
        perimetroMusloDerecho: 62,
        archivosMultimedia: []
      },
      {
        userId: user1._id,
        fechaSeguimiento: new Date('2025-09-08'),
        pesoCorporal: 93.8,
        porcentajeGrasaCorporal: 28.8,
        porcentajeMasaMuscular: 30,
        perimetroCintura: 102,
        perimetroCadera: 109,
        perimetroPecho: 107,
        perimetroBrazoIzquierdo: 35.8,
        perimetroBrazoDerecho: 35.8,
        perimetroMusloIzquierdo: 61.5,
        perimetroMusloDerecho: 61.5,
        archivosMultimedia: []
      },
      {
        userId: user1._id,
        fechaSeguimiento: new Date('2025-09-15'),
        pesoCorporal: 92,
        porcentajeGrasaCorporal: 27,
        porcentajeMasaMuscular: 31,
        perimetroCintura: 100,
        perimetroCadera: 107,
        perimetroPecho: 105,
        perimetroBrazoIzquierdo: 35,
        perimetroBrazoDerecho: 35,
        perimetroMusloIzquierdo: 61,
        perimetroMusloDerecho: 61,
        archivosMultimedia: []
      },
      {
        userId: user1._id,
        fechaSeguimiento: new Date('2025-09-23'),
        pesoCorporal: 89,
        porcentajeGrasaCorporal: 25,
        porcentajeMasaMuscular: 32,
        perimetroCintura: 98,
        perimetroCadera: 105,
        perimetroPecho: 104,
        perimetroBrazoIzquierdo: 35,
        perimetroBrazoDerecho: 35,
        perimetroMusloIzquierdo: 60,
        perimetroMusloDerecho: 60,
        archivosMultimedia: []
      },
      {
        userId: user1._id,
        fechaSeguimiento: new Date('2025-09-30'),
        pesoCorporal: 88,
        porcentajeGrasaCorporal: 24,
        porcentajeMasaMuscular: 32,
        perimetroCintura: 97,
        perimetroCadera: 104,
        perimetroPecho: 103,
        perimetroBrazoIzquierdo: 35.5,
        perimetroBrazoDerecho: 35.5,
        perimetroMusloIzquierdo: 59,
        perimetroMusloDerecho: 59,
        archivosMultimedia: []
      }
    ];

    // Crear registros de seguimiento
    for (const data of trackingData) {
      const tracking = new UserTracking(data);
      await tracking.save();
    }

    console.log(`✅ ${trackingData.length} registros de seguimiento creados para User1`);
    console.log(`   Peso inicial: ${trackingData[0].pesoCorporal} kg`);
    console.log(`   Peso final: ${trackingData[trackingData.length - 1].pesoCorporal} kg`);
    console.log(`   Progreso: -${trackingData[0].pesoCorporal - trackingData[trackingData.length - 1].pesoCorporal} kg`);

  } catch (error) {
    console.error('Error al crear datos de seguimiento:', error);
    throw error;
  }
}

