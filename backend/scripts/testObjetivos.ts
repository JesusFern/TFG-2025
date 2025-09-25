import { EjercicioDistribucionService } from '../src/service/training/ejercicioDistribucionService';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testObjetivos() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    const objetivos = ['Ganancia muscular', 'Pérdida de peso', 'Flexibilidad', 'Resistencia'];

    for (const objetivo of objetivos) {
      console.log(`\n🎯 Test para objetivo: ${objetivo}`);
      console.log('='.repeat(50));

      const sesiones = await EjercicioDistribucionService.generarSesionesParaPlan(
        objetivo,
        2, // 2 días por semana
        4, // 4 semanas
        [1, 3], // Lunes y Miércoles
        'Intermedio'
      );

      console.log(`Sesiones generadas: ${sesiones.length}`);
      
      sesiones.forEach((sesion) => {
        console.log(`\n📋 ${sesion.nombre}`);
        console.log(`   Tipo: ${sesion.tipoEntrenamiento}`);
        console.log(`   Duración: ${sesion.duracion} minutos`);
        console.log(`   Ejercicios (${sesion.ejercicios.length}):`);
        
        sesion.ejercicios.forEach((ej, j) => {
          console.log(`     ${j + 1}. ${ej.nombre} (${ej.grupoMuscular}) - ${ej.tipoEjercicio} - ${ej.series}x${ej.repeticiones}`);
        });
      });

      // Análisis de tipos de ejercicios
      const tiposEjercicio = [...new Set(sesiones.flatMap(s => s.ejercicios.map(e => e.tipoEjercicio)))];
      const equipamientos = [...new Set(sesiones.flatMap(s => s.ejercicios.map(e => e.equipamiento)))];
      
      console.log(`\n📊 Análisis para ${objetivo}:`);
      console.log(`   Tipos de ejercicio: ${tiposEjercicio.join(', ')}`);
      console.log(`   Equipamientos: ${equipamientos.join(', ')}`);
    }

    console.log('\n✅ Todos los tests de objetivos completados exitosamente');

  } catch (error) {
    console.error('❌ Error en los tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testObjetivos();
