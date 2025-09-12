import request from 'supertest';
import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types';
import app from '../../src/server';

const workerId = new mongoose.Types.ObjectId().toString();
const clienteId = new mongoose.Types.ObjectId().toString();
const planId = new mongoose.Types.ObjectId().toString();
const sesionId = new mongoose.Types.ObjectId().toString();
const ejercicioId = new mongoose.Types.ObjectId().toString();

jest.mock('../../src/middlewares/authMiddleware', () => {
  return {
    authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      req.user = { id: workerId, role: 'worker', email: 'worker@example.com' };
      next();
    },
    authorizeWorker: (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      next();
    },
    authorizeAdmin: (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      next();
    },
    authorizeNutricionista: (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      next();
    },
    authorizeUserOrAdmin: (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      next();
    }
  };
});

jest.mock('../../src/models/users/user', () => {
  return {
    findById: jest.fn().mockImplementation((id) => {
      if (id === workerId) {
        return Promise.resolve({
          _id: workerId,
          nombre: "Test Trainer",
          email: "trainer@test.com",
          role: 'worker'
        });
      }
      if (id === clienteId) {
        return Promise.resolve({
          _id: clienteId,
          nombre: "Test Client",
          email: "client@test.com",
          role: 'user'
        });
      }
      return Promise.resolve({
        _id: id,
        nombre: "Usuario Test",
        email: "usuario@test.com",
        role: 'user'
      });
    })
  };
});

jest.mock('../../src/models/training/planEntrenamiento', () => {
  class PlanMock {
    static findById(id: string) {
      if (id) return Promise.resolve({ _id: id, activo: true, entrenador: workerId, clientes: [clienteId], sesiones: [] });
      return Promise.resolve(null);
    }
    static findByIdAndUpdate() { return Promise.resolve({}); }
    static findOne(query: { sesiones?: string; draftMode?: boolean }) {
      if (query.sesiones && query.draftMode === false) {
        return Promise.resolve(null); // No hay planes publicados en los tests
      }
      return Promise.resolve(null);
    }
  }
  return { __esModule: true, default: PlanMock };
});

jest.mock('../../src/models/training/sesion', () => {
  class SesionMock {
    static findById(id: string) {
      if (id === sesionId) {
        const doc = { _id: id, entrenador: workerId, cliente: clienteId, completada: false };
        return {
          ...doc,
          populate: function() { return Promise.resolve(doc); },
          save: function() { return Promise.resolve(doc); }
        };
      }
      return null;
    }
    static findByIdAndUpdate() { return Promise.resolve({}); }
    static findByIdAndDelete() { return Promise.resolve({}); }
  }
  return { __esModule: true, default: SesionMock };
});

jest.mock('../../src/models/training/ejercicio', () => {
  type FindQuery = { _id?: { $in?: string[] } } | undefined;
  type EjercicioLite = { _id: string; activo: boolean };
  class EjercicioMock {
    static find(query?: FindQuery) {
      const ids = query?._id?.$in ?? [];
      return Promise.resolve(ids.map((id: string): EjercicioLite => ({ _id: id, activo: true })));
    }
  }
  return { __esModule: true, default: EjercicioMock };
});

