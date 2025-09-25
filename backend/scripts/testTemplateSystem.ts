import { EjercicioDistribucionService } from '../src/service/training/ejercicioDistribucionService';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testTemplateSystem() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Test 1: Estrategia Full Body (2 días/semana)
    console.log('\n🧪 Test 1: Estrategia Full Body (2 días/semana)');
    const estrategia1 = EjercicioDistribucionService.determinarEstrategia(2);
    console.log(`Estrategia determinada: ${estrategia1}`);

    const sesiones1 = await EjercicioDistribucionService.generarSesionesParaPlan(
      'Ganancia muscular',
      2,
      4, // 4 semanas
      [1, 3], // Lunes y Miércoles
      'Intermedio'
    );
    console.log(`Sesiones generadas: ${sesiones1.length}`);
    sesiones1.forEach((sesion, i) => {
      console.log(`  ${i + 1}. ${sesion.nombre} - ${sesion.ejercicios.length} ejercicios`);
      sesion.ejercicios.forEach((ej: {
        nombre: string;
        grupoMuscular: string;
        series: number;
        repeticiones: number;
      }, j: number) => {
        console.log(`    ${j + 1}. ${ej.nombre} (${ej.grupoMuscular}) - ${ej.series}x${ej.repeticiones}`);
      });
    });

    // Test 2: Estrategia Upper/Lower (3 días/semana)
    console.log('\n🧪 Test 2: Estrategia Upper/Lower (3 días/semana)');
    const estrategia2 = EjercicioDistribucionService.determinarEstrategia(3);
    console.log(`Estrategia determinada: ${estrategia2}`);

    const sesiones2 = await EjercicioDistribucionService.generarSesionesParaPlan(
      'Pérdida de peso',
      3,
      6, // 6 semanas
      [1, 3, 5], // Lunes, Miércoles, Viernes
      'Principiante'
    );
    console.log(`Sesiones generadas: ${sesiones2.length}`);
    sesiones2.forEach((sesion, i) => {
      console.log(`  ${i + 1}. ${sesion.nombre} - ${sesion.ejercicios.length} ejercicios`);
    });

    // Test 3: Estrategia Push/Pull/Legs (4 días/semana)
    console.log('\n🧪 Test 3: Estrategia Push/Pull/Legs (4 días/semana)');
    const estrategia3 = EjercicioDistribucionService.determinarEstrategia(4);
    console.log(`Estrategia determinada: ${estrategia3}`);

    const sesiones3 = await EjercicioDistribucionService.generarSesionesParaPlan(
      'Resistencia',
      4,
      8, // 8 semanas
      [1, 2, 4, 5], // Lunes, Martes, Jueves, Viernes
      'Avanzado'
    );
    console.log(`Sesiones generadas: ${sesiones3.length}`);
    sesiones3.forEach((sesion, i) => {
      console.log(`  ${i + 1}. ${sesion.nombre} - ${sesion.ejercicios.length} ejercicios`);
    });

    console.log('\n✅ Todos los tests completados exitosamente');

  } catch (error) {
    console.error('❌ Error en los tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testTemplateSystem();
