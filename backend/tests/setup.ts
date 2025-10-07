import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Establecer entorno de pruebas
process.env.NODE_ENV = 'test';

// Configurar variables de entorno para tests
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_testing_only';
process.env.STREAM_API_KEY = 'mmhfdzb5evj2';
process.env.STREAM_API_SECRET = 'test-secret-key-for-development';

dotenv.config({ path: '.env' });

// Mock de módulos externos
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            id: 'test_session_id',
            url: 'https://test-checkout-url.com'
          }),
        },
      },
      paymentIntents: {
        create: jest.fn().mockResolvedValue({ 
          id: 'test_payment_intent_id',
          client_secret: 'test_client_secret' 
        }),
        retrieve: jest.fn().mockResolvedValue({ 
          id: 'test_payment_intent_id',
          status: 'succeeded' 
        }),
      }
    };
  });
});

// Limpiar la base de datos antes de cada test
beforeEach(async () => {
  // Solo limpiar si hay una conexión activa a MongoDB
  if (mongoose.connection.readyState === 1) {
    const collections = Object.values(mongoose.connection.collections);
    for (const collection of collections) {
      try {
        await collection.deleteMany({});
      } catch {
        // Ignorar errores de limpieza en tests que no usan MongoDB
        console.warn(`No se pudo limpiar la colección ${collection.collectionName}`);
      }
    }
  }
}, 10000); // Aumentar timeout a 10 segundos

// Cerrar la conexión después de todos los tests
afterAll(async () => {
  // Solo cerrar si hay una conexión activa
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
    } catch (error) {
      console.warn('Error al cerrar la conexión de MongoDB:', error);
    }
  }
}, 10000);