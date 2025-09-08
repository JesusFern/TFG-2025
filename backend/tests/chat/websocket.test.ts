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
    join: jest.fn(),
    leave: jest.fn(),
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
});
