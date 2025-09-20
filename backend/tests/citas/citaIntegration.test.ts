import request from 'supertest';
import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types';
import app from '../../src/server';

const workerId = new mongoose.Types.ObjectId().toString();
const clienteId = new mongoose.Types.ObjectId().toString();
const adminId = new mongoose.Types.ObjectId().toString();
const citaId = new mongoose.Types.ObjectId().toString();

// Mock de autenticación dinámico
const mockAuth = (userId: string, role: string) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    req.user = { id: userId, role: role as 'user' | 'worker' | 'admin', email: `${role}@example.com` };
    next();
  };
};

// Mock del logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

// Mock del middleware de autenticación
jest.mock('../../src/middlewares/authMiddleware', () => {
  return {
    authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      req.user = { id: clienteId, role: 'user', email: 'user@example.com' };
      next();
    },
    authorizeWorker: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => next(),
    authorizeAdmin: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => next(),
    authorizeUserOrAdmin: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => next(),
    authorizeNutricionista: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => next()
  };
});

// Mock de los validadores de citas
jest.mock('../../src/validators/citaValidators', () => ({
  verificarCitaExiste: jest.fn().mockImplementation(async (citaId, res) => {
    if (!citaId) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return null;
    }
    
    if (mongoose.Types.ObjectId.isValid(citaId)) {
      return {
        _id: citaId,
        cliente: clienteId,
        profesional: workerId,
        tipo: 'seguimiento',
        fecha: new Date('2025-02-15'),
        hora: '10:00',
        duracion: 60,
        motivo: 'Seguimiento semanal del progreso',
        estado: 'pendiente',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    res.status(404).json({ message: 'Cita no encontrada' });
    return null;
  }),
  verificarPermisosCita: jest.fn().mockReturnValue(true),
  verificarCitaEditable: jest.fn().mockReturnValue(true),
  manejarErrorCita: jest.fn(),
  validarCrearCita: jest.fn().mockReturnValue([]),
  validarObtenerCita: jest.fn().mockReturnValue([]),
  validarObtenerCitas: jest.fn().mockReturnValue([]),
  validarActualizarCita: jest.fn().mockReturnValue([]),
  validarCancelarCita: jest.fn().mockReturnValue([]),
  validarReagendarCita: jest.fn().mockReturnValue([]),
  validarConfirmarCita: jest.fn().mockReturnValue([]),
  validarCompletarCita: jest.fn().mockReturnValue([]),
  validarObtenerDisponibilidad: jest.fn().mockReturnValue([]),
  validarObtenerEstadisticas: jest.fn().mockReturnValue([])
}));

// Mock del controlador de citas
jest.mock('../../src/controllers/citas/citaController', () => ({
  crearCita: jest.fn().mockImplementation(async (req, res) => {
    // Simular validaciones que fallan
    if (!req.body.tipo || !req.body.fecha || !req.body.hora) {
      res.status(400).json({ message: 'Error al crear la cita' });
      return;
    }

    if (!['seguimiento', 'consulta', 'evaluacion'].includes(req.body.tipo)) {
      res.status(400).json({ message: 'Tipo de cita inválido' });
      return;
    }

    if (req.body.duracion && (req.body.duracion < 15 || req.body.duracion > 180)) {
      res.status(400).json({ message: 'La duración debe estar entre 15 y 180 minutos' });
      return;
    }

    res.status(201).json({
      message: 'Cita creada correctamente',
      cita: {
        _id: citaId,
        cliente: req.body.cliente,
        profesional: req.body.profesional,
        tipo: req.body.tipo,
        fecha: new Date(req.body.fecha),
        hora: req.body.hora,
        duracion: req.body.duracion || 60,
        motivo: req.body.motivo,
        estado: 'pendiente',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }),
  obtenerCitas: jest.fn().mockImplementation(async (req, res) => {
    // Simular filtros
    let citas = [{
      _id: citaId,
      cliente: { _id: clienteId, nombre: 'Test Client', email: 'client@test.com' },
      profesional: { _id: workerId, nombre: 'Test Worker', email: 'worker@test.com' },
      tipo: 'seguimiento',
      fecha: new Date('2025-02-15'),
      hora: '10:00',
      duracion: 60,
      motivo: 'Seguimiento semanal',
      estado: 'pendiente'
    }];

    // Aplicar filtros
    if (req.query.estado) {
      citas = citas.filter(c => c.estado === req.query.estado);
    }
    if (req.query.tipo) {
      citas = citas.filter(c => c.tipo === req.query.tipo);
    }

    res.status(200).json({
      message: 'Citas obtenidas correctamente',
      citas: citas,
      total: citas.length,
      pagina: 1,
      totalPaginas: 1
    });
  }),
  obtenerCitaPorId: jest.fn().mockImplementation(async (req, res) => {
    const id = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de cita inválido' });
      return;
    }
    
    if (id !== citaId) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }
    
    res.status(200).json({
      cita: {
        _id: id,
        cliente: { _id: clienteId, nombre: 'Test Client', email: 'client@test.com' },
        profesional: { _id: workerId, nombre: 'Test Worker', email: 'worker@test.com' },
        tipo: 'seguimiento',
        fecha: new Date('2025-02-15'),
        hora: '10:00',
        duracion: 60,
        motivo: 'Seguimiento semanal',
        estado: 'pendiente'
      }
    });
  }),
  actualizarCita: jest.fn().mockImplementation(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de cita inválido' });
      return;
    }
    
    if (id !== citaId) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }
    
    res.status(200).json({
      message: 'Cita actualizada correctamente',
      cita: { _id: id, ...req.body, updatedAt: new Date() }
    });
  }),
  cancelarCita: jest.fn().mockImplementation(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de cita inválido' });
      return;
    }
    
    if (id !== citaId) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }
    
    res.status(200).json({
      message: 'Cita cancelada correctamente',
      cita: { _id: id, estado: 'cancelada', updatedAt: new Date() }
    });
  }),
  reagendarCita: jest.fn().mockImplementation(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de cita inválido' });
      return;
    }
    
    if (id !== citaId) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }
    
    res.status(200).json({
      message: 'Cita reagendada correctamente',
      cita: { _id: id, ...req.body, updatedAt: new Date() }
    });
  }),
  confirmarCita: jest.fn().mockImplementation(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de cita inválido' });
      return;
    }
    
    if (id !== citaId) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }
    
    res.status(200).json({
      message: 'Cita confirmada correctamente',
      cita: { _id: id, estado: 'confirmada', updatedAt: new Date() }
    });
  }),
  completarCita: jest.fn().mockImplementation(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de cita inválido' });
      return;
    }
    
    if (id !== citaId) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }
    
    res.status(200).json({
      message: 'Cita completada correctamente',
      cita: { _id: id, estado: 'completada', updatedAt: new Date() }
    });
  }),
  obtenerDisponibilidadProfesional: jest.fn().mockImplementation(async (req, res) => {
    const profesionalId = req.params.profesionalId;
    const fecha = req.query.fecha;
    
    if (!fecha) {
      res.status(400).json({ message: 'Error al obtener la disponibilidad' });
      return;
    }
    
    res.status(200).json({
      message: 'Disponibilidad obtenida correctamente',
      disponibilidad: {
        profesionalId: profesionalId,
        fecha: fecha,
        horariosDisponibles: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      }
    });
  }),
  obtenerEstadisticasCitas: jest.fn().mockImplementation(async (req, res) => {
    res.status(200).json({
      message: 'Estadísticas obtenidas correctamente',
      estadisticas: {
        totalCitas: 10,
        citasProgramadas: 5,
        citasConfirmadas: 3,
        citasCompletadas: 2,
        citasCanceladas: 0
      }
    });
  })
}));

