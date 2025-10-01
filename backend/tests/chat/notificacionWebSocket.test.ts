import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';
import { INotificacion } from '../../src/models/chats';

// Mock de los servicios
jest.mock('../../src/service/chats/notificacionService');

const mockNotificacionService = jest.requireMock('../../src/service/chats/notificacionService');

describe('Notificaciones WebSocket', () => {
  let authToken: string;
  let testUserId: string;
  let mockNotificacion: INotificacion;

  beforeAll(async () => {
    // Crear usuario de prueba
    const testUser = await User.create({
      fullName: "Test User WebSocket",
      email: "testuserws@example.com",
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
        email: 'testuserws@example.com', 
        password: 'Test1234' 
      });
    authToken = loginRes.body.token;

    // Crear mock de la notificación
    mockNotificacion = {
      _id: new mongoose.Types.ObjectId().toString(),
      usuario: testUserId,
      tipo: 'sistema',
      titulo: 'Test WebSocket notification',
      contenido: 'Test WebSocket notification content',
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

  afterAll(async () => {
    await User.deleteMany({});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Envío de notificaciones en tiempo real', () => {
    it('debería obtener notificaciones no leídas', async () => {
      // Mock del servicio
      mockNotificacionService.obtenerNotificacionesService.mockResolvedValue({
        notificaciones: [mockNotificacion],
        total: 1,
        limit: 10,
        offset: 0
      });

      const res = await request(app)
        .get('/api/messaging/notificaciones/no-leidas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('notificaciones');
      
      // Verificar que se llamó al servicio
      expect(mockNotificacionService.obtenerNotificacionesService).toHaveBeenCalledWith(
        testUserId,
        expect.objectContaining({
          limit: 10,
          offset: 0,
          leida: false,
          orden: 'desc'
        })
      );
    });

    it('debería marcar notificación como leída via WebSocket', async () => {
      const notificacionId = mockNotificacion._id;
      
      // Mock del servicio
      mockNotificacionService.marcarComoLeidaService.mockResolvedValue(undefined);

      const res = await request(app)
        .put(`/api/messaging/notificaciones/${notificacionId}/leer`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(mockNotificacionService.marcarComoLeidaService).toHaveBeenCalledWith(notificacionId, testUserId);
    });

    it('debería eliminar notificación via WebSocket', async () => {
      const notificacionId = mockNotificacion._id;
      
      // Mock del servicio
      mockNotificacionService.eliminarNotificacionService.mockResolvedValue(undefined);

      const res = await request(app)
        .delete(`/api/messaging/notificaciones/${notificacionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(mockNotificacionService.eliminarNotificacionService).toHaveBeenCalledWith(notificacionId, testUserId);
    });

    it('debería marcar todas las notificaciones como leídas via WebSocket', async () => {
      // Mock del servicio
      mockNotificacionService.marcarTodasComoLeidasService.mockResolvedValue({ actualizadas: 5 });

      const res = await request(app)
        .put('/api/messaging/notificaciones/leer-todas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(mockNotificacionService.marcarTodasComoLeidasService).toHaveBeenCalledWith(testUserId);
    });
  });

  describe('Tipos de notificaciones específicas', () => {
    it('debería obtener notificaciones filtradas por tipo nutricion', async () => {
      const notificacionNutricion = {
        ...mockNotificacion,
        tipo: 'nutricion',
        titulo: 'Nueva dieta disponible',
        prioridad: 'alta'
      };

      mockNotificacionService.obtenerNotificacionesService.mockResolvedValue({
        notificaciones: [notificacionNutricion],
        total: 1,
        limit: 20,
        offset: 0
      });

      const res = await request(app)
        .get('/api/messaging/notificaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ tipo: 'nutricion' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.notificaciones[0].tipo).toBe('nutricion');
    });

    it('debería obtener notificaciones filtradas por tipo entrenamiento', async () => {
      const notificacionEntrenamiento = {
        ...mockNotificacion,
        tipo: 'entrenamiento',
        titulo: 'Nuevo plan de entrenamiento disponible',
        prioridad: 'alta'
      };

      mockNotificacionService.obtenerNotificacionesService.mockResolvedValue({
        notificaciones: [notificacionEntrenamiento],
        total: 1,
        limit: 20,
        offset: 0
      });

      const res = await request(app)
        .get('/api/messaging/notificaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ tipo: 'entrenamiento' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.notificaciones[0].tipo).toBe('entrenamiento');
    });

    it('debería obtener notificaciones filtradas por tipo mensaje', async () => {
      const notificacionMensaje = {
        ...mockNotificacion,
        tipo: 'mensaje',
        titulo: 'Nuevo mensaje'
      };

      mockNotificacionService.obtenerNotificacionesService.mockResolvedValue({
        notificaciones: [notificacionMensaje],
        total: 1,
        limit: 20,
        offset: 0
      });

      const res = await request(app)
        .get('/api/messaging/notificaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ tipo: 'mensaje' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.notificaciones[0].tipo).toBe('mensaje');
    });

    it('debería obtener notificaciones filtradas por tipo recordatorio', async () => {
      const notificacionRecordatorio = {
        ...mockNotificacion,
        tipo: 'recordatorio',
        titulo: 'Recordatorio de sesión',
        prioridad: 'urgente'
      };

      mockNotificacionService.obtenerNotificacionesService.mockResolvedValue({
        notificaciones: [notificacionRecordatorio],
        total: 1,
        limit: 20,
        offset: 0
      });

      const res = await request(app)
        .get('/api/messaging/notificaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ tipo: 'recordatorio' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.notificaciones[0].tipo).toBe('recordatorio');
    });
  });

  describe('Estadísticas de notificaciones', () => {
    it('debería obtener estadísticas de notificaciones', async () => {
      const mockStats = {
        total: 10,
        noLeidas: 3,
        porTipo: {
          mensaje: 4,
          sistema: 2,
          recordatorio: 2,
          entrenamiento: 1,
          nutricion: 1
        },
        porPrioridad: {
          baja: 2,
          normal: 5,
          alta: 2,
          urgente: 1
        }
      };

      mockNotificacionService.obtenerEstadisticasService.mockResolvedValue(mockStats);

      const res = await request(app)
        .get('/api/messaging/notificaciones/estadisticas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockStats);
      expect(mockNotificacionService.obtenerEstadisticasService).toHaveBeenCalledWith(testUserId);
    });
  });
});
