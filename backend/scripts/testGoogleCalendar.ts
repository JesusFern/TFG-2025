import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/users/user';
import { GoogleCalendarService } from '../src/services/google/googleClient';

// Cargar variables de entorno
dotenv.config();

const API_BASE_URL = 'http://localhost:5000';

interface TestUser {
  id: string;
  token: string;
  email: string;
}

class GoogleCalendarTester {
  private testUser: TestUser | null = null;

  async setup() {
    console.log('🔧 Configurando test de Google Calendar...');
    
    // Conectar a MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Crear usuario de prueba
    await this.createTestUser();
  }

  async createTestUser() {
    console.log('👤 Creando usuario de prueba...');
    
    // Eliminar usuario de prueba existente
    await User.deleteOne({ email: 'test-calendar@example.com' });
    
    // Usar contraseña de prueba desde variable de entorno o generar una segura
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!@#';
    
    // Crear nuevo usuario
    const user = new User({
      fullName: 'Test Calendar User',
      email: 'test-calendar@example.com',
      password: testPassword,
      phoneNumber: '+1234567890',
      role: 'user',
      gender: 'Masculino',
      birthDate: new Date('1990-01-01')
    });
    
    await user.save();
    
    // Simular login para obtener token (en un caso real usarías el endpoint de login)
    this.testUser = {
      id: user._id as string,
      token: 'test-token', // En un caso real, obtendrías esto del endpoint de login
      email: user.email
    };
    
    console.log('✅ Usuario de prueba creado:', this.testUser.email);
  }

  async testAuthUrl() {
    console.log('\n🔗 Probando obtención de URL de autenticación...');
    
    try {
      const authUrl = GoogleCalendarService.getAuthUrl();
      console.log('✅ URL de autenticación generada:', authUrl);
      console.log('📝 Copia esta URL y ábrela en el navegador para autorizar la aplicación');
      return authUrl;
    } catch (error) {
      console.error('❌ Error generando URL de autenticación:', error);
      throw error;
    }
  }

  async testCalendarStatus() {
    console.log('\n📊 Probando estado del calendario...');
    
    try {
      const response = await this.makeRequest('GET', '/api/google/status');
      console.log('✅ Estado del calendario:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo estado del calendario:', error);
      throw error;
    }
  }

  async testGetEvents() {
    console.log('\n📅 Probando obtención de eventos...');
    
    try {
      const response = await this.makeRequest('GET', '/api/google/events');
      console.log('✅ Eventos obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo eventos:', error);
      throw error;
    }
  }

  async testCreateEvent() {
    console.log('\n➕ Probando creación de evento...');
    
    const eventData = {
      title: 'Evento de Prueba - Nutroos',
      description: 'Este es un evento de prueba creado desde la API de Nutroos',
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Mañana + 1 hora
      location: 'Gimnasio Nutroos',
      attendees: ['test@example.com']
    };
    
    try {
      const response = await this.makeRequest('POST', '/api/google/events', eventData);
      console.log('✅ Evento creado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      throw error;
    }
  }

  async testUpdateEvent(eventId: string) {
    console.log('\n✏️ Probando actualización de evento...');
    
    const updateData = {
      title: 'Evento de Prueba ACTUALIZADO - Nutroos',
      description: 'Este evento ha sido actualizado desde la API de Nutroos',
      start: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Mañana + 1 hora
      end: new Date(Date.now() + 25 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // Mañana + 2.5 horas
      location: 'Gimnasio Nutroos - Sala Principal',
      attendees: ['test@example.com', 'admin@example.com']
    };
    
    try {
      const response = await this.makeRequest('PUT', `/api/google/events/${eventId}`, updateData);
      console.log('✅ Evento actualizado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error actualizando evento:', error);
      throw error;
    }
  }

  async testDeleteEvent(eventId: string) {
    console.log('\n🗑️ Probando eliminación de evento...');
    
    try {
      const response = await this.makeRequest('DELETE', `/api/google/events/${eventId}`);
      console.log('✅ Evento eliminado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error eliminando evento:', error);
      throw error;
    }
  }

  async testDisconnect() {
    console.log('\n🔌 Probando desconexión de Google Calendar...');
    
    try {
      const response = await this.makeRequest('DELETE', '/api/google/disconnect');
      console.log('✅ Google Calendar desconectado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error desconectando Google Calendar:', error);
      throw error;
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: unknown) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.testUser?.token}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.message || 'Error desconocido'}`);
    }

    return result;
  }

  async runFullTest() {
    try {
      await this.setup();
      
      console.log('\n🚀 Iniciando tests completos de Google Calendar...\n');
      
      // Test 1: Obtener URL de autenticación
      const authUrl = await this.testAuthUrl();
      
      // Test 2: Verificar estado (debería estar desconectado inicialmente)
      await this.testCalendarStatus();
      
      console.log('\n⚠️  IMPORTANTE: Para continuar con los tests, necesitas:');
      console.log('1. Abrir la URL de autenticación en el navegador');
      console.log('2. Autorizar la aplicación');
      console.log('3. Copiar el código de autorización del callback');
      console.log('4. Ejecutar el test de callback con el código');
      
      console.log('\n📋 URL de autenticación:', authUrl);
      
    } catch (error) {
      console.error('❌ Error en el test:', error);
    }
  }

  async testWithAuthCode(authCode: string) {
    try {
      console.log('\n🔄 Probando callback con código de autorización...');
      
      // Simular el callback con el código
      const response = await this.makeRequest('GET', `/api/google/callback?code=${authCode}`);
      console.log('✅ Callback exitoso:', response);
      
      // Ahora probar todas las funcionalidades
      await this.testCalendarStatus();
      await this.testGetEvents();
      
      const createdEvent = await this.testCreateEvent();
      const eventId = createdEvent.event?.id;
      
      if (eventId) {
        await this.testUpdateEvent(eventId);
        await this.testDeleteEvent(eventId);
      }
      
      await this.testDisconnect();
      
      console.log('\n🎉 ¡Todos los tests completados exitosamente!');
      
    } catch (error) {
      console.error('❌ Error en el test con código de autorización:', error);
    }
  }

  async cleanup() {
    console.log('\n🧹 Limpiando datos de prueba...');
    await User.deleteOne({ email: 'test-calendar@example.com' });
    await mongoose.disconnect();
    console.log('✅ Limpieza completada');
  }
}

// Función principal
async function main() {
  const tester = new GoogleCalendarTester();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.length > 0 && args[0] === '--with-code') {
      // Test con código de autorización
      const authCode = args[1];
      if (!authCode) {
        console.error('❌ Debes proporcionar el código de autorización: npm run test:calendar --with-code <codigo>');
        process.exit(1);
      }
      
      await tester.setup();
      await tester.testWithAuthCode(authCode);
    } else {
      // Test básico (solo URL de autenticación)
      await tester.runFullTest();
    }
    
  } catch (error) {
    console.error('❌ Error en el test principal:', error);
  } finally {
    await tester.cleanup();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { GoogleCalendarTester };