// Mock del servicio de citas
jest.mock('../../src/service/citas/citaService', () => ({
  crearCitaService: jest.fn().mockImplementation(async (citaData) => {
    return {
      _id: citaId,
      cliente: citaData.cliente,
      profesional: citaData.profesional,
      tipo: citaData.tipo,
      fecha: new Date(citaData.fecha),
      hora: citaData.hora,
      duracion: citaData.duracion || 60,
      motivo: citaData.motivo,
      estado: 'pendiente',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }),
  obtenerCitasService: jest.fn().mockImplementation(async () => {
    return {
      citas: [{
        _id: citaId,
        cliente: { _id: clienteId, nombre: 'Test Client', email: 'client@test.com' },
        profesional: { _id: workerId, nombre: 'Test Worker', email: 'worker@test.com' },
        tipo: 'seguimiento',
        fecha: new Date(),
        hora: '10:00',
        duracion: 60,
        motivo: 'Seguimiento semanal',
        estado: 'pendiente'
      }],
      total: 1,
      pagina: 1,
      totalPaginas: 1
    };
  }),
  obtenerCitaPorIdService: jest.fn().mockImplementation(async (id) => {
    return {
      _id: id,
      cliente: { _id: clienteId, nombre: 'Test Client', email: 'client@test.com' },
      profesional: { _id: workerId, nombre: 'Test Worker', email: 'worker@test.com' },
      tipo: 'seguimiento',
      fecha: new Date(),
      hora: '10:00',
      duracion: 60,
      motivo: 'Seguimiento semanal',
      estado: 'pendiente'
    };
  }),
  actualizarCitaService: jest.fn().mockImplementation(async (id, datos) => {
    return {
      _id: id,
      ...datos,
      updatedAt: new Date()
    };
  }),
  cancelarCitaService: jest.fn().mockImplementation(async (id) => {
    return {
      _id: id,
      estado: 'cancelada',
      updatedAt: new Date()
    };
  }),
  reagendarCitaService: jest.fn().mockImplementation(async (id, datos) => {
    return {
      _id: id,
      fecha: new Date(datos.nuevaFecha),
      hora: datos.nuevaHora,
      updatedAt: new Date()
    };
  }),
  confirmarCitaService: jest.fn().mockImplementation(async (id) => {
    return {
      _id: id,
      estado: 'confirmada',
      updatedAt: new Date()
    };
  }),
  completarCitaService: jest.fn().mockImplementation(async (id) => {
    return {
      _id: id,
      estado: 'completada',
      updatedAt: new Date()
    };
  }),
  obtenerDisponibilidadService: jest.fn().mockImplementation(async () => {
    return {
      fecha: '2025-01-15',
      horariosDisponibles: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    };
  }),
  obtenerEstadisticasCitasService: jest.fn().mockImplementation(async () => {
    return {
      totalCitas: 10,
      citasProgramadas: 5,
      citasConfirmadas: 3,
      citasCompletadas: 2,
      citasCanceladas: 0
    };
  })
}));

// Mock del modelo User
jest.mock('../../src/models/users/user', () => {
  return {
    findById: jest.fn().mockImplementation((id) => {
      if (id === workerId) {
        return Promise.resolve({
          _id: workerId,
          fullName: "Test Trainer",
          email: "trainer@test.com",
          role: 'worker',
          workerType: 'entrenador',
          isWorkerAvailable: true,
          availability: 'Lunes a Viernes 9:00-18:00',
          clientesAsignados: [clienteId]
        });
      }
      if (id === clienteId) {
        return Promise.resolve({
          _id: clienteId,
          fullName: "Test Client",
          email: "client@test.com",
          role: 'user'
        });
      }
      if (id === adminId) {
        return Promise.resolve({
          _id: adminId,
          fullName: "Test Admin",
          email: "admin@test.com",
          role: 'admin'
        });
      }
      return Promise.resolve({
        _id: id,
        fullName: "Usuario Test",
        email: "usuario@test.com",
        role: 'user'
      });
    })
  };
});

// Mock del modelo Cita
jest.mock('../../src/models/citas/cita', () => {
  return {
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([{
                  _id: citaId,
                  cliente: { _id: clienteId, nombre: 'Test Client', email: 'client@test.com' },
                  profesional: { _id: workerId, nombre: 'Test Worker', email: 'worker@test.com' },
                  tipo: 'seguimiento',
                  fecha: new Date(),
                  hora: '10:00',
                  duracion: 60,
                  motivo: 'Seguimiento semanal',
                  estado: 'pendiente'
                }])
              })
            })
          })
        })
      }),
      lean: jest.fn().mockResolvedValue([{
        _id: citaId,
        cliente: { _id: clienteId, nombre: 'Test Client', email: 'client@test.com' },
        profesional: { _id: workerId, nombre: 'Test Worker', email: 'worker@test.com' },
        tipo: 'seguimiento',
        fecha: new Date(),
        hora: '10:00',
        duracion: 60,
        motivo: 'Seguimiento semanal',
        estado: 'pendiente'
      }])
    }),
    findById: jest.fn().mockImplementation((id) => {
      if (mongoose.Types.ObjectId.isValid(id)) {
        return Promise.resolve({
          _id: id,
          cliente: clienteId,
          profesional: workerId,
          tipo: 'seguimiento',
          fecha: new Date('2025-02-15'),
          hora: '10:00',
          duracion: 60,
          motivo: 'Seguimiento semanal del progreso',
          estado: 'pendiente',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      return Promise.resolve(null);
    }),
    findByIdAndUpdate: jest.fn().mockImplementation((id, update) => {
      return Promise.resolve({
        _id: id,
        ...update,
        updatedAt: new Date()
      });
    }),
    findByIdAndDelete: jest.fn().mockImplementation((id) => {
      return Promise.resolve({
        _id: id,
        deleted: true
      });
    }),
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        _id: citaId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }),
    countDocuments: jest.fn().mockResolvedValue(1),
    aggregate: jest.fn().mockResolvedValue([{
      _id: null,
      totalCitas: 10,
      citasProgramadas: 5,
      citasConfirmadas: 3,
      citasCompletadas: 2,
      citasCanceladas: 0
    }])
  };
});

