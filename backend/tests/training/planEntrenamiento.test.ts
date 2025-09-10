import request from 'supertest';
import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types';
import app from '../../src/server';

const workerId = new mongoose.Types.ObjectId().toString();
const clienteId = new mongoose.Types.ObjectId().toString();
const planId = new mongoose.Types.ObjectId().toString();

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
    }),
    find: jest.fn().mockImplementation((query) => {
      // Simular respuesta básica que coincide con la implementación real
      if (query._id && query._id.$in) {
        return Promise.resolve([{
          _id: clienteId,
          nombre: "Test Client",
          email: "client@test.com",
          role: 'user'
        }]);
      }
      // Para otras consultas, devolver lista básica
      return Promise.resolve([{
        _id: clienteId,
        nombre: "Test Client",
        email: "client@test.com",
        role: 'user'
      }]);
    })
  };
});

jest.mock('../../src/service/training/planEntrenamientoService', () => ({
  crearPlanEntrenamientoService: jest.fn().mockImplementation(async (planData) => {
    return {
      _id: planId,
      nombre: planData.nombre,
      descripcion: planData.descripcion,
      objetivo: planData.objetivo,
      duracionDias: planData.duracionDias,
      sesionesPorSemana: planData.sesionesPorSemana,
      entrenador: planData.entrenadorId,
      clientes: planData.clientes,
      publico: planData.publico,
      activo: true,
      sesiones: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }),
  obtenerPlanesEntrenamientoService: jest.fn().mockImplementation(async () => {
    return [{
      _id: planId,
      nombre: "Plan de Fuerza",
      descripcion: "Plan para ganar fuerza muscular",
      objetivo: "Ganancia muscular",
      duracionDias: 30,
      sesionesPorSemana: 4,
      entrenador: { _id: workerId, nombre: "Test Trainer", email: "trainer@test.com" },
      clientes: [{ _id: clienteId, nombre: "Test Client", email: "client@test.com" }],
      publico: false,
      activo: true,
      sesiones: []
    }];
  }),
  obtenerPlanEntrenamientoPorIdService: jest.fn().mockImplementation(async (id) => {
    return {
      _id: id,
      nombre: "Plan de Fuerza",
      descripcion: "Plan para ganar fuerza muscular",
      objetivo: "Ganancia muscular",
      duracionDias: 30,
      sesionesPorSemana: 4,
      entrenador: { _id: workerId, nombre: "Test Trainer", email: "trainer@test.com" },
      clientes: [{ _id: clienteId, nombre: "Test Client", email: "client@test.com" }],
      publico: false,
      activo: true,
      sesiones: []
    };
  }),
  actualizarPlanEntrenamientoService: jest.fn().mockImplementation(async (id, entrenadorId, datos) => {
    return {
      _id: id,
      nombre: datos.nombre || "Plan de Fuerza",
      descripcion: datos.descripcion || "Plan para ganar fuerza muscular",
      objetivo: datos.objetivo || "Ganancia muscular",
      duracionDias: datos.duracionDias || 30,
      sesionesPorSemana: datos.sesionesPorSemana || 4,
      entrenador: entrenadorId,
      clientes: datos.clientes || [clienteId],
      publico: datos.publico !== undefined ? datos.publico : false,
      activo: true
    };
  }),
  eliminarPlanEntrenamientoService: jest.fn().mockImplementation(async () => {
    return { message: 'Plan de entrenamiento eliminado correctamente' };
  }),
  asignarClienteService: jest.fn().mockImplementation(async (planId, entrenadorId, clienteId) => {
    return {
      _id: planId,
      nombre: "Plan de Fuerza",
      clientes: [clienteId],
      entrenador: entrenadorId
    };
  }),
  removerClienteService: jest.fn().mockImplementation(async (planId, entrenadorId) => {
    return {
      _id: planId,
      nombre: "Plan de Fuerza",
      clientes: [],
      entrenador: entrenadorId
    };
  })
}));

describe('Plan de Entrenamiento Endpoints', () => {
  beforeAll(async () => {
    // Setup inicial
  });

  describe('POST /api/training/planes', () => {
    it('debería crear un plan de entrenamiento correctamente', async () => {
      const planData = {
        nombre: "Plan de Fuerza",
        descripcion: "Plan para ganar fuerza muscular",
        objetivo: "Ganancia muscular",
        duracionDias: 30,
        sesionesPorSemana: 4,
        clientes: [clienteId],
        publico: false
      };

      const res = await request(app)
        .post('/api/training/planes')
        .set('Authorization', 'Bearer fake-token')
        .send(planData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Plan de entrenamiento creado correctamente');
      expect(res.body).toHaveProperty('plan');
      expect(res.body.plan.nombre).toEqual(planData.nombre);
      expect(res.body.plan.objetivo).toEqual(planData.objetivo);
    });

    it('debería fallar al crear plan sin campos requeridos', async () => {
      const planIncompleto = {
        nombre: "Plan de Fuerza",
        clientes: [clienteId]
      };

      const res = await request(app)
        .post('/api/training/planes')
        .set('Authorization', 'Bearer fake-token')
        .send(planIncompleto);

      expect(res.statusCode).toEqual(400);
    });

    it('debería fallar si las sesiones por semana exceden la duración', async () => {
      const planInvalido = {
        nombre: "Plan Invalido",
        descripcion: "Plan con datos inválidos",
        objetivo: "Ganancia muscular",
        duracionDias: 7,
        sesionesPorSemana: 10,
        clientes: [clienteId],
        publico: false
      };

      const res = await request(app)
        .post('/api/training/planes')
        .set('Authorization', 'Bearer fake-token')
        .send(planInvalido);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/training/planes', () => {
    it('debería obtener todos los planes de entrenamiento', async () => {
      const res = await request(app)
        .get('/api/training/planes')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('planes');
      expect(Array.isArray(res.body.planes)).toBeTruthy();
      expect(res.body.planes.length).toBeGreaterThan(0);
    });

    it('debería filtrar planes por entrenador', async () => {
      const res = await request(app)
        .get(`/api/training/planes?entrenador=${workerId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('planes');
    });

    it('debería filtrar planes por objetivo', async () => {
      const res = await request(app)
        .get('/api/training/planes?objetivo=Ganancia muscular')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('planes');
    });

    it('debería filtrar planes públicos', async () => {
      const res = await request(app)
        .get('/api/training/planes?publico=true')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('planes');
    });
  });

  describe('GET /api/training/planes/:id', () => {
    it('debería obtener un plan de entrenamiento por ID', async () => {
      const res = await request(app)
        .get(`/api/training/planes/${planId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('plan');
      expect(res.body.plan._id).toEqual(planId);
    });

    it('debería fallar con ID inválido', async () => {
      const res = await request(app)
        .get('/api/training/planes/invalid-id')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PUT /api/training/planes/:id', () => {
    it('debería actualizar un plan de entrenamiento correctamente', async () => {
      const datosActualizacion = {
        nombre: "Plan de Fuerza Avanzado",
        duracionDias: 45,
        sesionesPorSemana: 5
      };

      const res = await request(app)
        .put(`/api/training/planes/${planId}`)
        .set('Authorization', 'Bearer fake-token')
        .send(datosActualizacion);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Plan de entrenamiento actualizado correctamente');
      expect(res.body).toHaveProperty('plan');
    });

    it('debería fallar al actualizar plan inexistente', async () => {
      const res = await request(app)
        .put('/api/training/planes/nonexistent-id')
        .set('Authorization', 'Bearer fake-token')
        .send({ nombre: "Nuevo Nombre" });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE /api/training/planes/:id', () => {
    it('debería eliminar un plan de entrenamiento correctamente', async () => {
      const res = await request(app)
        .delete(`/api/training/planes/${planId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Plan de entrenamiento eliminado correctamente');
    });

    it('debería fallar al eliminar plan inexistente', async () => {
      const res = await request(app)
        .delete('/api/training/planes/nonexistent-id')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/training/planes/:id/clientes', () => {
    it('debería asignar un cliente al plan correctamente', async () => {
      const res = await request(app)
        .post(`/api/training/planes/${planId}/clientes`)
        .set('Authorization', 'Bearer fake-token')
        .send({ clienteId });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Cliente asignado correctamente');
      expect(res.body).toHaveProperty('plan');
    });

    it('debería fallar al asignar cliente inexistente', async () => {
      const res = await request(app)
        .post(`/api/training/planes/${planId}/clientes`)
        .set('Authorization', 'Bearer fake-token')
        .send({ clienteId: 'nonexistent-id' });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE /api/training/planes/:id/clientes/:clienteId', () => {
    it('debería remover un cliente del plan correctamente', async () => {
      const res = await request(app)
        .delete(`/api/training/planes/${planId}/clientes/${clienteId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Cliente removido correctamente');
      expect(res.body).toHaveProperty('plan');
    });

    it('debería fallar al remover cliente inexistente', async () => {
      const res = await request(app)
        .delete(`/api/training/planes/${planId}/clientes/nonexistent-id`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('Validaciones de campos', () => {
    it('debería validar objetivo válido', async () => {
      const planData = {
        nombre: "Test Plan",
        descripcion: "Test description",
        objetivo: "Objetivo Invalido",
        duracionDias: 30,
        sesionesPorSemana: 4,
        clientes: [clienteId],
        publico: false
      };

      const res = await request(app)
        .post('/api/training/planes')
        .set('Authorization', 'Bearer fake-token')
        .send(planData);

      expect(res.statusCode).toEqual(400);
    });

    it('debería validar duración mínima', async () => {
      const planData = {
        nombre: "Test Plan",
        descripcion: "Test description",
        objetivo: "Ganancia muscular",
        duracionDias: 0,
        sesionesPorSemana: 4,
        clientes: [clienteId],
        publico: false
      };

      const res = await request(app)
        .post('/api/training/planes')
        .set('Authorization', 'Bearer fake-token')
        .send(planData);

      expect(res.statusCode).toEqual(400);
    });

    it('debería validar sesiones por semana válidas', async () => {
      const planData = {
        nombre: "Test Plan",
        descripcion: "Test description",
        objetivo: "Ganancia muscular",
        duracionDias: 30,
        sesionesPorSemana: 10,
        clientes: [clienteId],
        publico: false
      };

      const res = await request(app)
        .post('/api/training/planes')
        .set('Authorization', 'Bearer fake-token')
        .send(planData);

      expect(res.statusCode).toEqual(400);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