jest.mock('../../src/service/training/sesionService', () => ({
  crearSesionService: jest.fn().mockImplementation(async (sesionData: {
    fecha?: string;
    hora?: string;
    tipoEntrenamiento?: string;
    duracion?: number;
    ejercicios?: Array<{ ejercicio: string; orden: number; series?: number; repeticiones?: number; tiempoDescanso?: number; }>; 
    clienteId?: string;
  }) => {
    if (sesionData.fecha) {
      const fechaSesion = new Date(sesionData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaSesion < hoy) {
        throw new Error('La fecha de la sesión no puede ser anterior al día actual');
      }
    }
    if (Array.isArray(sesionData.ejercicios)) {
      const ordenes = sesionData.ejercicios.map((e) => e.orden);
      const set = new Set(ordenes);
      if (ordenes.length !== set.size) {
        throw new Error('No puede haber ejercicios con el mismo orden');
      }
    }
    return {
      _id: sesionId,
      fecha: new Date(sesionData.fecha || new Date().toISOString()),
      hora: sesionData.hora || '09:00',
      tipoEntrenamiento: sesionData.tipoEntrenamiento || 'Fuerza',
      duracion: sesionData.duracion || 60,
      ejercicios: sesionData.ejercicios || [],
      entrenador: workerId,
      cliente: sesionData.clienteId || clienteId,
      completada: false,
      notas: ''
    };
  }),
  obtenerSesionesService: jest.fn().mockImplementation(async () => {
    return [{
      _id: sesionId,
      fecha: new Date(),
      hora: '09:00',
      tipoEntrenamiento: 'Fuerza',
      duracion: 60,
      ejercicios: [{ ejercicio: { _id: ejercicioId, nombre: 'Press de Banca' }, orden: 1, series: 3, repeticiones: 10, tiempoDescanso: 60 }],
      entrenador: { _id: workerId, nombre: 'Test Trainer', email: 'trainer@test.com' },
      cliente: { _id: clienteId, nombre: 'Test Client', email: 'client@test.com' },
      completada: false,
      notas: ''
    }];
  }),
  obtenerSesionPorIdService: jest.fn().mockImplementation(async (id: string) => {
    if (id !== sesionId) {
      throw new Error('Sesión no encontrada');
    }
    return {
      _id: sesionId,
      fecha: new Date(),
      hora: '09:00',
      tipoEntrenamiento: 'Fuerza',
      duracion: 60,
      ejercicios: [{ ejercicio: { _id: ejercicioId, nombre: 'Press de Banca' }, orden: 1, series: 3, repeticiones: 10, tiempoDescanso: 60 }],
      entrenador: { _id: workerId, nombre: 'Test Trainer', email: 'trainer@test.com' },
      cliente: { _id: clienteId, nombre: 'Test Client', email: 'client@test.com' },
      completada: false,
      notas: ''
    };
  }),
  actualizarSesionService: jest.fn().mockImplementation(async (id: string, _entrenadorId: string, datos: {
    fecha?: string;
    hora?: string;
    tipoEntrenamiento?: string;
    duracion?: number;
    ejercicios?: Array<{ ejercicio: string; orden: number; series?: number; repeticiones?: number; tiempoDescanso?: number; }>;
    notas?: string;
  }) => {
    // Verificar que la sesión existe
    if (id !== sesionId) {
      throw new Error('Sesión no encontrada');
    }
    return {
      _id: id,
      fecha: datos.fecha ? new Date(datos.fecha) : new Date(),
      hora: datos.hora || '09:00',
      tipoEntrenamiento: datos.tipoEntrenamiento || 'Fuerza',
      duracion: datos.duracion || 60,
      ejercicios: datos.ejercicios || [],
      entrenador: workerId,
      cliente: clienteId,
      completada: false,
      notas: datos.notas || ''
    };
  }),
  eliminarSesionService: jest.fn().mockImplementation(async (id: string) => {
    // Verificar que la sesión existe
    if (id !== sesionId) {
      throw new Error('Sesión no encontrada');
    }
    return { message: 'Sesión eliminada correctamente' };
  }),
  marcarSesionCompletadaService: jest.fn().mockImplementation(async (id: string) => {
    return { _id: id, completada: true, cliente: clienteId };
  }),
  agregarNotasSesionService: jest.fn().mockImplementation(async (id: string, _clienteId: string, notas: string) => {
    return { _id: id, notas, cliente: clienteId };
  })
}));

