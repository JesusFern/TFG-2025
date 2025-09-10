import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// En entorno de pruebas, usamos una clave mock para evitar errores
const isTestEnvironment = process.env.NODE_ENV === 'test';
const stripeSecretKey = isTestEnvironment 
  ? 'sk_test_mock_key_for_testing_only'
  : process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey && !isTestEnvironment) {
  console.warn('⚠️ STRIPE_SECRET_KEY no está configurada en el archivo .env');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil',
});

export default stripe;
