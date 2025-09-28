import { Request, Response } from 'express';
import { 
  getGoogleAuthUrl,
  handleGoogleCallback,
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  disconnectGoogleCalendar,
  getCalendarStatus
} from '../../src/controllers/google/calendarController';

// Mock de User
const mockUser = {
  select: jest.fn(() => ({
    lean: jest.fn(() => Promise.resolve({
      google: { calendarConnected: true, refreshToken: 'test-token' }
    }))
  })),
  lean: jest.fn(() => Promise.resolve({
    _id: 'test-user-id',
    email: 'test@example.com',
    google: { refreshToken: 'test-refresh-token' }
  }))
};

jest.mock('../../src/models/users/user', () => ({
  findById: jest.fn(() => mockUser),
  findByIdAndUpdate: jest.fn(() => Promise.resolve({})),
  findByIdAndDelete: jest.fn(() => Promise.resolve({}))
}));

// Mock del servicio de Google Calendar
jest.mock('../../src/services/google/googleClient', () => ({
  GoogleCalendarService: {
    getAuthUrl: jest.fn(() => 'https://accounts.google.com/o/oauth2/auth?test=true'),
    getTokensFromCode: jest.fn(() => Promise.resolve({
      refresh_token: 'test-refresh-token',
      access_token: 'test-access-token',
      expiry_date: Date.now() + 3600000
    })),
    getCalendarClientWithRefresh: jest.fn(() => ({
      calendarList: {
        list: jest.fn(() => Promise.resolve({
          data: {
            items: [
              {
                id: 'primary',
                summary: 'Calendario Principal',
                accessRole: 'owner'
              }
            ]
          }
        }))
      },
      events: {
        list: jest.fn(() => Promise.resolve({
          data: {
            items: [
              {
                id: 'test-event-1',
                summary: 'Evento de Prueba',
                description: 'Descripción del evento',
                start: { dateTime: '2024-12-20T10:00:00Z' },
                end: { dateTime: '2024-12-20T11:00:00Z' },
                location: 'Gimnasio',
                attendees: [{ email: 'test@example.com', responseStatus: 'accepted' }],
                creator: { email: 'test@example.com' },
                organizer: { email: 'test@example.com' },
                htmlLink: 'https://calendar.google.com/event?eid=test'
              }
            ]
          }
        })),
        insert: jest.fn(() => Promise.resolve({
          data: {
            id: 'new-event-id',
            summary: 'Nuevo Evento',
            description: 'Descripción del nuevo evento',
            start: { dateTime: '2024-12-20T10:00:00Z' },
            end: { dateTime: '2024-12-20T11:00:00Z' },
            location: 'Gimnasio',
            htmlLink: 'https://calendar.google.com/event?eid=new'
          }
        })),
        update: jest.fn(() => Promise.resolve({
          data: {
            id: 'updated-event-id',
            summary: 'Evento Actualizado',
            description: 'Descripción actualizada',
            start: { dateTime: '2024-12-20T14:00:00Z' },
            end: { dateTime: '2024-12-20T15:00:00Z' },
            location: 'Gimnasio Principal',
            htmlLink: 'https://calendar.google.com/event?eid=updated'
          }
        })),
        delete: jest.fn(() => Promise.resolve({}))
      }
    }))
  }
}));

describe('Google Calendar Controllers', () => {
  let mockRequest: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      user: { id: 'test-user-id', email: 'test@example.com' },
      query: {},
      params: {},
      body: {}
    };
    
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getGoogleAuthUrl', () => {
    it('debería devolver la URL de autenticación', async () => {
      await getGoogleAuthUrl(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        authUrl: 'https://accounts.google.com/o/oauth2/auth?test=true'
      });
    });
  });

  describe('handleGoogleCallback', () => {
    it('debería procesar el callback correctamente', async () => {
      mockRequest.query = { code: 'test-auth-code' };

      await handleGoogleCallback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Google Calendar conectado exitosamente',
        connected: true
      });
    });

    it('debería devolver error si no hay código', async () => {
      mockRequest.query = {};

      await handleGoogleCallback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Código de autorización o usuario no encontrado'
      });
    });
  });

  describe('getCalendarStatus', () => {
    it('debería devolver el estado de conexión', async () => {
      await getCalendarStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        connected: true,
        hasRefreshToken: true
      });
    });
  });

  describe('getCalendarEvents', () => {
    it('debería devolver los eventos del calendario', async () => {
      await getCalendarEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          expect.objectContaining({
            id: 'test-event-1',
            title: 'Evento de Prueba'
          })
        ]),
        total: 1
      });
    });

    it('debería devolver error si no está conectado', async () => {
      // Configurar mock para usuario sin Google Calendar
      mockUser.lean.mockResolvedValueOnce({ google: null } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await getCalendarEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Google Calendar no está conectado'
      });
    });
  });

  describe('createCalendarEvent', () => {
    it('debería crear un evento correctamente', async () => {
      mockRequest.body = {
        title: 'Evento de Prueba',
        description: 'Descripción',
        start: '2024-12-20T10:00:00Z',
        end: '2024-12-20T11:00:00Z',
        location: 'Gimnasio',
        attendees: ['test@example.com']
      };

      await createCalendarEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Evento creado exitosamente',
        event: expect.objectContaining({
          id: 'new-event-id',
          title: 'Nuevo Evento'
        })
      });
    });

    it('debería devolver error si faltan campos requeridos', async () => {
      mockRequest.body = {
        title: 'Evento sin fecha'
        // Faltan start y end
      };

      await createCalendarEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Título, fecha de inicio y fecha de fin son requeridos'
      });
    });
  });

  describe('updateCalendarEvent', () => {
    it('debería actualizar un evento correctamente', async () => {
      mockRequest.params = { eventId: 'test-event-1' };
      mockRequest.body = {
        title: 'Evento Actualizado',
        description: 'Descripción actualizada',
        start: '2024-12-20T14:00:00Z',
        end: '2024-12-20T15:00:00Z',
        location: 'Gimnasio Principal',
        attendees: ['test@example.com']
      };

      await updateCalendarEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Evento actualizado exitosamente',
        event: expect.objectContaining({
          id: 'updated-event-id',
          title: 'Evento Actualizado'
        })
      });
    });
  });

  describe('deleteCalendarEvent', () => {
    it('debería eliminar un evento correctamente', async () => {
      mockRequest.params = { eventId: 'test-event-1' };

      await deleteCalendarEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Evento eliminado exitosamente',
        eventId: 'test-event-1'
      });
    });
  });

  describe('disconnectGoogleCalendar', () => {
    it('debería desconectar Google Calendar correctamente', async () => {
      await disconnectGoogleCalendar(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Google Calendar desconectado exitosamente',
        connected: false
      });
    });
  });
});
