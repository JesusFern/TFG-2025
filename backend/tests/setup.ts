import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Establecer entorno de pruebas
process.env.NODE_ENV = 'test';

// Configurar variables de entorno para tests
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_testing_only';

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
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// Cerrar la conexión después de todos los tests
afterAll(async () => {
  await mongoose.connection.close();
});