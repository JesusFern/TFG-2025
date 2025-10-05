import SuscriptionPlan from '../../models/suscriptionPlans/suscriptionPlan';

function getBeneficios(tipoPlan: string): string[] {
  const beneficiosEspecificos: Record<string, string[]> = {
    'Nutricion': [
      'Asignación de un nutricionista personal',
      'Citas y videollamadas con el nutricionista',
      'Creación de dietas por parte del nutricionista',
      'Registro del seguimiento y progreso semanal',
      'Chat con nutricionista'
    ],
    'Entrenamiento personal': [
      'Asignación de un entrenador personal',
      'Citas y videollamadas con el entrenador personal',
      'Creación de planes de entrenamiento por parte del entrenador',
      'Registro del seguimiento y progreso semanal',
      'Chat con entrenador personal'
    ],
    'Nutrición y entrenamiento personal': [
      'Asignación de nutricionista y entrenador personal',
      'Citas y videollamadas con los profesionales',
      'Creación de dietas y planes de entrenamiento por parte de los profesionales',
      'Registro del seguimiento y progreso semanal',
      'Chat con nutricionista y entrenador personal'
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