describe('Sesión Endpoints', () => {
  beforeAll(async () => {
  });

  describe('POST /api/training/sesiones', () => {
    it('debería crear una sesión correctamente', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const sesionData = {
        clienteId,
        planId,
        fecha: tomorrow.toISOString(),
        hora: "09:00",
        tipoEntrenamiento: "Fuerza",
        duracion: 60,
        ejercicios: [{
          ejercicio: ejercicioId,
          orden: 1,
          series: 3,
          repeticiones: 10,
          peso: 80,
          tiempoDescanso: 60,
          opcionesProgresion: {
            aumentarPeso: true,
            masRepeticiones: false,
            mayorIntensidad: false
          }
        }]
      };

      const res = await request(app)
        .post('/api/training/sesiones')
        .set('Authorization', 'Bearer fake-token')
        .send(sesionData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Sesión creada correctamente');
      expect(res.body).toHaveProperty('sesion');
      expect(res.body.sesion.tipoEntrenamiento).toEqual(sesionData.tipoEntrenamiento);
      expect(res.body.sesion.duracion).toEqual(sesionData.duracion);
    });

    it('debería fallar al crear sesión sin campos requeridos', async () => {
      const sesionIncompleta = {
        clienteId,
        hora: "09:00"
      };

      const res = await request(app)
        .post('/api/training/sesiones')
        .set('Authorization', 'Bearer fake-token')
        .send(sesionIncompleta);

      expect(res.statusCode).toEqual(400);
    });

    it('debería fallar si la fecha es anterior al día actual', async () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      
      const sesionData = {
        clienteId,
        fecha: ayer.toISOString(),
        tipoEntrenamiento: "Fuerza",
        duracion: 60,
        ejercicios: [{
          ejercicio: ejercicioId,
          orden: 1,
          series: 3,
          repeticiones: 10,
          tiempoDescanso: 60
        }]
      };

      const res = await request(app)
        .post('/api/training/sesiones')
        .set('Authorization', 'Bearer fake-token')
        .send(sesionData);

      expect(res.statusCode).toEqual(400);
    });

    it('debería fallar si hay ejercicios duplicados en el mismo orden', async () => {
      const sesionData = {
        clienteId,
        fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Pasado mañana
        tipoEntrenamiento: "Fuerza",
        duracion: 60,
        ejercicios: [
          {
            ejercicio: ejercicioId,
            orden: 1,
            series: 3,
            repeticiones: 10,
            tiempoDescanso: 60
          },
          {
            ejercicio: ejercicioId,
            orden: 1,
            series: 3,
            repeticiones: 10,
            tiempoDescanso: 60
          }
        ]
      };

      const res = await request(app)
        .post('/api/training/sesiones')
        .set('Authorization', 'Bearer fake-token')
        .send(sesionData);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/training/sesiones', () => {
    it('debería obtener todas las sesiones', async () => {
      const res = await request(app)
        .get('/api/training/sesiones')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('sesiones');
      expect(Array.isArray(res.body.sesiones)).toBeTruthy();
      expect(res.body.sesiones.length).toBeGreaterThan(0);
    });

    it('debería filtrar sesiones por entrenador', async () => {
      const res = await request(app)
        .get(`/api/training/sesiones?entrenador=${workerId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('sesiones');
    });

    it('debería filtrar sesiones por cliente', async () => {
      const res = await request(app)
        .get(`/api/training/sesiones?cliente=${clienteId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('sesiones');
    });

    it('debería filtrar sesiones por tipo de entrenamiento', async () => {
      const res = await request(app)
        .get('/api/training/sesiones?tipoEntrenamiento=Fuerza')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('sesiones');
    });

    it('debería filtrar sesiones por fecha', async () => {
      const fecha = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/training/sesiones?fecha=${fecha}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('sesiones');
    });

    it('debería filtrar sesiones por estado de completado', async () => {
      const res = await request(app)
        .get('/api/training/sesiones?completada=false')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('sesiones');
    });
  });

  describe('GET /api/training/sesiones/:id', () => {
    it('debería obtener una sesión por ID', async () => {
      const res = await request(app)
        .get(`/api/training/sesiones/${sesionId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('sesion');
      expect(res.body.sesion._id).toEqual(sesionId);
    });

    it('debería fallar con ID inválido', async () => {
      const res = await request(app)
        .get('/api/training/sesiones/invalid-id')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PUT /api/training/sesiones/:id', () => {
    it('debería actualizar una sesión correctamente', async () => {
      const datosActualizacion = {
        hora: "10:00",
        duracion: 90,
        notas: "Sesión intensa"
      };

      const res = await request(app)
        .put(`/api/training/sesiones/${sesionId}`)
        .set('Authorization', 'Bearer fake-token')
        .send(datosActualizacion);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Sesión actualizada correctamente');
      expect(res.body).toHaveProperty('sesion');
    });

    it('debería fallar al actualizar sesión inexistente', async () => {
      const res = await request(app)
        .put('/api/training/sesiones/nonexistent-id')
        .set('Authorization', 'Bearer fake-token')
        .send({ hora: "10:00" });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE /api/training/sesiones/:id', () => {
    it('debería eliminar una sesión correctamente', async () => {
      const res = await request(app)
        .delete(`/api/training/sesiones/${sesionId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Sesión eliminada correctamente');
    });

    it('debería fallar al eliminar sesión inexistente', async () => {
      const res = await request(app)
        .delete('/api/training/sesiones/nonexistent-id')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PATCH /api/training/sesiones/:id/completar', () => {
    it('debería marcar una sesión como completada', async () => {
      const res = await request(app)
        .patch(`/api/training/sesiones/${sesionId}/completar`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Sesión marcada como completada');
      expect(res.body).toHaveProperty('sesion');
    });

    it('debería fallar con sesión inexistente', async () => {
      const res = await request(app)
        .patch('/api/training/sesiones/nonexistent-id/completar')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PATCH /api/training/sesiones/:id/notas', () => {
    it('debería agregar notas a una sesión', async () => {
      const notas = "Sesión muy productiva, el cliente progresó bien";

      const res = await request(app)
        .patch(`/api/training/sesiones/${sesionId}/notas`)
        .set('Authorization', 'Bearer fake-token')
        .send({ notas });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Notas agregadas correctamente');
      expect(res.body).toHaveProperty('sesion');
    });

    it('debería fallar con sesión inexistente', async () => {
      const res = await request(app)
        .patch('/api/training/sesiones/nonexistent-id/notas')
        .set('Authorization', 'Bearer fake-token')
        .send({ notas: "Test notes" });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('Validaciones de campos', () => {
    it('debería validar tipo de entrenamiento válido', async () => {
      const sesionData = {
        clienteId,
        fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Pasado mañana
        tipoEntrenamiento: "Tipo Invalido",
        duracion: 60,
        ejercicios: [{
          ejercicio: ejercicioId,
          orden: 1,
          series: 3,
          repeticiones: 10,
          tiempoDescanso: 60
        }]
      };

      const res = await request(app)
        .post('/api/training/sesiones')
        .set('Authorization', 'Bearer fake-token')
        .send(sesionData);

      expect(res.statusCode).toEqual(400);
    });

    it('debería validar duración mínima', async () => {
      const sesionData = {
        clienteId,
        fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Pasado mañana
        tipoEntrenamiento: "Fuerza",
        duracion: 0,
        ejercicios: [{
          ejercicio: ejercicioId,
          orden: 1,
          series: 3,
          repeticiones: 10,
          tiempoDescanso: 60
        }]
      };

      const res = await request(app)
        .post('/api/training/sesiones')
        .set('Authorization', 'Bearer fake-token')
        .send(sesionData);

      expect(res.statusCode).toEqual(400);
    });

    it('debería validar que los ejercicios existen', async () => {
      const sesionData = {
        clienteId,
        fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Pasado mañana
        tipoEntrenamiento: "Fuerza",
        duracion: 60,
        ejercicios: [{
          ejercicio: "ejercicio-inexistente",
          orden: 1,
          series: 3,
          repeticiones: 10,
          tiempoDescanso: 60
        }]
      };

      const res = await request(app)
        .post('/api/training/sesiones')
        .set('Authorization', 'Bearer fake-token')
        .send(sesionData);

      expect(res.statusCode).toEqual(400);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