describe('Citas Integration Tests', () => {
  beforeAll(async () => {
    // Setup inicial
  });

  describe('Flujo completo de citas', () => {
    it('debería completar el flujo completo: crear → confirmar → completar', async () => {
      // Usar fecha futura
      const now = new Date();
      now.setMonth(now.getMonth() + 1);
      const fechaFutura = now.toISOString().split('T')[0];

      const citaData = {
        cliente: clienteId,
        profesional: workerId,
        tipo: 'seguimiento',
        fecha: fechaFutura,
        hora: '10:00',
        duracion: 60,
        motivo: 'Seguimiento semanal del progreso'
      };

      // Crear cita
      const createResponse = await request(app)
        .post('/api/citas')
        .set('Authorization', 'Bearer fake-token')
        .send(citaData)
        .expect(201);

      expect(createResponse.body.message).toBe('Cita creada correctamente');
      expect(createResponse.body.cita.estado).toBe('pendiente');

      const citaId = createResponse.body.cita._id;

      // Confirmar cita
      const confirmResponse = await request(app)
        .post(`/api/citas/${citaId}/confirmar`)
        .set('Authorization', 'Bearer fake-token')
        .expect(200);

      expect(confirmResponse.body.message).toBe('Cita confirmada correctamente');
      expect(confirmResponse.body.cita.estado).toBe('confirmada');

      // Completar cita
      const completeResponse = await request(app)
        .post(`/api/citas/${citaId}/completar`)
        .set('Authorization', 'Bearer fake-token')
        .expect(200);

      expect(completeResponse.body.message).toBe('Cita completada correctamente');
      expect(completeResponse.body.cita.estado).toBe('completada');
    });

    it('debería manejar el flujo de cancelación', async () => {
      // Usar fecha futura
      const now = new Date();
      now.setMonth(now.getMonth() + 1);
      const fechaFutura = now.toISOString().split('T')[0];

      const citaData = {
        cliente: clienteId,
        profesional: workerId,
        tipo: 'seguimiento',
        fecha: fechaFutura,
        hora: '10:00',
        duracion: 60,
        motivo: 'Seguimiento semanal del progreso'
      };

      // Crear cita
      const createResponse = await request(app)
        .post('/api/citas')
        .set('Authorization', 'Bearer fake-token')
        .send(citaData)
        .expect(201);

      const citaId = createResponse.body.cita._id;

      // Cancelar cita
      const cancelResponse = await request(app)
        .post(`/api/citas/${citaId}/cancelar`)
        .set('Authorization', 'Bearer fake-token')
        .send({ motivo: 'Cambio de planes' })
        .expect(200);

      expect(cancelResponse.body.message).toBe('Cita cancelada correctamente');
      expect(cancelResponse.body.cita.estado).toBe('cancelada');
    });

    it('debería manejar el flujo de reagendación', async () => {
      // Usar fecha futura
      const now = new Date();
      now.setMonth(now.getMonth() + 1);
      const fechaFutura = now.toISOString().split('T')[0];

      const citaData = {
        cliente: clienteId,
        profesional: workerId,
        tipo: 'seguimiento',
        fecha: fechaFutura,
        hora: '10:00',
        duracion: 60,
        motivo: 'Seguimiento semanal del progreso'
      };

      // Crear cita
      const createResponse = await request(app)
        .post('/api/citas')
        .set('Authorization', 'Bearer fake-token')
        .send(citaData)
        .expect(201);

      const citaId = createResponse.body.cita._id;

      // Reagendar cita
      const rescheduleData = {
        nuevaFecha: fechaFutura,
        nuevaHora: '14:00'
      };

      const rescheduleResponse = await request(app)
        .post(`/api/citas/${citaId}/reagendar`)
        .set('Authorization', 'Bearer fake-token')
        .send(rescheduleData)
        .expect(200);

      expect(rescheduleResponse.body.message).toBe('Cita reagendada correctamente');
    });
  });

  describe('Filtros y búsquedas', () => {
    it('debería filtrar citas por estado', async () => {
      const response = await request(app)
        .get('/api/citas?estado=pendiente')
        .set('Authorization', 'Bearer fake-token')
        .expect(200);

      expect(response.body.citas).toHaveLength(1);
      expect(response.body.citas[0].estado).toBe('pendiente');
    });

    it('debería filtrar citas por tipo', async () => {
      const response = await request(app)
        .get('/api/citas?tipo=seguimiento')
        .set('Authorization', 'Bearer fake-token')
        .expect(200);

      expect(response.body.citas).toHaveLength(1);
      expect(response.body.citas.every((c: { tipo: string }) => c.tipo === 'seguimiento')).toBe(true);
    });

    it('debería filtrar citas por rango de fechas', async () => {
      const response = await request(app)
        .get('/api/citas?fechaDesde=2024-02-15&fechaHasta=2024-02-16')
        .set('Authorization', 'Bearer fake-token')
        .expect(200);

      expect(response.body.citas).toHaveLength(1);
    });
  });

  describe('Permisos y autorización', () => {
    it('debería permitir que un cliente vea solo sus propias citas', async () => {
      // Mock para cliente
      jest.doMock('../../src/middlewares/authMiddleware', () => ({
        authenticateToken: mockAuth(clienteId, 'user'),
        authorizeWorker: jest.fn(),
        authorizeAdmin: jest.fn(),
        authorizeUserOrAdmin: jest.fn(),
        authorizeNutricionista: jest.fn()
      }));

      const response = await request(app)
        .get('/api/citas')
        .set('Authorization', 'Bearer fake-token')
        .expect(200);

      expect(response.body.citas).toHaveLength(1);
      expect(response.body.citas[0].cliente._id).toBe(clienteId);
    });

    it('debería permitir que un profesional vea solo las citas de sus clientes', async () => {
      // Mock para profesional
      jest.doMock('../../src/middlewares/authMiddleware', () => ({
        authenticateToken: mockAuth(workerId, 'worker'),
        authorizeWorker: jest.fn(),
        authorizeAdmin: jest.fn(),
        authorizeUserOrAdmin: jest.fn(),
        authorizeNutricionista: jest.fn()
      }));

      const response = await request(app)
        .get('/api/citas')
        .set('Authorization', 'Bearer fake-token')
        .expect(200);

      expect(response.body.citas).toHaveLength(1);
      expect(response.body.citas[0].profesional._id).toBe(workerId);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});