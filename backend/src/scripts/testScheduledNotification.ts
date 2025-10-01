import mongoose from 'mongoose';
import { crearNotificacionService } from '../service/chats/notificacionService';

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutroos';

async function testScheduledNotification() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Crear una notificación programada para AHORA (para que el cron job la encuentre)
    const ahora = new Date();
    const programadaPara = new Date(ahora.getTime() + 1000); // 1 segundo en el futuro

    console.log('Creando notificación de prueba programada para:', {
      ahora: ahora.toISOString(),
      programadaPara: programadaPara.toISOString(),
      ahoraMadrid: ahora.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
      programadaParaMadrid: programadaPara.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
    });

    const notificacionData = {
      usuario: '68d44d8402683839bb08f764', // ID del usuario de prueba
      tipo: 'recordatorio' as const,
      titulo: 'Notificación de prueba programada',
      contenido: 'Esta es una notificación de prueba programada para ser enviada ahora',
      prioridad: 'alta' as const,
      programadaPara: programadaPara,
      accion: {
        tipo: 'navegar' as const,
        url: '/notificaciones'
      },
      metadata: {
        remitente: '68d44d8402683839bb08f761' // ID del entrenador de prueba
      }
    };

    const notificacion = await crearNotificacionService(notificacionData);
    console.log('✅ Notificación de prueba creada:', {
      id: notificacion._id,
      programadaPara: notificacion.programadaPara,
      enviada: notificacion.enviada
    });

    console.log('⏰ El cron job debería encontrar esta notificación en el próximo minuto...');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

testScheduledNotification();
