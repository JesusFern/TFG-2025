import User from '../../models/users/user';
import SuscriptionPlan from '../../models/suscriptionPlans/suscriptionPlan';
import UserSuscription from '../../models/suscriptionPlans/userSuscription';

export async function seedUserSuscriptions() {
  try {
    // Eliminar suscripciones existentes
    await UserSuscription.deleteMany({});
    console.log('Colección de suscripciones de usuario borrada.');

    // Obtener user1
    const user1 = await User.findOne({ email: 'user1@example.com' });
    if (!user1) {
      console.log('⚠️ User1 no encontrado para asignar suscripción');
      return;
    }

    // Obtener el plan de "Nutrición y entrenamiento personal"
    const plan = await SuscriptionPlan.findOne({ 
      tipoPlan: 'Nutrición y entrenamiento personal' 
    });

    if (!plan) {
      console.log('⚠️ Plan de Nutrición y entrenamiento personal no encontrado');
      return;
    }

    // Crear suscripción para user1
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + 1); // 1 mes de suscripción

    const suscripcion = new UserSuscription({
      userId: user1._id,
      planId: plan._id,
      fechaInicio,
      fechaFin,
      frecuenciaDePago: 'Mensual',
      estadoPago: 'pagado', // Marcado como pagado para testing
      fechaProximoPago: fechaFin
    });

    await suscripcion.save();

    // Actualizar la referencia en el usuario
    await User.findByIdAndUpdate(user1._id, { suscripcion: suscripcion._id });

    console.log(`✅ Suscripción "${plan.nombre}" asignada a ${user1.fullName}`);
    console.log(`   Fecha inicio: ${fechaInicio.toISOString().split('T')[0]}`);
    console.log(`   Fecha fin: ${fechaFin.toISOString().split('T')[0]}`);
    console.log(`   Estado: ${suscripcion.estadoPago}`);

  } catch (error) {
    console.error('Error al crear suscripciones de usuario:', error);
    throw error;
  }
}

