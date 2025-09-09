import mongoose from 'mongoose';
import SuscriptionPlan from '../../models/suscriptionPlans/suscriptionPlan';
import dotenv from 'dotenv';

dotenv.config();

export async function seedSuscriptionPlans() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
  await mongoose.connect(mongoUri);

  // Eliminar planes de suscripción existentes
  await SuscriptionPlan.deleteMany({});
  console.log('Colección de planes de suscripción borrada.');

  // Definir los tipos de precio y plan
  const tiposPrecio = ['Gratuito', 'Básico', 'Pro'];
  const tiposPlan = ['Nutricion', 'Entrenamiento personal', 'Nutrición y entrenamiento personal'];

  // Crear plan gratuito (con tipoPlan a null)
  const planGratuito = new SuscriptionPlan({
    nombre: 'Plan Gratuito',
    descripcion: 'Acceso básico gratuito a la plataforma',
    tipoPrecio: 'Gratuito',
    tipoPlan: null,
    precioMensual: 0,
    precioTrimestral: 0,
    precioAnual: 0
  });

  await planGratuito.save();
  console.log('Plan gratuito creado');

  // Crear combinaciones para planes de pago (Básico y Pro con todos los tipos de plan)
  for (let i = 1; i < tiposPrecio.length; i++) {
    const tipoPrecio = tiposPrecio[i];
    
    for (const tipoPlan of tiposPlan) {
      // Definir precios exactos según la combinación de tipoPrecio y tipoPlan
      let precioMensual = 0;
      
      if (tipoPrecio === 'Básico') {
        if (tipoPlan === 'Nutricion' || tipoPlan === 'Entrenamiento personal') {
          precioMensual = 24.99;
        } else if (tipoPlan === 'Nutrición y entrenamiento personal') {
          precioMensual = 39.99;
        }
      } else if (tipoPrecio === 'Pro') {
        if (tipoPlan === 'Nutricion' || tipoPlan === 'Entrenamiento personal') {
          precioMensual = 34.99;
        } else if (tipoPlan === 'Nutrición y entrenamiento personal') {
          precioMensual = 59.99;
        }
      }
      
      const precioTrimestral = Math.round(precioMensual * 2.7 * 100) / 100;
      const precioAnual = Math.round(precioMensual * 10 * 100) / 100;
      
      const plan = new SuscriptionPlan({
        nombre: `Plan ${tipoPrecio} - ${tipoPlan}`,
        descripcion: `Plan ${tipoPrecio} con servicios de ${tipoPlan.toLowerCase()}`,
        tipoPrecio,
        tipoPlan,
        precioMensual,
        precioTrimestral,
        precioAnual
      });
      
      await plan.save();
      console.log(`Plan ${tipoPrecio} - ${tipoPlan} creado`);
    }
  }

  console.log('Seeder de planes de suscripción completado');
  await mongoose.disconnect();
}
