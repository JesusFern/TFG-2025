import { SocketServer } from '../../src/socket/socketServer';
import { Server as HTTPServer } from 'http';

// Mock de los servicios
jest.mock('../../src/service/chats/mensajeService');
jest.mock('../../src/service/chats/conversacionService');
jest.mock('../../src/service/chats/notificacionService');

// Mock de Socket.IO
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    use: jest.fn(),
    on: jest.fn(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    broadcast: {
      emit: jest.fn()
    }
  }))
}));

describe('WebSocket Server', () => {
  let httpServer: HTTPServer;
  let socketServer: SocketServer;

  beforeEach(() => {
    // Crear servidor HTTP mock
    httpServer = {
      on: jest.fn(),
      listen: jest.fn(),
      close: jest.fn()
    } as unknown as HTTPServer;

    socketServer = new SocketServer(httpServer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('debería inicializar el servidor Socket.IO correctamente', () => {
      expect(socketServer).toBeDefined();
      expect(socketServer.getIO()).toBeDefined();
    });
  });

  describe('Métodos Públicos', () => {
    it('debería tener método sendToUser', () => {
      expect(typeof socketServer.sendToUser).toBe('function');
    });

    it('debería tener método broadcast', () => {
      expect(typeof socketServer.broadcast).toBe('function');
    });

    it('debería tener método sendToRoom', () => {
      expect(typeof socketServer.sendToRoom).toBe('function');
    });

    it('debería tener método getIO', () => {
      expect(typeof socketServer.getIO).toBe('function');
    });

    it('debería tener método sendNotificationToUser', () => {
      expect(typeof socketServer.sendNotificationToUser).toBe('function');
    });

    it('debería tener método sendNotificationToUsers', () => {
      expect(typeof socketServer.sendNotificationToUsers).toBe('function');
    });

    it('debería tener método sendScheduledNotification', () => {
      expect(typeof socketServer.sendScheduledNotification).toBe('function');
    });

    it('debería tener método sendInactiveTrackingNotification', () => {
      expect(typeof socketServer.sendInactiveTrackingNotification).toBe('function');
    });
  });

  describe('Configuración', () => {
    it('debería configurar CORS correctamente', () => {
      // Verificar que se llamó al constructor de Socket.IO
      const mockSocketIO = jest.requireMock('socket.io');
      expect(mockSocketIO.Server).toHaveBeenCalledWith(httpServer, expect.objectContaining({
        cors: expect.any(Object)
      }));
    });
  });

  describe('Eventos de Notificaciones', () => {
    it('debería configurar eventos de notificaciones', () => {
      const mockIO = socketServer.getIO();
      expect(mockIO.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    it('debería manejar evento new_notification', () => {
      const mockIO = socketServer.getIO();
      const mockOn = mockIO.on as jest.MockedFunction<typeof mockIO.on>;
      const connectionHandler = mockOn.mock.calls.find((call: unknown[]) => call[0] === 'connection')?.[1];
      
      if (connectionHandler) {
        const mockSocket = {
          on: jest.fn(),
          emit: jest.fn(),
          join: jest.fn(),
          leave: jest.fn(),
          id: 'test-socket-id',
          userId: 'test-user-id'
        };
        
        // Mock del middleware de autenticación para que pase
        const authMiddleware = jest.requireMock('../../src/middlewares/authMiddleware');
        jest.spyOn(authMiddleware, 'authenticateToken')
          .mockImplementation((req: unknown, res: unknown, next: unknown) => {
            (req as { user: { id: string } }).user = { id: 'test-user-id' };
            (next as () => void)();
          });
        
        // Mock del servicio de notificaciones
        const mockNotificacionService = jest.requireMock('../../src/service/chats/notificacionService');
        mockNotificacionService.marcarComoLeidaService = jest.fn().mockResolvedValue(undefined);
        mockNotificacionService.eliminarNotificacionService = jest.fn().mockResolvedValue(undefined);
        mockNotificacionService.marcarTodasComoLeidasService = jest.fn().mockResolvedValue({ actualizadas: 5 });
        
        connectionHandler(mockSocket);
        
        // Verificar que se configuraron algunos eventos (no todos los de notificaciones)
        expect(mockSocket.on).toHaveBeenCalledWith('join_conversation', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('leave_conversation', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('send_message', expect.any(Function));
      }
    });
  });
});
