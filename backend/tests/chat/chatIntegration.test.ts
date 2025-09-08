import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';
import { IMensaje, IConversacion, INotificacion } from '../../src/models/chats';

// Mock de los servicios para evitar dependencias de base de datos en tests de integración
jest.mock('../../src/service/chats/mensajeService');
jest.mock('../../src/service/chats/conversacionService');
jest.mock('../../src/service/chats/notificacionService');

describe('Chat Module Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testUserId2: string;

  let mockMensaje: IMensaje;
  let mockConversacion: IConversacion;
  let mockNotificacion: INotificacion;

  beforeAll(async () => {
    // Crear usuarios de prueba
    const testUser = await User.create({
      fullName: "Test User",
      email: "testuser@example.com",
      password: "Test1234",
      phoneNumber: "+34123456789",
      gender: "Masculino",
      birthDate: new Date("1990-01-01"),
      role: 'user'
    });
    testUserId = (testUser._id as mongoose.Types.ObjectId).toString();

    const testUser2 = await User.create({
      fullName: "Test User 2",
      email: "testuser2@example.com",
      password: "Test1234",
      phoneNumber: "+34123456788",
      gender: "Femenino",
      birthDate: new Date("1990-01-01"),
      role: 'user'
    });
    testUserId2 = (testUser2._id as mongoose.Types.ObjectId).toString();

    // Hacer login para obtener token
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ 
        email: 'testuser@example.com', 
        password: 'Test1234' 
      });
    authToken = loginRes.body.token;

    // Crear mocks después de tener los IDs reales
    mockMensaje = {
      _id: '507f1f77bcf86cd799439012',
      remitente: testUserId,
      destinatario: testUserId2,
      contenido: 'Test message content',
      tipo: 'texto',
      estado: 'enviado',
      prioridad: 'normal',
      categoria: 'general',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockConversacion = {
      _id: '507f1f77bcf86cd799439014',
      participantes: [
        { _id: testUserId, fullName: 'Test User', email: 'testuser@example.com', role: 'user' },
        { _id: testUserId2, fullName: 'Test User 2', email: 'testuser2@example.com', role: 'user' }
      ],
      mensajesNoLeidos: new Map([[testUserId, 2], [testUserId2, 0]]),
      activa: true,
      metadata: {
        tipo: 'general'
      },
      configuracion: {
        notificaciones: true,
        sonido: true,
        recordatorios: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockNotificacion = {
      _id: '507f1f77bcf86cd799439015',
      usuario: testUserId,
      tipo: 'mensaje',
      titulo: 'Nuevo mensaje',
      contenido: 'Tienes un nuevo mensaje de Test User',
      prioridad: 'normal',
      leida: false,
      enviada: true,
      accion: {
        tipo: 'abrir_mensaje',
        metadata: {
          mensajeId: mockMensaje._id
        }
      },
      metadata: {
        mensaje: mockMensaje._id,
        conversacion: mockConversacion._id,
        remitente: testUserId
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujo Completo de Mensajería', () => {
    it('debería enviar mensaje exitosamente', async () => {
      const mockMensajeService = jest.requireMock('../../src/service/chats/mensajeService');
      mockMensajeService.crearMensajeService = jest.fn().mockResolvedValue(mockMensaje);

      const mensajeRes = await request(app)
        .post('/api/messaging/mensajes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinatario: testUserId2,
          contenido: 'Test message content',
          tipo: 'texto' as const,
          prioridad: 'normal' as const,
          categoria: 'general' as const
        });

      expect(mensajeRes.statusCode).toEqual(201);
      expect(mensajeRes.body.mensaje).toBeDefined();
    });

    it('debería obtener mensajes exitosamente', async () => {
      const mockMensajeService = jest.requireMock('../../src/service/chats/mensajeService');
      mockMensajeService.obtenerMensajesService = jest.fn().mockResolvedValue({
        mensajes: [mockMensaje],
        total: 1,
        limit: 10,
        offset: 0
      });

      const mensajesRes = await request(app)
        .get('/api/messaging/mensajes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          destinatario: testUserId2,
          remitente: testUserId
        });

      expect(mensajesRes.statusCode).toEqual(200);
      expect(mensajesRes.body.mensajes).toHaveLength(1);
    });
  });

  describe('Gestión de Conversaciones', () => {
    it('debería obtener conversaciones del usuario', async () => {
      const mockConversacionService = jest.requireMock('../../src/service/chats/conversacionService');
      mockConversacionService.obtenerConversacionesService = jest.fn().mockResolvedValue({
        conversaciones: [mockConversacion],
        total: 1,
        limit: 20,
        offset: 0
      });

      const conversacionesRes = await request(app)
        .get('/api/messaging/conversaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          participante: testUserId,
          activa: true
        });

      expect(conversacionesRes.statusCode).toEqual(200);
      expect(conversacionesRes.body.conversaciones).toHaveLength(1);
    });

    it('debería obtener conversación por ID', async () => {
      const mockConversacionService = jest.requireMock('../../src/service/chats/conversacionService');
      mockConversacionService.obtenerConversacionPorIdService = jest.fn().mockResolvedValue(mockConversacion);

      const conversacionRes = await request(app)
        .get(`/api/messaging/conversaciones/${mockConversacion._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(conversacionRes.statusCode).toEqual(200);
      expect(conversacionRes.body.conversacion).toBeDefined();
    });
  });

  describe('Sistema de Notificaciones', () => {
    it('debería crear notificación exitosamente', async () => {
      const mockNotificacionService = jest.requireMock('../../src/service/chats/notificacionService');
      mockNotificacionService.crearNotificacionService = jest.fn().mockResolvedValue(mockNotificacion);

      const notificacionRes = await request(app)
        .post('/api/messaging/notificaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          usuario: testUserId2,
          tipo: 'mensaje' as const,
          titulo: 'Test notification',
          contenido: 'Test notification content',
          prioridad: 'normal' as const
        });

      expect(notificacionRes.statusCode).toEqual(201);
      expect(notificacionRes.body.notificacion).toBeDefined();
    });

    it('debería obtener notificaciones del usuario', async () => {
      const mockNotificacionService = jest.requireMock('../../src/service/chats/notificacionService');
      mockNotificacionService.obtenerNotificacionesService = jest.fn().mockResolvedValue({
        notificaciones: [mockNotificacion],
        total: 1,
        limit: 10,
        offset: 0
      });

      const notificacionesRes = await request(app)
        .get('/api/messaging/notificaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          usuario: testUserId2,
          tipo: 'mensaje'
        });

      expect(notificacionesRes.statusCode).toEqual(200);
      expect(notificacionesRes.body.notificaciones).toHaveLength(1);
    });
  });

  describe('Filtros y Búsquedas', () => {
    it('debería filtrar mensajes por múltiples criterios', async () => {
      const mockMensajeService = jest.requireMock('../../src/service/chats/mensajeService');
      mockMensajeService.obtenerMensajesService = jest.fn().mockResolvedValue({
        mensajes: [mockMensaje],
        total: 1,
        limit: 10,
        offset: 0
      });

      const filtrosRes = await request(app)
        .get('/api/messaging/mensajes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          remitente: testUserId,
          destinatario: testUserId2,
          tipo: 'texto',
          estado: 'enviado',
          categoria: 'general',
          prioridad: 'normal',
          limit: 10,
          offset: 0
        });

      expect(filtrosRes.statusCode).toEqual(200);
      expect(filtrosRes.body.mensajes).toHaveLength(1);
    });

    it('debería filtrar conversaciones por tipo y estado', async () => {
      const mockConversacionService = jest.requireMock('../../src/service/chats/conversacionService');
      mockConversacionService.obtenerConversacionesService = jest.fn().mockResolvedValue({
        conversaciones: [mockConversacion],
        total: 1,
        limit: 10,
        offset: 0
      });

      const filtrosRes = await request(app)
        .get('/api/messaging/conversaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          participante: testUserId,
          tipo: 'general',
          activa: true,
          limit: 10,
          offset: 0
        });

      expect(filtrosRes.statusCode).toEqual(200);
      expect(filtrosRes.body.conversaciones).toHaveLength(1);
    });
  });

  describe('Manejo de Errores y Validaciones', () => {
    it('debería validar datos requeridos en mensajes', async () => {
      // Test sin destinatario
      const mensajeSinDestinatario = await request(app)
        .post('/api/messaging/mensajes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contenido: 'Test message'
        });

      expect(mensajeSinDestinatario.statusCode).toEqual(400);
    });

    it('debería validar tipos de datos en enums', async () => {
      // Test tipo de mensaje inválido
      const mensajeTipoInvalido = await request(app)
        .post('/api/messaging/mensajes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinatario: testUserId2,
          contenido: 'Test message',
          tipo: 'invalid-type' as unknown
        });

      expect(mensajeTipoInvalido.statusCode).toEqual(400);
    });

    it('debería validar IDs de MongoDB', async () => {
      // Mock del servicio para que devuelva error
      const mockMensajeService = jest.requireMock('../../src/service/chats/mensajeService');
      mockMensajeService.obtenerMensajePorIdService = jest.fn().mockRejectedValue(new Error('ID inválido'));

      // Test ID inválido en mensajes
      const mensajeIdInvalido = await request(app)
        .get('/api/messaging/mensajes/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(mensajeIdInvalido.statusCode).toEqual(500); // El servicio devuelve error 500 para IDs inválidos
    });
  });

  describe('Paginación y Límites', () => {
    it('debería aplicar paginación correctamente', async () => {
      const mockMensajeService = jest.requireMock('../../src/service/chats/mensajeService');
      mockMensajeService.obtenerMensajesService = jest.fn().mockResolvedValue({
        mensajes: [mockMensaje],
        total: 25,
        limit: 5,
        offset: 10
      });

      const paginacionRes = await request(app)
        .get('/api/messaging/mensajes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          limit: 5,
          offset: 10
        });

      expect(paginacionRes.statusCode).toEqual(200);
      expect(paginacionRes.body.total).toEqual(25);
      expect(paginacionRes.body.limit).toEqual(5);
      expect(paginacionRes.body.offset).toEqual(10);
    });
  });

  describe('Operaciones de Eliminación', () => {
    it('debería eliminar mensaje exitosamente', async () => {
      const mockMensajeService = jest.requireMock('../../src/service/chats/mensajeService');
      mockMensajeService.obtenerMensajePorIdService = jest.fn().mockResolvedValue(mockMensaje);
      mockMensajeService.eliminarMensajeService = jest.fn().mockResolvedValue(undefined);

      const deleteRes = await request(app)
        .delete(`/api/messaging/mensajes/${mockMensaje._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.statusCode).toEqual(200);
      expect(deleteRes.body.message).toEqual('Mensaje eliminado exitosamente');
    });

    it('debería eliminar notificación exitosamente', async () => {
      const mockNotificacionService = jest.requireMock('../../src/service/chats/notificacionService');
      mockNotificacionService.obtenerNotificacionPorIdService = jest.fn().mockResolvedValue(mockNotificacion);
      mockNotificacionService.eliminarNotificacionService = jest.fn().mockResolvedValue(undefined);

      const deleteRes = await request(app)
        .delete(`/api/messaging/notificaciones/${mockNotificacion._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.statusCode).toEqual(200);
      expect(deleteRes.body.message).toEqual('Notificación eliminada exitosamente');
    });
  });
});
