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
  // Esperar a que la conexión esté lista
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });
  }
  
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
  
  // Limpiar cachés de Jest
  jest.clearAllMocks();
});

// Limpiar después de cada test
afterEach(async () => {
  // Liberar memoria
  if (global.gc) {
    global.gc();
  }
});

// Cerrar la conexión después de todos los tests
afterAll(async () => {
  // Desconectar mongoose
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Esperar un poco para que se liberen recursos
  await new Promise(resolve => setTimeout(resolve, 500));
});