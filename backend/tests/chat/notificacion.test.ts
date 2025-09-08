import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';
import { INotificacion } from '../../src/models/chats';

// Mock de los servicios
jest.mock('../../src/service/chats/notificacionService');

const mockNotificacionService = jest.requireMock('../../src/service/chats/notificacionService');

describe('Notificacion API Endpoints', () => {
  let authToken: string;
  let testUserId: string;



  afterAll(async () => {
    await User.deleteMany({});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Resetear mocks específicos a valores por defecto
    mockNotificacionService.obtenerNotificacionPorIdService.mockResolvedValue(mockNotificacion);
    mockNotificacionService.obtenerNotificacionesService.mockResolvedValue({
      notificaciones: [mockNotificacion],
      total: 1,
      limit: 20,
      offset: 0
    });
    mockNotificacionService.eliminarNotificacionService.mockResolvedValue(undefined);
  });

  let mockNotificacion: INotificacion;

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

    // Crear mock de la notificación después de tener testUserId
    mockNotificacion = {
      _id: new mongoose.Types.ObjectId().toString(),
      usuario: testUserId,
      tipo: 'mensaje',
      titulo: 'Test notification',
      contenido: 'Test notification content',
      prioridad: 'normal',
      leida: false,
      enviada: true,
      accion: {
        tipo: 'navegar',
        url: '/test'
      },
      metadata: {
        remitente: testUserId
      },
      programadoPara: undefined,
      expiraEn: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  describe('POST /api/messaging/notificaciones', () => {
    it('debería crear una notificación exitosamente', async () => {
      const notificacionData = {
        usuario: testUserId,
        tipo: 'mensaje' as const,
        titulo: 'Test notification',
        contenido: 'Test notification content',
        prioridad: 'normal' as const
      };

      mockNotificacionService.crearNotificacionService.mockResolvedValue(mockNotificacion);

      const res = await request(app)
        .post('/api/messaging/notificaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificacionData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('notificacion');
      expect(mockNotificacionService.crearNotificacionService).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: testUserId,
          tipo: 'mensaje',
          titulo: 'Test notification',
          contenido: 'Test notification content',
          prioridad: 'normal'
        })
      );
    });

    it('debería fallar sin token de autorización', async () => {
      const notificacionData = {
        usuario: testUserId,
        tipo: 'mensaje' as const,
        titulo: 'Test notification',
        contenido: 'Test notification content'
      };

      const res = await request(app)
        .post('/api/messaging/notificaciones')
        .send(notificacionData);

      expect(res.statusCode).toEqual(401);
    });

    it('debería fallar con datos inválidos', async () => {
      const notificacionData = {
        usuario: 'invalid-id',
        tipo: 'invalid-type' as unknown,
        titulo: '',
        contenido: ''
      };

      // Mock del servicio para que devuelva error
      mockNotificacionService.crearNotificacionService.mockRejectedValue(new Error('Datos inválidos'));

      const res = await request(app)
        .post('/api/messaging/notificaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificacionData);

      expect(res.statusCode).toEqual(500);
    });
  });

  describe('GET /api/messaging/notificaciones/:id', () => {
    it('debería obtener una notificación por ID exitosamente', async () => {
      const notificacionId = mockNotificacion._id;
      mockNotificacionService.obtenerNotificacionPorIdService.mockResolvedValue(mockNotificacion);

      const res = await request(app)
        .get(`/api/messaging/notificaciones/${notificacionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('notificacion');
      expect(mockNotificacionService.obtenerNotificacionPorIdService).toHaveBeenCalledWith(notificacionId);
    });

    it('debería fallar con ID inválido', async () => {
      // Mock del servicio para que devuelva error
      mockNotificacionService.obtenerNotificacionPorIdService.mockRejectedValue(new Error('ID inválido'));

      const res = await request(app)
        .get('/api/messaging/notificaciones/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(500);
    });

    it('debería fallar sin token de autorización', async () => {
      const notificacionId = mockNotificacion._id;
      const res = await request(app)
        .get(`/api/messaging/notificaciones/${notificacionId}`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/messaging/notificaciones', () => {
    it('debería obtener notificaciones con filtros exitosamente', async () => {
      const filtros = {
        tipo: 'mensaje',
        leida: false,
        prioridad: 'normal'
      };

      mockNotificacionService.obtenerNotificacionesService.mockResolvedValue({
        notificaciones: [mockNotificacion],
        total: 1,
        limit: 20,
        offset: 0
      });

      const res = await request(app)
        .get('/api/messaging/notificaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .query(filtros);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('notificaciones');
      expect(res.body).toHaveProperty('total', 1);
      expect(mockNotificacionService.obtenerNotificacionesService).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: testUserId,
          tipo: 'mensaje',
          leida: false,
          prioridad: 'normal',
          limit: 20,
          offset: 0
        })
      );
    });

    it('debería fallar sin token de autorización', async () => {
      const res = await request(app)
        .get('/api/messaging/notificaciones');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('DELETE /api/messaging/notificaciones/:id', () => {
    it('debería eliminar una notificación exitosamente', async () => {
      const notificacionId = mockNotificacion._id;
      mockNotificacionService.eliminarNotificacionService.mockResolvedValue(undefined);

      const res = await request(app)
        .delete(`/api/messaging/notificaciones/${notificacionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Notificación eliminada exitosamente');
      expect(mockNotificacionService.eliminarNotificacionService).toHaveBeenCalledWith(notificacionId, testUserId);
    });

    it('debería fallar con ID inválido', async () => {
      // Mock del servicio para que devuelva error
      mockNotificacionService.obtenerNotificacionPorIdService.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/messaging/notificaciones/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(404);
    });

    it('debería fallar sin token de autorización', async () => {
      const notificacionId = mockNotificacion._id;
      const res = await request(app)
        .delete(`/api/messaging/notificaciones/${notificacionId}`);

      expect(res.statusCode).toEqual(401);
    });
  });
});
