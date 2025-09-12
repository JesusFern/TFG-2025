import mongoose from 'mongoose';
import SuscriptionPlan from '../../models/suscriptionPlans/suscriptionPlan';
import dotenv from 'dotenv';

dotenv.config();

function getBeneficios(tipoPlan: string, tipoPrecio: string): string[] {
  const baseBeneficios = tipoPrecio === 'Básico' 
    ? ['Todas las funciones gratuitas'] 
    : ['Todas las funciones del plan básico'];

  const beneficiosEspecificos: Record<string, Record<string, string[]>> = {
    'Nutricion': {
      'Básico': [
        'Plan nutricional personalizado',
        'Seguimiento de macronutrientes',
        'Recetas saludables',
        'Soporte por correo electrónico'
      ],
      'Pro': [
        'Plan nutricional personalizado avanzado',
        'Ajustes semanales de la dieta',
        'Videoconferencias con nutricionista',
        'Acceso a dietas especializadas',
        'Soporte prioritario 24/7'
      ]
    },
    'Entrenamiento personal': {
      'Básico': [
        'Plan de entrenamiento personalizado',
        'Seguimiento de progreso',
        'Videos de ejercicios',
        'Soporte por correo electrónico'
      ],
      'Pro': [
        'Plan de entrenamiento avanzado',
        'Ajustes semanales del entrenamiento',
        'Videoconferencias con entrenador personal',
        'Acceso a rutinas especializadas',
        'Soporte prioritario 24/7'
      ]
    },
    'Nutrición y entrenamiento personal': {
      'Básico': [
        'Plan nutricional personalizado',
        'Plan de entrenamiento personalizado',
        'Seguimiento de macronutrientes',
        'Seguimiento de progreso',
        'Recetas saludables',
        'Videos de ejercicios',
        'Soporte por correo electrónico'
      ],
      'Pro': [
        'Plan nutricional personalizado avanzado',
        'Plan de entrenamiento avanzado',
        'Ajustes semanales de dieta y entrenamiento',
        'Videoconferencias con nutricionista y entrenador',
        'Acceso a dietas y rutinas especializadas',
        'Soporte prioritario 24/7',
        'Análisis de composición corporal'
      ]
    }
  };

  return [...baseBeneficios, ...(beneficiosEspecificos[tipoPlan]?.[tipoPrecio] || [])];
}

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
    precioAnual: 0,
    beneficios: [
      'Acceso a la plataforma básica',
      'Calculadora de calorías',
      'Seguimiento de peso',
      'Artículos y consejos gratuitos',
      'Comunidad de usuarios'
    ]
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
      
      const beneficios = getBeneficios(tipoPlan, tipoPrecio);
      
      const plan = new SuscriptionPlan({
        nombre: `Plan ${tipoPrecio} - ${tipoPlan}`,
        descripcion: `Plan ${tipoPrecio} con servicios de ${tipoPlan.toLowerCase()}`,
        tipoPrecio,
        tipoPlan,
        precioMensual,
        precioTrimestral,
        precioAnual,
        beneficios
      });
      
      await plan.save();
      console.log(`Plan ${tipoPrecio} - ${tipoPlan} creado`);
    }
  }

  console.log('Seeder de planes de suscripción completado');
  await mongoose.disconnect();
}
