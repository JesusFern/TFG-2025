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

    // Propiedades por defecto para todos los ejercicios
    const propiedadesPorDefecto = {
      arquetipo: true,
      publico: true,
      activo: true
    };

    // Helper function para crear ejercicios de manera más concisa
    const crearEjercicio = (
      nombre: string,
      slug: string,
      descripcion: string,
      grupoMuscular: string,
      equipamiento: string,
      nivelDificultad: string,
      tipoEjercicio: string,
      instrucciones: string,
      videoDemostrativo?: string
    ) => ({
      ...propiedadesPorDefecto,
      nombre,
      slug,
      descripcion,
      grupoMuscular,
      equipamiento,
      nivelDificultad,
      tipoEjercicio,
      instrucciones,
      ...(videoDemostrativo && { videoDemostrativo })
    });

    // Datos de ejercicios en formato tabular para evitar duplicación
    const ejerciciosData = [
      ['Press de banca', 'press-de-banca', 'Ejercicio básico para desarrollo del pecho con barra', 'Pecho', 'Barra', 'Intermedio', 'Fuerza', 'Acuéstate en banco, agarra la barra con las manos separadas al ancho de los hombros, baja controladamente y empuja hacia arriba', 'https://wger.de/media/exercise-video/73/2bdb390c-312c-4497-a722-5eed2c823e5a.MOV'],
      ['Flexiones', 'flexiones', 'Ejercicio de peso corporal para pecho', 'Pecho', 'Peso corporal', 'Principiante', 'Fuerza', 'Posición de plancha, manos separadas al ancho de los hombros, baja el pecho al suelo y empuja hacia arriba', null],
      ['Press inclinado con mancuernas', 'press-inclinado-mancuernas', 'Press de pecho en banco inclinado con mancuernas', 'Pecho', 'Mancuernas', 'Intermedio', 'Fuerza', 'Acuéstate en banco inclinado 30-45°, agarra mancuernas y presiona hacia arriba', null],
      ['Aperturas con mancuernas', 'aperturas-mancuernas', 'Ejercicio de aislamiento para pecho con mancuernas', 'Pecho', 'Mancuernas', 'Intermedio', 'Fuerza', 'Acuéstate en banco, extiende brazos con mancuernas y abre en arco hasta sentir estiramiento', null],
      ['Dominadas', 'dominadas', 'Ejercicio de peso corporal para espalda', 'Espalda', 'Barra de dominadas', 'Intermedio', 'Fuerza', 'Cuelga de la barra, manos separadas al ancho de los hombros, tira hacia arriba hasta que el mentón pase la barra', 'https://wger.de/media/exercise-video/475/83067ffe-ccb9-4e22-8507-5131b211ce74.MOV'],
      ['Remo con barra', 'remo-barra', 'Ejercicio de remo con barra para espalda', 'Espalda', 'Barra', 'Intermedio', 'Fuerza', 'Inclinado 45°, agarra la barra y tira hacia el abdomen, apretando los omóplatos', null],
      ['Peso muerto', 'peso-muerto', 'Ejercicio fundamental para espalda y cadena posterior', 'Espalda', 'Barra', 'Intermedio', 'Fuerza', 'Pies separados al ancho de los hombros, agarra la barra y levántala manteniendo la espalda recta', null],
      ['Press militar', 'press-militar', 'Press de hombros con barra de pie', 'Hombros', 'Barra', 'Intermedio', 'Fuerza', 'De pie, agarra la barra al ancho de los hombros y presiona hacia arriba', null],
      ['Elevaciones laterales', 'elevaciones-laterales', 'Ejercicio de aislamiento para deltoides laterales', 'Hombros', 'Mancuernas', 'Principiante', 'Fuerza', 'De pie, eleva mancuernas lateralmente hasta la altura de los hombros', null],
      ['Elevaciones frontales', 'elevaciones-frontales', 'Ejercicio de aislamiento para deltoides frontales', 'Hombros', 'Mancuernas', 'Principiante', 'Fuerza', 'De pie, eleva mancuernas frontalmente hasta la altura de los hombros', null],
      ['Tirón facial', 'tiron-facial', 'Ejercicio para deltoides posteriores y trapecio', 'Hombros', 'Cable', 'Intermedio', 'Fuerza', 'Con cable, tira hacia la cara separando las manos', 'https://wger.de/media/exercise-video/222/245a824b-cd39-45f2-b251-2c0b7efead0d.MOV'],
      ['Sentadilla', 'sentadilla', 'Ejercicio fundamental para piernas', 'Piernas', 'Peso corporal', 'Principiante', 'Fuerza', 'Pies separados al ancho de los hombros, baja como si te sentaras en una silla', null],
      ['Sentadilla con barra', 'sentadilla-barra', 'Sentadilla con barra en la espalda', 'Piernas', 'Barra', 'Intermedio', 'Fuerza', 'Barra en la espalda, baja hasta que los muslos estén paralelos al suelo', null],
      ['Zancadas', 'zancadas', 'Ejercicio unilateral para piernas', 'Piernas', 'Peso corporal', 'Principiante', 'Fuerza', 'Da un paso largo hacia adelante y baja la rodilla trasera al suelo', 'https://wger.de/media/exercise-video/802/85d1d7f8-c3c5-47e8-9b26-56896919e6e7.MOV'],
      ['Peso muerto rumano', 'peso-muerto-rumano', 'Variación del peso muerto enfocada en isquiotibiales', 'Piernas', 'Barra', 'Intermedio', 'Fuerza', 'Barra en las manos, mantén las piernas casi rectas y baja la barra hacia los pies', 'https://wger.de/media/exercise-video/507/307e7276-a14d-4ea0-b579-f5b0dbc6f5af.MOV'],
      ['Sentadillas búlgaras', 'sentadillas-bulgaras', 'Sentadilla búlgara con pie trasero elevado', 'Piernas', 'Peso corporal', 'Intermedio', 'Fuerza', 'Pie trasero en banco, baja la rodilla delantera hacia el suelo', null],
      ['Curl de bíceps', 'curl-biceps', 'Ejercicio de aislamiento para bíceps', 'Brazos', 'Mancuernas', 'Principiante', 'Fuerza', 'De pie, flexiona los brazos llevando las mancuernas hacia los hombros', null],
      ['Tríceps en banco', 'triceps-banco', 'Fondos en banco para tríceps', 'Brazos', 'Banco', 'Principiante', 'Fuerza', 'Apoya las manos en el banco, baja el cuerpo flexionando los codos', null],
      ['Curl martillo', 'curl-martillo', 'Curl de bíceps con agarre neutro', 'Brazos', 'Mancuernas', 'Principiante', 'Fuerza', 'Agarre neutro, flexiona los brazos manteniendo las muñecas rectas', 'https://wger.de/media/exercise-video/272/df069052-2173-4f24-855f-a0eebe729f24.MOV'],
      ['Extensiones de tríceps', 'extensiones-triceps', 'Extensiones de tríceps con mancuerna', 'Brazos', 'Mancuernas', 'Principiante', 'Fuerza', 'Mancuerna sobre la cabeza, extiende los brazos hacia arriba', null],
      ['Plancha', 'plancha', 'Ejercicio isométrico para core', 'Core', 'Peso corporal', 'Principiante', 'Fuerza', 'Posición de flexión, mantén el cuerpo recto y rígido', null],
      ['Crunches', 'crunches', 'Abdominales básicos', 'Core', 'Peso corporal', 'Principiante', 'Fuerza', 'Acostado, flexiona el tronco llevando los hombros hacia las rodillas', null],
      ['Escaladores de montaña', 'mountain-climbers', 'Ejercicio dinámico para core y cardio', 'Core', 'Peso corporal', 'Intermedio', 'Cardio', 'Posición de plancha, alterna llevando las rodillas al pecho', null],
      ['Giros rusos', 'russian-twists', 'Rotaciones de tronco para core', 'Core', 'Peso corporal', 'Principiante', 'Fuerza', 'Sentado, inclínate hacia atrás y rota el tronco de lado a lado', null],
      ['Burpees', 'burpees', 'Ejercicio completo de cardio y fuerza', 'Piernas', 'Peso corporal', 'Intermedio', 'Cardio', 'Flexión, salto a sentadilla, salto vertical con brazos arriba', null],
      ['Saltos de tijera', 'jumping-jacks', 'Ejercicio de cardio básico', 'Piernas', 'Peso corporal', 'Principiante', 'Cardio', 'Salta separando piernas y brazos, luego vuelve a juntarlos', null],
      ['Rodillas altas', 'high-knees', 'Carrera en el lugar elevando rodillas', 'Piernas', 'Peso corporal', 'Principiante', 'Cardio', 'Corre en el lugar elevando las rodillas al pecho', null],
      ['Sentadillas con salto', 'jump-squats', 'Sentadillas con salto', 'Piernas', 'Peso corporal', 'Intermedio', 'Cardio', 'Haz una sentadilla y salta explosivamente hacia arriba', null],
      ['Estiramiento de isquiotibiales', 'estiramiento-isquiotibiales', 'Estiramiento estático para isquiotibiales', 'Piernas', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Sentado, extiende una pierna y estírate hacia el pie', null],
      ['Estiramiento de pecho', 'estiramiento-pecho', 'Estiramiento para músculos del pecho', 'Pecho', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Coloca el brazo en la pared y gira el cuerpo para estirar el pecho', null],
      ['Estiramiento de espalda', 'estiramiento-espalda', 'Estiramiento para músculos de la espalda', 'Espalda', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Sentado, cruza una pierna y gira el tronco hacia el lado opuesto', null],
      ['Balanceos con kettlebell', 'kettlebell-swings', 'Balanceo con kettlebell para cadera y core', 'Piernas', 'Kettlebell', 'Intermedio', 'Fuerza', 'Con kettlebell, balancea desde entre las piernas hasta la altura del pecho', null],
      ['Levantamientos turcos', 'turkish-get-ups', 'Levantamiento turco con kettlebell', 'Core', 'Kettlebell', 'Avanzado', 'Fuerza', 'Acostado, levanta la kettlebell y ponte de pie manteniéndola arriba', null],
      ['Caminata de granjero', 'farmer-walks', 'Caminata con peso para fuerza funcional', 'Core', 'Mancuernas', 'Intermedio', 'Fuerza', 'Camina sosteniendo mancuernas pesadas a los lados', null],
      ['Push-ups isométricos', 'push-ups-isometricos', 'Flexiones manteniendo la posición', 'Pecho', 'Peso corporal', 'Intermedio', 'Fuerza', 'Mantén la posición de flexión durante el tiempo especificado', null],
      ['Sentadilla en pared', 'wall-sits', 'Sentadilla isométrica contra la pared', 'Piernas', 'Peso corporal', 'Intermedio', 'Fuerza', 'Apoya la espalda en la pared y mantén la posición de sentadilla', null],
      ['Plancha a flexión', 'plank-to-push-up', 'Transición de plancha a flexión', 'Core', 'Peso corporal', 'Intermedio', 'Fuerza', 'Desde plancha, alterna apoyando un brazo y luego el otro', null],
      ['Peso muerto a una pierna', 'single-leg-deadlifts', 'Peso muerto a una pierna para equilibrio', 'Piernas', 'Peso corporal', 'Intermedio', 'Fuerza', 'De pie, levanta una pierna y baja el tronco manteniendo el equilibrio', null],
      ['Sentadillas pistol', 'pistol-squats', 'Sentadilla a una pierna', 'Piernas', 'Peso corporal', 'Avanzado', 'Fuerza', 'De pie, extiende una pierna y baja en sentadilla con la otra', null],
      ['Sentadillas en L', 'l-sits', 'Sentadilla en L para core y brazos', 'Core', 'Peso corporal', 'Avanzado', 'Fuerza', 'Sentado, levanta las piernas y mantén la posición en L', null],
      ['Círculos de brazos', 'arm-circles', 'Círculos con los brazos para calentamiento', 'Hombros', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Extiende los brazos y haz círculos hacia adelante y atrás', null],
      ['Balanceos de piernas', 'leg-swings', 'Balanceos de piernas para calentamiento', 'Piernas', 'Peso corporal', 'Principiante', 'Flexibilidad', 'De pie, balancea una pierna hacia adelante y atrás', null],
      ['Círculos de cadera', 'hip-circles', 'Círculos de cadera para calentamiento', 'Piernas', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Manos en la cintura, haz círculos con la cadera', null],
      ['Plancha lateral', 'plancha-lateral', 'Plancha lateral para estabilidad del core', 'Core', 'Peso corporal', 'Intermedio', 'Estabilidad', 'Apóyate en un antebrazo lateral, mantén el cuerpo recto y contrae el core', null],
      ['Perro pájaro', 'bird-dog', 'Ejercicio de estabilidad en cuadrupedia', 'Core', 'Peso corporal', 'Principiante', 'Estabilidad', 'En cuadrupedia, extiende brazo y pierna opuestos manteniendo el equilibrio', null],
      ['Bicho muerto', 'dead-bug', 'Ejercicio de estabilidad acostado', 'Core', 'Peso corporal', 'Principiante', 'Estabilidad', 'Acostado boca arriba, brazos y piernas en 90°, baja alternativamente brazo y pierna opuestos', null],
      ['Press Pallof', 'pallof-press', 'Ejercicio anti-rotación con banda', 'Core', 'Bandas de resistencia', 'Intermedio', 'Estabilidad', 'Con banda a la altura del pecho, empuja hacia adelante resistiendo la rotación', null],
      ['Equilibrio a una pierna', 'single-leg-balance', 'Equilibrio en una pierna', 'Piernas', 'Peso corporal', 'Principiante', 'Estabilidad', 'Mantén el equilibrio en una pierna, la otra flexionada', null],
      ['Sentadillas en bosu', 'bosu-ball-squats', 'Sentadillas en bosu para estabilidad', 'Piernas', 'Peso corporal', 'Intermedio', 'Estabilidad', 'Realiza sentadillas sobre bosu ball manteniendo el equilibrio', null],
      ['Levantamiento turco', 'turkish-get-up', 'Movimiento complejo de estabilidad', 'Core', 'Kettlebell', 'Avanzado', 'Estabilidad', 'Desde acostado, levántate manteniendo el peso arriba con control total', null],
      ['Sprints Tabata', 'sprints-tabata', 'Sprints de alta intensidad en intervalos', 'Piernas', 'Peso corporal', 'Avanzado', 'HIIT', '20 segundos sprint máximo, 10 segundos descanso, repetir 8 rondas', null],
      ['Cuerdas de batalla', 'cuerdas-batalla', 'Ondas con cuerdas pesadas de alta intensidad', 'Brazos', 'Cable', 'Intermedio', 'HIIT', 'Crea ondas alternas con las cuerdas a máxima velocidad', null],
      ['Saltos a caja', 'saltos-caja', 'Saltos explosivos a caja', 'Piernas', 'Peso corporal', 'Intermedio', 'HIIT', 'Salta explosivamente sobre una caja y baja controladamente', null],
      ['Carrera', 'carrera', 'Carrera de resistencia cardiovascular', 'Piernas', 'Ninguno', 'Principiante', 'Resistencia', 'Mantén un ritmo constante de carrera durante el tiempo establecido', null],
      ['Ciclismo', 'ciclismo', 'Ciclismo de resistencia', 'Piernas', 'Máquina', 'Principiante', 'Resistencia', 'Mantén un ritmo constante en bicicleta estática', null],
      ['Remo', 'remo', 'Remo de resistencia en máquina', 'Espalda', 'Máquina', 'Intermedio', 'Resistencia', 'Mantén un ritmo constante en máquina de remo', null],
      ['Natación', 'natacion', 'Natación de resistencia', 'Piernas', 'Ninguno', 'Intermedio', 'Resistencia', 'Mantén un ritmo constante de nado durante el tiempo establecido', null],
      ['Elíptica', 'eliptica', 'Elíptica de resistencia', 'Piernas', 'Máquina', 'Principiante', 'Resistencia', 'Mantén un ritmo constante en elíptica', null],
      ['Cargada y press', 'cargada-press', 'Movimiento explosivo de potencia', 'Piernas', 'Barra', 'Avanzado', 'Potencia', 'Levanta la barra desde el suelo hasta los hombros y luego presiona por encima de la cabeza', null],
      ['Arrancada', 'arrancada', 'Arrancada olímpica de potencia', 'Piernas', 'Barra', 'Avanzado', 'Potencia', 'Levanta la barra desde el suelo hasta por encima de la cabeza en un movimiento', null],
      ['Cargada de potencia', 'cargada-potencia', 'Cargada de potencia', 'Piernas', 'Barra', 'Avanzado', 'Potencia', 'Levanta la barra desde el suelo hasta los hombros con movimiento explosivo', null],
      ['Sentadillas con salto y peso', 'sentadillas-salto-peso', 'Sentadillas con salto y peso', 'Piernas', 'Mancuernas', 'Intermedio', 'Potencia', 'Realiza sentadilla con peso y salta explosivamente', null],
      ['Golpes con pelota medicinal', 'golpes-pelota-medicinal', 'Golpes explosivos con pelota medicinal', 'Core', 'Pelota medicinal', 'Intermedio', 'Potencia', 'Levanta la pelota por encima de la cabeza y golpea el suelo con fuerza', null],
      ['Salto con cuerda', 'salto-cuerda', 'Salto con cuerda para cardio', 'Piernas', 'Cuerda para saltar', 'Principiante', 'Cardio', 'Salta con la cuerda manteniendo un ritmo constante', null],
      ['Subidas de escalón', 'subidas-escalon', 'Subida de escalón para cardio', 'Piernas', 'Peso corporal', 'Principiante', 'Cardio', 'Sube y baja de un escalón alternando las piernas', null],
      ['Patadas al glúteo', 'patadas-gluteo', 'Patadas al glúteo corriendo', 'Piernas', 'Peso corporal', 'Principiante', 'Cardio', 'Corre en el sitio llevando los talones hacia los glúteos', null],
      ['Desplazamientos laterales', 'desplazamientos-laterales', 'Desplazamientos laterales', 'Piernas', 'Peso corporal', 'Principiante', 'Cardio', 'Desplázate lateralmente manteniendo las rodillas flexionadas', null],
      ['Caminata de cangrejo', 'caminata-cangrejo', 'Caminata de cangrejo', 'Piernas', 'Peso corporal', 'Intermedio', 'Cardio', 'Camina en posición de cangrejo hacia adelante y atrás', null],
      ['Gateo de oso', 'gateo-oso', 'Gateo de oso para cardio', 'Piernas', 'Peso corporal', 'Intermedio', 'Cardio', 'Gatea manteniendo las rodillas ligeramente elevadas', null],
      ['Saltos de patinador', 'saltos-patinador', 'Saltos de patinador', 'Piernas', 'Peso corporal', 'Intermedio', 'Cardio', 'Salta lateralmente de un lado a otro como un patinador', null],
      ['Saltos de tijera cruzados', 'saltos-tijera-cruzados', 'Jumping jacks cruzados', 'Piernas', 'Peso corporal', 'Intermedio', 'Cardio', 'Salta cruzando brazos y piernas alternativamente', null],
      ['Intervalos de sprint', 'sprint-intervals', 'Intervalos de sprint de alta intensidad', 'Piernas', 'Peso corporal', 'Avanzado', 'HIIT', '30 segundos sprint máximo, 30 segundos descanso activo', null],
      ['Variaciones de burpees', 'burpee-variations', 'Variaciones de burpees para HIIT', 'Piernas', 'Peso corporal', 'Avanzado', 'HIIT', 'Burpees con salto, flexión, sentadilla y salto vertical', null],
      ['Intervalos de escaladores', 'mountain-climber-intervals', 'Mountain climbers en intervalos de alta intensidad', 'Core', 'Peso corporal', 'Intermedio', 'HIIT', '40 segundos máximo esfuerzo, 20 segundos descanso', null],
      ['Intervalos de sentadillas con salto', 'jump-squat-intervals', 'Sentadillas con salto en intervalos', 'Piernas', 'Peso corporal', 'Intermedio', 'HIIT', '45 segundos máximo esfuerzo, 15 segundos descanso', null],
      ['Saltos en plancha', 'plank-jacks', 'Jumping jacks en posición de plancha', 'Core', 'Peso corporal', 'Intermedio', 'HIIT', 'En plancha, abre y cierra las piernas como jumping jacks', null],
      ['Escaladores araña', 'spider-climbers', 'Mountain climbers llevando rodilla al codo', 'Core', 'Peso corporal', 'Avanzado', 'HIIT', 'Lleva la rodilla al codo opuesto alternativamente', null],
      ['Saltos en pica', 'pike-jumps', 'Saltos en pica para HIIT', 'Core', 'Peso corporal', 'Avanzado', 'HIIT', 'Salta llevando las piernas hacia arriba en posición de pica', null],
      ['Saltos en estrella', 'star-jumps', 'Saltos en estrella de alta intensidad', 'Piernas', 'Peso corporal', 'Intermedio', 'HIIT', 'Salta abriendo brazos y piernas en forma de estrella', null],
      ['Saltos con rodillas al pecho', 'tuck-jumps', 'Saltos llevando rodillas al pecho', 'Piernas', 'Peso corporal', 'Avanzado', 'HIIT', 'Salta llevando las rodillas al pecho en el aire', null],
      ['Saltos laterales', 'lateral-bounds', 'Saltos laterales explosivos', 'Piernas', 'Peso corporal', 'Avanzado', 'HIIT', 'Salta lateralmente de un lado a otro con máxima explosividad', null],
      ['Ciclismo de larga distancia', 'long-distance-cycling', 'Ciclismo de larga distancia', 'Piernas', 'Máquina', 'Intermedio', 'Resistencia', 'Mantén un ritmo constante durante 30+ minutos', null],
      ['Esquí de fondo', 'cross-country-skiing', 'Esquí de fondo simulado', 'Piernas', 'Máquina', 'Intermedio', 'Resistencia', 'Simula el movimiento de esquí de fondo en máquina', null],
      ['Subida de escaleras', 'stair-climbing', 'Subida de escaleras de resistencia', 'Piernas', 'Máquina', 'Intermedio', 'Resistencia', 'Sube escaleras manteniendo un ritmo constante', null],
      ['Intervalos en máquina de remo', 'rowing-machine-intervals', 'Intervalos en máquina de remo', 'Espalda', 'Máquina', 'Intermedio', 'Resistencia', 'Alterna períodos de alta y baja intensidad en remo', null],
      ['Entrenamiento cruzado', 'cross-training', 'Entrenamiento cruzado de resistencia', 'Piernas', 'Máquina', 'Intermedio', 'Resistencia', 'Combina diferentes máquinas cardiovasculares', null],
      ['Senderismo', 'hiking', 'Senderismo de resistencia', 'Piernas', 'Ninguno', 'Principiante', 'Resistencia', 'Caminata en terreno variado durante tiempo prolongado', null],
      ['Caminata nórdica', 'nordic-walking', 'Caminata nórdica con bastones', 'Piernas', 'Ninguno', 'Principiante', 'Resistencia', 'Caminata con bastones manteniendo ritmo constante', null],
      ['Aeróbicos acuáticos', 'water-aerobics', 'Aeróbicos acuáticos de resistencia', 'Piernas', 'Ninguno', 'Principiante', 'Resistencia', 'Ejercicios aeróbicos en agua durante tiempo prolongado', null],
      ['Cardio con baile', 'dance-cardio', 'Baile cardiovascular de resistencia', 'Piernas', 'Ninguno', 'Principiante', 'Resistencia', 'Baila manteniendo un ritmo constante durante tiempo prolongado', null],
      ['Entrenamiento en circuito', 'circuit-training', 'Entrenamiento en circuito de resistencia', 'Piernas', 'Máquina', 'Intermedio', 'Resistencia', 'Rota entre diferentes máquinas sin descanso prolongado', null],
      ['Cargada desde colgado', 'hang-clean', 'Cargada desde colgado', 'Piernas', 'Barra', 'Avanzado', 'Potencia', 'Carga la barra desde posición colgada hasta los hombros', null],
      ['Press con impulso', 'push-press', 'Press con impulso de piernas', 'Hombros', 'Barra', 'Intermedio', 'Potencia', 'Usa el impulso de las piernas para presionar la barra por encima', null],
      ['Empuje', 'thruster', 'Sentadilla con press por encima', 'Piernas', 'Barra', 'Avanzado', 'Potencia', 'Sentadilla seguida inmediatamente de press por encima', null],
      ['Cargada con kettlebell', 'kettlebell-clean', 'Cargada con kettlebell', 'Piernas', 'Kettlebell', 'Intermedio', 'Potencia', 'Carga la kettlebell desde el suelo hasta la posición de rack', null],
      ['Arrancada con kettlebell', 'kettlebell-snatch', 'Arrancada con kettlebell', 'Piernas', 'Kettlebell', 'Avanzado', 'Potencia', 'Arranca la kettlebell desde el suelo hasta por encima en un movimiento', null],
      ['Cargada de potencia con mancuernas', 'dumbbell-power-clean', 'Cargada de potencia con mancuernas', 'Piernas', 'Mancuernas', 'Intermedio', 'Potencia', 'Carga las mancuernas desde el suelo hasta los hombros', null],
      ['Zancadas con salto', 'jump-lunges', 'Zancadas con salto explosivo', 'Piernas', 'Peso corporal', 'Intermedio', 'Potencia', 'Alterna zancadas con salto explosivo entre cada repetición', null],
      ['Saltos horizontales', 'broad-jumps', 'Saltos horizontales de potencia', 'Piernas', 'Peso corporal', 'Intermedio', 'Potencia', 'Salta horizontalmente lo más lejos posible', null],
      ['Balanceo con kettlebell a un brazo', 'single-arm-kettlebell-swing', 'Balanceo con kettlebell a un brazo', 'Piernas', 'Kettlebell', 'Intermedio', 'Potencia', 'Balancea la kettlebell con un solo brazo hasta la altura del pecho', null],
      ['Lanzamientos de pelota a la pared', 'wall-ball-shots', 'Lanzamientos de pelota a la pared', 'Piernas', 'Pelota medicinal', 'Intermedio', 'Potencia', 'Lanza la pelota a la pared desde sentadilla con máxima potencia', null],
      ['Estiramiento gato-vaca', 'estiramiento-gato-vaca', 'Estiramiento de gato-vaca para columna', 'Espalda', 'Peso corporal', 'Principiante', 'Flexibilidad', 'En cuadrupedia, alterna entre arquear y redondear la espalda', null],
      ['Perro boca abajo', 'perro-boca-abajo', 'Postura del perro boca abajo', 'Espalda', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Forma una V invertida con el cuerpo, estirando toda la cadena posterior', null],
      ['Postura del niño', 'postura-del-nino', 'Postura del niño para relajación', 'Espalda', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Siéntate sobre los talones y estira los brazos hacia adelante', null],
      ['Postura de la paloma', 'postura-de-la-paloma', 'Postura de la paloma para flexibilidad de cadera', 'Piernas', 'Peso corporal', 'Intermedio', 'Flexibilidad', 'Lleva una pierna hacia adelante en ángulo, estira la otra hacia atrás', null],
      ['Flexión sentada hacia adelante', 'flexion-sentada-hacia-adelante', 'Flexión hacia adelante sentado', 'Espalda', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Sentado con piernas extendidas, flexiona hacia adelante desde la cadera', null],
      ['Flexión de pie hacia adelante', 'flexion-pie-hacia-adelante', 'Flexión hacia adelante de pie', 'Espalda', 'Peso corporal', 'Principiante', 'Flexibilidad', 'De pie, flexiona hacia adelante desde la cadera, colgando los brazos', null],
      ['Guerrero III', 'guerrero-iii', 'Guerrero III para equilibrio y flexibilidad', 'Piernas', 'Peso corporal', 'Intermedio', 'Flexibilidad', 'Equilibrio en una pierna, cuerpo y pierna libre paralelos al suelo', null],
      ['Postura del triángulo', 'postura-del-triangulo', 'Postura del triángulo para flexibilidad lateral', 'Espalda', 'Peso corporal', 'Intermedio', 'Flexibilidad', 'Piernas separadas, inclínate hacia un lado tocando el tobillo', null],
      ['Postura de la cobra', 'postura-de-la-cobra', 'Postura de la cobra para flexibilidad de columna', 'Espalda', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Acostado boca abajo, levanta el pecho apoyándote en los antebrazos', null],
      ['Postura del puente', 'postura-del-puente', 'Postura del puente para flexibilidad de columna', 'Espalda', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Acostado boca arriba, levanta las caderas formando un puente', null],
      ['Estiramiento de mariposa', 'estiramiento-de-mariposa', 'Estiramiento de mariposa para cadera', 'Piernas', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Sentado, une las plantas de los pies y acerca los talones al cuerpo', null],
      ['Torsión sentada de columna', 'torsion-sentada-columna', 'Torsión sentada de columna', 'Espalda', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Sentado, gira el torso hacia un lado, mano opuesta en la rodilla', null],
      ['Postura del lagarto', 'postura-del-lagarto', 'Postura del lagarto para flexibilidad de cadera', 'Piernas', 'Peso corporal', 'Intermedio', 'Flexibilidad', 'En posición de zancada baja, apoya los antebrazos en el suelo', null],
      ['Estiramiento de isquiotibiales acostado', 'estiramiento-isquiotibiales-acostado', 'Estiramiento de isquiotibiales acostado', 'Piernas', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Acostado, lleva una rodilla al pecho y extiende la pierna hacia arriba', null],
      ['Postura del águila', 'postura-del-aguila', 'Postura del águila para flexibilidad de hombros', 'Hombros', 'Peso corporal', 'Intermedio', 'Flexibilidad', 'Envuelve un brazo alrededor del otro y cruza las piernas', null],
      ['Enhebrar la aguja', 'enhebrar-la-aguja', 'Enhebrar la aguja para flexibilidad de hombros', 'Hombros', 'Peso corporal', 'Principiante', 'Flexibilidad', 'En cuadrupedia, pasa un brazo por debajo del otro', null],
      ['Postura del bebé feliz', 'postura-del-bebe-feliz', 'Postura del bebé feliz para flexibilidad de cadera', 'Piernas', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Acostado boca arriba, agarra los pies y balancea suavemente', null],
      ['Piernas en la pared', 'piernas-en-la-pared', 'Piernas en la pared para relajación', 'Piernas', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Acostado cerca de la pared, eleva las piernas contra la pared', null],
      ['Ángulo atado reclinado', 'angulo-atado-reclinado', 'Ángulo atado reclinado para flexibilidad de cadera', 'Piernas', 'Peso corporal', 'Principiante', 'Flexibilidad', 'Acostado, une las plantas de los pies y deja caer las rodillas', null]
    ] as const;

    const ejercicios = ejerciciosData.map(
      ([nombre, slug, descripcion, grupoMuscular, equipamiento, nivelDificultad, tipoEjercicio, instrucciones, videoDemostrativo]) => 
        crearEjercicio(nombre, slug, descripcion, grupoMuscular, equipamiento, nivelDificultad, tipoEjercicio, instrucciones, videoDemostrativo || undefined)
    );

    // Crear ejercicios
    const ejerciciosCreados = await Ejercicio.insertMany(ejercicios);
    console.log(`${ejerciciosCreados.length} ejercicios creados exitosamente.`);

    return ejerciciosCreados;
  } catch (error) {
    console.error('Error en seed de ejercicios:', error);
    throw error;
  }
}