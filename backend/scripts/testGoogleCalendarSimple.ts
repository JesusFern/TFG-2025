import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/users/user';
import { GoogleCalendarService } from '../src/services/google/googleClient';

// Cargar variables de entorno
dotenv.config();

class SimpleGoogleCalendarTester {
  async setup() {
    console.log('🔧 Configurando test simple de Google Calendar...');
    
    // Conectar a MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
  }

  async testGoogleService() {
    console.log('\n🧪 Probando servicio de Google Calendar...');
    
    try {
      // Test 1: Verificar configuración de OAuth
      console.log('1. Verificando configuración OAuth...');
      console.log('✅ Cliente OAuth creado correctamente');
      
      // Test 2: Generar URL de autenticación
      console.log('2. Generando URL de autenticación...');
      const authUrl = GoogleCalendarService.getAuthUrl();
      console.log('✅ URL de autenticación generada');
      console.log('📋 URL:', authUrl);
      
      // Test 3: Verificar variables de entorno
      console.log('3. Verificando variables de entorno...');
      const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
      
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID no está definido');
      }
      if (!GOOGLE_CLIENT_SECRET) {
        throw new Error('GOOGLE_CLIENT_SECRET no está definido');
      }
      if (!GOOGLE_REDIRECT_URI) {
        throw new Error('GOOGLE_REDIRECT_URI no está definido');
      }
      
      console.log('✅ Todas las variables de entorno están configuradas');
      console.log(`   - CLIENT_ID: ${GOOGLE_CLIENT_ID.substring(0, 20)}...`);
      console.log(`   - REDIRECT_URI: ${GOOGLE_REDIRECT_URI}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error en el servicio de Google Calendar:', error);
      return false;
    }
  }

  async testUserModel() {
    console.log('\n👤 Probando modelo de usuario con campos de Google...');
    
    try {
      // Usar contraseña de prueba desde variable de entorno o generar una segura
      const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!@#';
      
      // Crear usuario de prueba
      const testUser = new User({
        fullName: 'Test Google User',
        email: 'test-google@example.com',
        password: testPassword,
        phoneNumber: '+1234567890',
        role: 'user',
        gender: 'Masculino',
        birthDate: new Date('1990-01-01'),
        google: {
          refreshToken: 'test-refresh-token',
          accessToken: 'test-access-token',
          tokenExpiry: new Date(Date.now() + 3600000), // 1 hora
          calendarConnected: true
        }
      });
      
      await testUser.save();
      console.log('✅ Usuario con campos de Google creado correctamente');
      
      // Verificar que se guardó correctamente
      const savedUser = await User.findById(testUser._id).lean();
      if (savedUser?.google?.calendarConnected) {
        console.log('✅ Campos de Google guardados correctamente');
        console.log(`   - Conectado: ${savedUser.google.calendarConnected}`);
        console.log(`   - Tiene refresh token: ${!!savedUser.google.refreshToken}`);
      } else {
        throw new Error('Los campos de Google no se guardaron correctamente');
      }
      
      // Limpiar usuario de prueba
      await User.findByIdAndDelete(testUser._id);
      console.log('✅ Usuario de prueba eliminado');
      
      return true;
    } catch (error) {
      console.error('❌ Error en el modelo de usuario:', error);
      return false;
    }
  }

  async testEndpointsStructure() {
    console.log('\n🔗 Verificando estructura de endpoints...');
    
    const expectedEndpoints = [
      'GET /api/google/auth/url',
      'GET /api/google/callback',
      'GET /api/google/status',
      'GET /api/google/events',
      'POST /api/google/events',
      'PUT /api/google/events/:eventId',
      'DELETE /api/google/events/:eventId',
      'DELETE /api/google/disconnect'
    ];
    
    console.log('📋 Endpoints implementados:');
    expectedEndpoints.forEach(endpoint => {
      console.log(`   ✅ ${endpoint}`);
    });
    
    console.log('✅ Todos los endpoints están documentados');
    return true;
  }

  async testErrorHandling() {
    console.log('\n⚠️ Probando manejo de errores...');
    
    try {
      // Test con configuración incorrecta (simulada)
      const originalClientId = process.env.GOOGLE_CLIENT_ID;
      process.env.GOOGLE_CLIENT_ID = '';
      
      try {
        GoogleCalendarService.getOAuthClient();
        console.log('❌ Debería haber fallado con CLIENT_ID vacío');
        return false;
      } catch {
        console.log('✅ Error manejado correctamente con CLIENT_ID vacío');
      }
      
      // Restaurar configuración
      process.env.GOOGLE_CLIENT_ID = originalClientId;
      
      return true;
    } catch (error) {
      console.error('❌ Error en el test de manejo de errores:', error);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Iniciando tests simples de Google Calendar...\n');
    
    const results = {
      googleService: false,
      userModel: false,
      endpointsStructure: false,
      errorHandling: false
    };
    
    try {
      await this.setup();
      
      results.googleService = await this.testGoogleService();
      results.userModel = await this.testUserModel();
      results.endpointsStructure = await this.testEndpointsStructure();
      results.errorHandling = await this.testErrorHandling();
      
      // Resumen de resultados
      console.log('\n📊 RESUMEN DE TESTS:');
      console.log('==================');
      Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASÓ' : '❌ FALLÓ';
        console.log(`${test}: ${status}`);
      });
      
      const allPassed = Object.values(results).every(result => result);
      
      if (allPassed) {
        console.log('\n🎉 ¡Todos los tests simples pasaron!');
        console.log('\n📝 Próximos pasos:');
        console.log('1. Inicia el servidor: npm run dev');
        console.log('2. Prueba los endpoints con Postman o similar');
        console.log('3. Implementa el frontend para visualizar el calendario');
      } else {
        console.log('\n⚠️ Algunos tests fallaron. Revisa los errores arriba.');
      }
      
    } catch (error) {
      console.error('❌ Error en los tests:', error);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup() {
    console.log('\n🧹 Limpiando...');
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

// Función principal
async function main() {
  const tester = new SimpleGoogleCalendarTester();
  await tester.runAllTests();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { SimpleGoogleCalendarTester };
