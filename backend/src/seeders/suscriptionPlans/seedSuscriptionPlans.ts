import SuscriptionPlan from '../../models/suscriptionPlans/suscriptionPlan';

function getBeneficios(tipoPlan: string): string[] {
  const beneficiosEspecificos: Record<string, string[]> = {
    'Nutricion': [
      'Plan nutricional personalizado avanzado',
      'Ajustes semanales de la dieta',
      'Videoconferencias con nutricionista',
      'Acceso a dietas especializadas',
      'Soporte prioritario 24/7'
    ],
    'Entrenamiento personal': [
      'Plan de entrenamiento avanzado',
      'Ajustes semanales del entrenamiento',
      'Videoconferencias con entrenador personal',
      'Acceso a rutinas especializadas',
      'Soporte prioritario 24/7'
    ],
    'Nutrición y entrenamiento personal': [
      'Plan nutricional personalizado avanzado',
      'Plan de entrenamiento avanzado',
      'Ajustes semanales de dieta y entrenamiento',
      'Videoconferencias con nutricionista y entrenador',
      'Acceso a dietas y rutinas especializadas',
      'Soporte prioritario 24/7',
      'Análisis de composición corporal'
    ]
  };

  return beneficiosEspecificos[tipoPlan] || [];
}

export async function seedSuscriptionPlans() {
  // No conectar aquí, usar la conexión del seeder principal

  // Eliminar planes de suscripción existentes
  await SuscriptionPlan.deleteMany({});
  console.log('Colección de planes de suscripción borrada.');

  // Definir los tipos de plan
  const tiposPlan = ['Nutricion', 'Entrenamiento personal', 'Nutrición y entrenamiento personal'];

  // Crear solo planes Pro para todos los tipos de plan
  for (const tipoPlan of tiposPlan) {
    // Definir precios exactos según el tipo de plan
    let precioMensual = 0;
    
    if (tipoPlan === 'Nutricion' || tipoPlan === 'Entrenamiento personal') {
      precioMensual = 34.99;
    } else if (tipoPlan === 'Nutrición y entrenamiento personal') {
      precioMensual = 59.99;
    }
    
    const precioTrimestral = Math.round(precioMensual * 2.7 * 100) / 100;
    const precioAnual = Math.round(precioMensual * 10 * 100) / 100;
    
    const beneficios = getBeneficios(tipoPlan);
    
    const plan = new SuscriptionPlan({
      nombre: `Plan Pro - ${tipoPlan}`,
      descripcion: `Plan Pro con servicios de ${tipoPlan.toLowerCase()}`,
      tipoPrecio: 'Pro',
      tipoPlan,
      precioMensual,
      precioTrimestral,
      precioAnual,
      beneficios
    });
    
    await plan.save();
    console.log(`Plan Pro - ${tipoPlan} creado`);
  }

  console.log('Seeder de planes de suscripción completado');
  // No desconectar aquí, lo hace el seeder principal
}
