import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';
import { IConversacion } from '../../src/models/chats';

// Mock de los servicios
jest.mock('../../src/service/chats/conversacionService');

const mockConversacionService = jest.requireMock('../../src/service/chats/conversacionService');

describe('Conversacion API Endpoints', () => {
  let authToken: string;
  let testUserId: string;
  let testUserId2: string;



  afterAll(async () => {
    await User.deleteMany({});
  });

  let mockConversacion: IConversacion;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Resetear mocks específicos a valores por defecto
    mockConversacionService.obtenerConversacionPorIdService.mockResolvedValue(mockConversacion);
    mockConversacionService.obtenerConversacionesService.mockResolvedValue({
      conversaciones: [mockConversacion],
      total: 1,
      limit: 20,
      offset: 0
    });
  });

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

    // Crear mock de la conversación después de tener testUserId
    mockConversacion = {
      _id: new mongoose.Types.ObjectId().toString(),
      participantes: [
        {
          _id: testUserId,
          fullName: "Test User",
          email: "testuser@example.com",
          role: "user"
        },
        {
          _id: testUserId2,
          fullName: "Test User 2",
          email: "testuser2@example.com",
          role: "user"
        }
      ],
      ultimoMensaje: new mongoose.Types.ObjectId().toString(),
      ultimoMensajeContenido: 'Test message',
      ultimoMensajeFecha: new Date(),
      ultimoMensajeRemitente: testUserId,
      mensajesNoLeidos: new Map([[testUserId, 0], [testUserId2, 1]]),
      activa: true,
      metadata: {
        tipo: 'general'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  describe('GET /api/messaging/conversaciones/:id', () => {
    it('debería obtener una conversación por ID exitosamente', async () => {
      const conversacionId = mockConversacion._id;
      mockConversacionService.obtenerConversacionPorIdService.mockResolvedValue(mockConversacion);

      const res = await request(app)
        .get(`/api/messaging/conversaciones/${conversacionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('conversacion');
      expect(mockConversacionService.obtenerConversacionPorIdService).toHaveBeenCalledWith(conversacionId);
    });

    it('debería fallar con ID inválido', async () => {
      // Mock del servicio para que devuelva error
      mockConversacionService.obtenerConversacionPorIdService.mockRejectedValue(new Error('ID inválido'));

      const res = await request(app)
        .get('/api/messaging/conversaciones/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(500);
    });

    it('debería fallar sin token de autorización', async () => {
      const conversacionId = mockConversacion._id;
      const res = await request(app)
        .get(`/api/messaging/conversaciones/${conversacionId}`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/messaging/conversaciones', () => {
    it('debería obtener conversaciones con filtros exitosamente', async () => {
      const filtros = {
        activa: true
      };

      mockConversacionService.obtenerConversacionesService.mockResolvedValue({
        conversaciones: [mockConversacion],
        total: 1,
        limit: 20,
        offset: 0
      });

      const res = await request(app)
        .get('/api/messaging/conversaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .query(filtros);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('conversaciones');
      expect(res.body.conversaciones).toHaveLength(1);
      expect(mockConversacionService.obtenerConversacionesService).toHaveBeenCalledWith(
        expect.objectContaining({
          participante: testUserId,
          activa: true,
          limit: 20,
          offset: 0
        })
      );
    });

    it('debería fallar sin token de autorización', async () => {
      const res = await request(app)
        .get('/api/messaging/conversaciones');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/messaging/conversaciones/by-user/:usuarioId', () => {
    it('debería obtener conversaciones del usuario exitosamente', async () => {
      mockConversacionService.obtenerConversacionesUsuarioService.mockResolvedValue([mockConversacion]);

      const res = await request(app)
        .get(`/api/messaging/conversaciones/by-user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 20 });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('conversaciones');
      expect(res.body.conversaciones).toHaveLength(1);
      expect(mockConversacionService.obtenerConversacionesUsuarioService).toHaveBeenCalledWith(testUserId, 20);
    });

    it('debería fallar si el usuario intenta obtener conversaciones de otro usuario', async () => {
      const res = await request(app)
        .get(`/api/messaging/conversaciones/by-user/${testUserId2}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'No puedes obtener conversaciones de otro usuario');
    });

    it('debería fallar sin token de autorización', async () => {
      const res = await request(app)
        .get(`/api/messaging/conversaciones/by-user/${testUserId}`);

      expect(res.statusCode).toEqual(401);
    });

    it('debería usar límite por defecto si no se especifica', async () => {
      mockConversacionService.obtenerConversacionesUsuarioService.mockResolvedValue([]);

      const res = await request(app)
        .get(`/api/messaging/conversaciones/by-user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(mockConversacionService.obtenerConversacionesUsuarioService).toHaveBeenCalledWith(testUserId, 20);
    });
  });


});
