import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';
import { IMensaje } from '../../src/models/chats';

// Mock de los servicios
jest.mock('../../src/service/chats/mensajeService');

const mockMensajeService = jest.requireMock('../../src/service/chats/mensajeService');

describe('Mensaje API Endpoints', () => {
  let authToken: string;
  let testUserId: string;
  let testConversacionId: string;



  afterAll(async () => {
    await User.deleteMany({});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Resetear mocks específicos a valores por defecto
    mockMensajeService.obtenerMensajePorIdService.mockResolvedValue(mockMensaje);
    mockMensajeService.eliminarMensajeService.mockResolvedValue(undefined);
  });

  let mockMensaje: IMensaje;

  beforeAll(async () => {
    // Crear usuario de prueba
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

    // Hacer login para obtener token
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ 
        email: 'testuser@example.com', 
        password: 'Test1234' 
      });
    authToken = loginRes.body.token;

    // ID de conversación de prueba
    testConversacionId = new mongoose.Types.ObjectId().toString();

    // Crear mock del mensaje después de tener testUserId
    mockMensaje = {
      _id: new mongoose.Types.ObjectId().toString(),
      remitente: testUserId,
      destinatario: new mongoose.Types.ObjectId().toString(),
      contenido: 'Test message content',
      tipo: 'texto',
      estado: 'enviado',
      prioridad: 'normal',
      categoria: 'general',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  describe('POST /api/messaging/mensajes', () => {
    it('debería crear un mensaje exitosamente', async () => {
      const mensajeData = {
        destinatario: new mongoose.Types.ObjectId().toString(),
        contenido: 'Test message',
        tipo: 'texto' as const,
        prioridad: 'normal' as const,
        categoria: 'general' as const
      };

      mockMensajeService.crearMensajeService.mockResolvedValue(mockMensaje);

      const res = await request(app)
        .post('/api/messaging/mensajes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mensajeData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('mensaje');
      expect(mockMensajeService.crearMensajeService).toHaveBeenCalledWith(
        expect.objectContaining({
          destinatario: expect.any(String),
          contenido: 'Test message',
          tipo: 'texto',
          prioridad: 'normal',
          categoria: 'general'
        })
      );
    });

    it('debería fallar sin token de autorización', async () => {
      const mensajeData = {
        conversacionId: testConversacionId,
        contenido: 'Test message',
        tipo: 'texto' as const
      };

      const res = await request(app)
        .post('/api/messaging/mensajes')
        .send(mensajeData);

      expect(res.statusCode).toEqual(401);
    });

    it('debería fallar con datos inválidos', async () => {
      const mensajeData = {
        destinatario: 'invalid-id',
        contenido: '',
        tipo: 'invalid-type' as unknown
      };

      const res = await request(app)
        .post('/api/messaging/mensajes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mensajeData);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/messaging/mensajes/:id', () => {
    it('debería obtener un mensaje por ID exitosamente', async () => {
      const mensajeId = mockMensaje._id.toString();
      mockMensajeService.obtenerMensajePorIdService.mockResolvedValue(mockMensaje);

      const res = await request(app)
        .get(`/api/messaging/mensajes/${mensajeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('mensaje');
      expect(mockMensajeService.obtenerMensajePorIdService).toHaveBeenCalledWith(mensajeId);
    });

    it('debería fallar con ID inválido', async () => {
      // Mock del servicio para que devuelva error
      mockMensajeService.obtenerMensajePorIdService.mockRejectedValue(new Error('ID inválido'));

      const res = await request(app)
        .get('/api/messaging/mensajes/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(500);
    });

    it('debería fallar sin token de autorización', async () => {
      const mensajeId = mockMensaje._id.toString();
      const res = await request(app)
        .get(`/api/messaging/mensajes/${mensajeId}`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/messaging/mensajes', () => {
    it('debería obtener mensajes con filtros exitosamente', async () => {
      const filtros = {
        destinatario: new mongoose.Types.ObjectId().toString(),
        remitente: testUserId,
        estado: 'enviado'
      };

      mockMensajeService.obtenerMensajesService.mockResolvedValue({
        mensajes: [mockMensaje],
        total: 1,
        limit: 20,
        offset: 0
      });

      const res = await request(app)
        .get('/api/messaging/mensajes')
        .set('Authorization', `Bearer ${authToken}`)
        .query(filtros);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('mensajes');
      expect(res.body).toHaveProperty('total', 1);
      expect(mockMensajeService.obtenerMensajesService).toHaveBeenCalledWith(
        expect.objectContaining({
          destinatario: expect.any(String),
          remitente: testUserId,
          estado: 'enviado',
          limit: 20,
          offset: 0
        })
      );
    });

    it('debería fallar sin token de autorización', async () => {
      const res = await request(app)
        .get('/api/messaging/mensajes');

      expect(res.statusCode).toEqual(401);
    });
  });



  describe('DELETE /api/messaging/mensajes/:id', () => {
    it('debería eliminar un mensaje exitosamente', async () => {
      const mensajeId = mockMensaje._id.toString();
      mockMensajeService.eliminarMensajeService.mockResolvedValue(true);

      const res = await request(app)
        .delete(`/api/messaging/mensajes/${mensajeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Mensaje eliminado exitosamente');
      expect(mockMensajeService.eliminarMensajeService).toHaveBeenCalledWith(mensajeId, testUserId);
    });

    it('debería fallar con ID inválido', async () => {
      // Mock del servicio para que devuelva error
      mockMensajeService.obtenerMensajePorIdService.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/messaging/mensajes/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(404);
    });

    it('debería fallar sin token de autorización', async () => {
      const mensajeId = mockMensaje._id.toString();
      const res = await request(app)
        .delete(`/api/messaging/mensajes/${mensajeId}`);

      expect(res.statusCode).toEqual(401);
    });
  });
});
