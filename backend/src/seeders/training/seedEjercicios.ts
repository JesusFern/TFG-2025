import Ejercicio from '../../models/training/ejercicio';
import mongoose from 'mongoose';

export async function seedEjercicios() {
  try {
    console.log('Iniciando seed de ejercicios...');

    // Verificar conexión
    if (mongoose.connection.readyState !== 1) {
      console.log('Reconectando a MongoDB...');
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
      await mongoose.connect(mongoUri);
    }

    // Limpiar ejercicios existentes
    await Ejercicio.deleteMany({});
    console.log('Ejercicios existentes eliminados.');

    const ejercicios = [
      // === PECHO ===
      {
        nombre: 'Press de banca',
        slug: 'press-de-banca',
        descripcion: 'Ejercicio básico para desarrollo del pecho con barra',
        grupoMuscular: 'Pecho',
        equipamiento: 'Barra',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Acuéstate en banco, agarra la barra con las manos separadas al ancho de los hombros, baja controladamente y empuja hacia arriba',
        videoDemostrativo: 'https://wger.de/media/exercise-video/73/2bdb390c-312c-4497-a722-5eed2c823e5a.MOV',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Flexiones',
        slug: 'flexiones',
        descripcion: 'Ejercicio de peso corporal para pecho',
        grupoMuscular: 'Pecho',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Posición de plancha, manos separadas al ancho de los hombros, baja el pecho al suelo y empuja hacia arriba',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Press inclinado con mancuernas',
        slug: 'press-inclinado-mancuernas',
        descripcion: 'Press de pecho en banco inclinado con mancuernas',
        grupoMuscular: 'Pecho',
        equipamiento: 'Mancuernas',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Acuéstate en banco inclinado 30-45°, agarra mancuernas y presiona hacia arriba',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Aperturas con mancuernas',
        slug: 'aperturas-mancuernas',
        descripcion: 'Ejercicio de aislamiento para pecho con mancuernas',
        grupoMuscular: 'Pecho',
        equipamiento: 'Mancuernas',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Acuéstate en banco, extiende brazos con mancuernas y abre en arco hasta sentir estiramiento',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === ESPALDA ===
      {
        nombre: 'Dominadas',
        slug: 'dominadas',
        descripcion: 'Ejercicio de peso corporal para espalda',
        grupoMuscular: 'Espalda',
        equipamiento: 'Barra de dominadas',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Cuelga de la barra, manos separadas al ancho de los hombros, tira hacia arriba hasta que el mentón pase la barra',
        videoDemostrativo: 'https://wger.de/media/exercise-video/475/83067ffe-ccb9-4e22-8507-5131b211ce74.MOV',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Remo con barra',
        slug: 'remo-barra',
        descripcion: 'Ejercicio de remo con barra para espalda',
        grupoMuscular: 'Espalda',
        equipamiento: 'Barra',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Inclinado 45°, agarra la barra y tira hacia el abdomen, apretando los omóplatos',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Peso muerto',
        slug: 'peso-muerto',
        descripcion: 'Ejercicio fundamental para espalda y cadena posterior',
        grupoMuscular: 'Espalda',
        equipamiento: 'Barra',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Pies separados al ancho de los hombros, agarra la barra y levántala manteniendo la espalda recta',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Pull-ups',
        slug: 'pull-ups',
        descripcion: 'Dominadas con agarre supino',
        grupoMuscular: 'Espalda',
        equipamiento: 'Barra de dominadas',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Agarre supino, manos separadas al ancho de los hombros, tira hacia arriba',
        videoDemostrativo: 'https://wger.de/media/exercise-video/475/83067ffe-ccb9-4e22-8507-5131b211ce74.MOV',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === HOMBROS ===
      {
        nombre: 'Press militar',
        slug: 'press-militar',
        descripcion: 'Press de hombros con barra de pie',
        grupoMuscular: 'Hombros',
        equipamiento: 'Barra',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'De pie, agarra la barra al ancho de los hombros y presiona hacia arriba',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Elevaciones laterales',
        slug: 'elevaciones-laterales',
        descripcion: 'Ejercicio de aislamiento para deltoides laterales',
        grupoMuscular: 'Hombros',
        equipamiento: 'Mancuernas',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'De pie, eleva mancuernas lateralmente hasta la altura de los hombros',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Elevaciones frontales',
        slug: 'elevaciones-frontales',
        descripcion: 'Ejercicio de aislamiento para deltoides frontales',
        grupoMuscular: 'Hombros',
        equipamiento: 'Mancuernas',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'De pie, eleva mancuernas frontalmente hasta la altura de los hombros',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Face pulls',
        slug: 'face-pulls',
        descripcion: 'Ejercicio para deltoides posteriores y trapecio',
        grupoMuscular: 'Hombros',
        equipamiento: 'Cable',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Con cable, tira hacia la cara separando las manos',
        videoDemostrativo: 'https://wger.de/media/exercise-video/222/245a824b-cd39-45f2-b251-2c0b7efead0d.MOV',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === PIERNAS ===
      {
        nombre: 'Sentadilla',
        slug: 'sentadilla',
        descripcion: 'Ejercicio fundamental para piernas',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Pies separados al ancho de los hombros, baja como si te sentaras en una silla',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Sentadilla con barra',
        slug: 'sentadilla-barra',
        descripcion: 'Sentadilla con barra en la espalda',
        grupoMuscular: 'Piernas',
        equipamiento: 'Barra',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Barra en la espalda, baja hasta que los muslos estén paralelos al suelo',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Zancadas',
        slug: 'zancadas',
        descripcion: 'Ejercicio unilateral para piernas',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Da un paso largo hacia adelante y baja la rodilla trasera al suelo',
        videoDemostrativo: 'https://wger.de/media/exercise-video/802/85d1d7f8-c3c5-47e8-9b26-56896919e6e7.MOV',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Peso muerto rumano',
        slug: 'peso-muerto-rumano',
        descripcion: 'Variación del peso muerto enfocada en isquiotibiales',
        grupoMuscular: 'Piernas',
        equipamiento: 'Barra',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Barra en las manos, mantén las piernas casi rectas y baja la barra hacia los pies',
        videoDemostrativo: 'https://wger.de/media/exercise-video/507/307e7276-a14d-4ea0-b579-f5b0dbc6f5af.MOV',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Bulgarian split squats',
        slug: 'bulgarian-split-squats',
        descripcion: 'Sentadilla búlgara con pie trasero elevado',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Pie trasero en banco, baja la rodilla delantera hacia el suelo',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === BRAZOS ===
      {
        nombre: 'Curl de bíceps',
        slug: 'curl-biceps',
        descripcion: 'Ejercicio de aislamiento para bíceps',
        grupoMuscular: 'Brazos',
        equipamiento: 'Mancuernas',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'De pie, flexiona los brazos llevando las mancuernas hacia los hombros',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Tríceps en banco',
        slug: 'triceps-banco',
        descripcion: 'Fondos en banco para tríceps',
        grupoMuscular: 'Brazos',
        equipamiento: 'Banco',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Apoya las manos en el banco, baja el cuerpo flexionando los codos',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Curl martillo',
        slug: 'curl-martillo',
        descripcion: 'Curl de bíceps con agarre neutro',
        grupoMuscular: 'Brazos',
        equipamiento: 'Mancuernas',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Agarre neutro, flexiona los brazos manteniendo las muñecas rectas',
        videoDemostrativo: 'https://wger.de/media/exercise-video/272/df069052-2173-4f24-855f-a0eebe729f24.MOV',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Extensiones de tríceps',
        slug: 'extensiones-triceps',
        descripcion: 'Extensiones de tríceps con mancuerna',
        grupoMuscular: 'Brazos',
        equipamiento: 'Mancuernas',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Mancuerna sobre la cabeza, extiende los brazos hacia arriba',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === CORE ===
      {
        nombre: 'Plancha',
        slug: 'plancha',
        descripcion: 'Ejercicio isométrico para core',
        grupoMuscular: 'Core',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Posición de flexión, mantén el cuerpo recto y rígido',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Crunches',
        slug: 'crunches',
        descripcion: 'Abdominales básicos',
        grupoMuscular: 'Core',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Acostado, flexiona el tronco llevando los hombros hacia las rodillas',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Mountain climbers',
        slug: 'mountain-climbers',
        descripcion: 'Ejercicio dinámico para core y cardio',
        grupoMuscular: 'Core',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Cardio',
        instrucciones: 'Posición de plancha, alterna llevando las rodillas al pecho',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Russian twists',
        slug: 'russian-twists',
        descripcion: 'Rotaciones de tronco para core',
        grupoMuscular: 'Core',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Sentado, inclínate hacia atrás y rota el tronco de lado a lado',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === CARDIO/HIIT ===
      {
        nombre: 'Burpees',
        slug: 'burpees',
        descripcion: 'Ejercicio completo de cardio y fuerza',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Cardio',
        instrucciones: 'Flexión, salto a sentadilla, salto vertical con brazos arriba',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Jumping jacks',
        slug: 'jumping-jacks',
        descripcion: 'Ejercicio de cardio básico',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Cardio',
        instrucciones: 'Salta separando piernas y brazos, luego vuelve a juntarlos',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'High knees',
        slug: 'high-knees',
        descripcion: 'Carrera en el lugar elevando rodillas',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Cardio',
        instrucciones: 'Corre en el lugar elevando las rodillas al pecho',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Jump squats',
        slug: 'jump-squats',
        descripcion: 'Sentadillas con salto',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Cardio',
        instrucciones: 'Haz una sentadilla y salta explosivamente hacia arriba',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === FLEXIBILIDAD/MOVILIDAD ===
      {
        nombre: 'Estiramiento de isquiotibiales',
        slug: 'estiramiento-isquiotibiales',
        descripcion: 'Estiramiento estático para isquiotibiales',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Flexibilidad',
        instrucciones: 'Sentado, extiende una pierna y estírate hacia el pie',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Estiramiento de pecho',
        slug: 'estiramiento-pecho',
        descripcion: 'Estiramiento para músculos del pecho',
        grupoMuscular: 'Pecho',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Flexibilidad',
        instrucciones: 'Coloca el brazo en la pared y gira el cuerpo para estirar el pecho',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Estiramiento de espalda',
        slug: 'estiramiento-espalda',
        descripcion: 'Estiramiento para músculos de la espalda',
        grupoMuscular: 'Espalda',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Flexibilidad',
        instrucciones: 'Sentado, cruza una pierna y gira el tronco hacia el lado opuesto',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === FUNCIONALES ===
      {
        nombre: 'Kettlebell swings',
        slug: 'kettlebell-swings',
        descripcion: 'Balanceo con kettlebell para cadera y core',
        grupoMuscular: 'Piernas',
        equipamiento: 'Kettlebell',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Con kettlebell, balancea desde entre las piernas hasta la altura del pecho',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Turkish get-ups',
        slug: 'turkish-get-ups',
        descripcion: 'Levantamiento turco con kettlebell',
        grupoMuscular: 'Core',
        equipamiento: 'Kettlebell',
        nivelDificultad: 'Avanzado',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Acostado, levanta la kettlebell y ponte de pie manteniéndola arriba',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Farmer walks',
        slug: 'farmer-walks',
        descripcion: 'Caminata con peso para fuerza funcional',
        grupoMuscular: 'Core',
        equipamiento: 'Mancuernas',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Camina sosteniendo mancuernas pesadas a los lados',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === RESISTENCIA ===
      {
        nombre: 'Push-ups isométricos',
        slug: 'push-ups-isometricos',
        descripcion: 'Flexiones manteniendo la posición',
        grupoMuscular: 'Pecho',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Mantén la posición de flexión durante el tiempo especificado',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Wall sits',
        slug: 'wall-sits',
        descripcion: 'Sentadilla isométrica contra la pared',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Apoya la espalda en la pared y mantén la posición de sentadilla',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Plank to push-up',
        slug: 'plank-to-push-up',
        descripcion: 'Transición de plancha a flexión',
        grupoMuscular: 'Core',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Desde plancha, alterna apoyando un brazo y luego el otro',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === EQUILIBRIO/ESTABILIDAD ===
      {
        nombre: 'Single leg deadlifts',
        slug: 'single-leg-deadlifts',
        descripcion: 'Peso muerto a una pierna para equilibrio',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'De pie, levanta una pierna y baja el tronco manteniendo el equilibrio',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Pistol squats',
        slug: 'pistol-squats',
        descripcion: 'Sentadilla a una pierna',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Avanzado',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'De pie, extiende una pierna y baja en sentadilla con la otra',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'L-sits',
        slug: 'l-sits',
        descripcion: 'Sentadilla en L para core y brazos',
        grupoMuscular: 'Core',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Avanzado',
        tipoEjercicio: 'Fuerza',
        instrucciones: 'Sentado, levanta las piernas y mantén la posición en L',
        arquetipo: true,
        publico: true,
        activo: true
      },

      // === CALENTAMIENTO ===
      {
        nombre: 'Arm circles',
        slug: 'arm-circles',
        descripcion: 'Círculos con los brazos para calentamiento',
        grupoMuscular: 'Hombros',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Flexibilidad',
        instrucciones: 'Extiende los brazos y haz círculos hacia adelante y atrás',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Leg swings',
        slug: 'leg-swings',
        descripcion: 'Balanceos de piernas para calentamiento',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Flexibilidad',
        instrucciones: 'De pie, balancea una pierna hacia adelante y atrás',
        arquetipo: true,
        publico: true,
        activo: true
      },
      {
        nombre: 'Hip circles',
        slug: 'hip-circles',
        descripcion: 'Círculos de cadera para calentamiento',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Flexibilidad',
        instrucciones: 'Manos en la cintura, haz círculos con la cadera',
        arquetipo: true,
        publico: true,
        activo: true
      }
    ];

    // Crear ejercicios
    const ejerciciosCreados = await Ejercicio.insertMany(ejercicios);
    console.log(`${ejerciciosCreados.length} ejercicios creados exitosamente.`);

    return ejerciciosCreados;
  } catch (error) {
    console.error('Error en seed de ejercicios:', error);
    throw error;
  }
}