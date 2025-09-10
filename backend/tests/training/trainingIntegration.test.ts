import request from 'supertest';
import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types';

const workerId = new mongoose.Types.ObjectId().toString();
const clienteId = new mongoose.Types.ObjectId().toString();

jest.mock('../../src/middlewares/authMiddleware', () => {
  return {
    authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      const url = (req as unknown as { originalUrl?: string }).originalUrl || '';
      if (url.includes('/api/training/sesiones/') && (url.endsWith('/completar') || url.endsWith('/notas'))) {
        req.user = { id: clienteId, role: 'user' };
      } else {
        req.user = { id: workerId, role: 'worker' };
      }
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


// Mock mínimos para que la integración no dependa de datos reales complejos
jest.mock('../../src/models/training/ejercicio', () => {
  type EjercicioData = { nombre?: string; creador?: string } & Record<string, unknown>;
  type IdQuery = { _id?: { $in?: string[] } } | undefined;
  class EjercicioMock {
    constructor(public data?: EjercicioData) {}
    _id?: string;
    static createdNames = new Set<string>();
    static store = new Map<string, Record<string, unknown>>();
    static genId() { const base = (Date.now().toString(16) + '0'.repeat(24)).slice(0,24); return base; }
    save() { this._id = this._id || EjercicioMock.genId(); const doc = { _id: this._id, activo: true, ...this.data } as Record<string, unknown>; if (this.data?.nombre) EjercicioMock.createdNames.add(this.data.nombre as string); EjercicioMock.store.set(this._id, doc); return Promise.resolve(doc); }
    static findOne(query?: Partial<EjercicioData>) {
      if (query && query.nombre && query.creador && EjercicioMock.createdNames.has(query.nombre)) {
        return Promise.resolve({ _id: EjercicioMock.genId(), nombre: query.nombre, creador: query.creador, activo: true });
      }
      return Promise.resolve(null);
    }
    static find(query?: IdQuery) {
      if (query && query._id && query._id.$in) {
        return Promise.resolve(query._id.$in.map((id: string) => EjercicioMock.store.get(id) || { _id: id, activo: true }));
      }
      return {
        populate: function() { return this; },
        sort: function() { return []; }
      };
    }
    static findById(id: string) {
      const base = (EjercicioMock.store.get(id) as { _id: string; activo: boolean; creador: string } | undefined) || { _id: id, activo: true, creador: workerId };
      type EjercicioDoc = { _id: string; activo: boolean; creador: string; save: () => Promise<EjercicioDoc>; populate: () => EjercicioDoc } & Record<string, unknown>;
      const doc: EjercicioDoc = {
        ...base,
        save: function(this: EjercicioDoc) { EjercicioMock.store.set(id, this as unknown as Record<string, unknown>); return Promise.resolve(this); },
        populate: function(this: EjercicioDoc) { return this; }
      };
      return doc;
    }
    static findByIdAndUpdate() { return Promise.resolve({}); }
  }
  return { __esModule: true, default: EjercicioMock };
});

jest.mock('../../src/models/training/planEntrenamiento', () => {
  type PlanData = { clientes?: string[] } & Record<string, unknown>;
  class PlanMock {
    constructor(public data?: PlanData) {}
    _id?: string;
    static genId() { const base = (Date.now().toString(16) + 'f'.repeat(24)).slice(0,24); return base; }
    static store = new Map<string, Record<string, unknown>>();
    save() { this._id = this._id || PlanMock.genId(); const doc = { _id: this._id, activo: true, clientes: this.data?.clientes || [clienteId], entrenador: workerId, sesiones: [], ...this.data } as Record<string, unknown>; PlanMock.store.set(this._id, doc); return Promise.resolve(doc); }
    static findOne() { return Promise.resolve(null); }
    static find() {
      return {
        populate: function() { return this; },
        sort: function() { return []; }
      };
    }
    static findById(id: string) { 
      const doc = (PlanMock.store.get(id) as Record<string, unknown>) || { _id: id, activo: true, entrenador: workerId, clientes: [clienteId], sesiones: [] } as Record<string, unknown>;
      (doc as { save?: () => Promise<unknown> }).save = function() { PlanMock.store.set(id, doc); return Promise.resolve(doc); };
      return Promise.resolve(doc); 
    }
    static findByIdAndUpdate() { return Promise.resolve({}); }
  }
  return { __esModule: true, default: PlanMock };
});

jest.mock('../../src/models/training/sesion', () => {
  type SesionData = Record<string, unknown>;
  class SesionMock {
    constructor(public data?: SesionData) {}
    _id?: string;
    static genId() { const base = (Date.now().toString(16) + 'a'.repeat(24)).slice(0,24); return base; }
    static store = new Map<string, Record<string, unknown>>();
    save() { this._id = this._id || SesionMock.genId(); const doc = { _id: this._id, completada: false, entrenador: workerId, cliente: clienteId, ...this.data } as Record<string, unknown>; SesionMock.store.set(this._id, doc); return Promise.resolve(doc); }
    static find() {
      return {
        populate: function() { return this; },
        sort: function() { return []; }
      };
    }
    static findById(id: string) { const doc = (SesionMock.store.get(id) as Record<string, unknown>) || { _id: id, entrenador: workerId, cliente: clienteId, completada: false } as Record<string, unknown>; (doc as { save?: () => Promise<unknown> }).save = function() { SesionMock.store.set(id, doc); return Promise.resolve(doc); }; return Promise.resolve(doc); }
    static findByIdAndUpdate(id: string, update: Record<string, unknown>) { const doc = SesionMock.store.get(id); if (doc) { Object.assign(doc, update); SesionMock.store.set(id, doc); } return Promise.resolve((doc as Record<string, unknown>) || {}); }
    static findByIdAndDelete(id: string) { const doc = SesionMock.store.get(id); SesionMock.store.delete(id); return Promise.resolve(doc || {}); }
  }
  return { __esModule: true, default: SesionMock };
});

import app from '../../src/server';

describe('Training Module Integration Tests', () => {
  let ejercicioId: string;
  let planId: string;
  let sesionId: string;

  beforeAll(async () => {
    // Setup inicial
  });

  describe('Flujo completo de entrenamiento', () => {
    it('debería permitir crear un ejercicio, plan y sesión en secuencia', async () => {
      // 1. Crear ejercicio
      const ejercicioData = {
        nombre: "Press de Banca",
        descripcion: "Ejercicio para desarrollar el pecho",
        grupoMuscular: "Pecho",
        equipamiento: "Barra",
        series: 3,
        repeticiones: 10,
        tiempoDescanso: 60,
        nivelDificultad: "Intermedio",
        nivelIntensidad: "Media"
      };

      const ejercicioRes = await request(app)
        .post('/api/training/ejercicios')
        .set('Authorization', 'Bearer fake-token')
        .send(ejercicioData);

      expect(ejercicioRes.statusCode).toEqual(201);
      expect(ejercicioRes.body).toHaveProperty('ejercicio');
      ejercicioId = ejercicioRes.body.ejercicio._id;

      // 2. Crear plan de entrenamiento
      const planData = {
        nombre: "Plan de Fuerza",
        descripcion: "Plan para ganar fuerza muscular",
        objetivo: "Ganancia muscular",
        duracionDias: 30,
        sesionesPorSemana: 4,
        fechaInicio: new Date().toISOString(),
        diasSemana: [1, 3, 5, 0], // Lunes, Miércoles, Viernes, Domingo
        clientes: [clienteId],
        publico: false
      };

      const planRes = await request(app)
        .post('/api/training/planes')
        .set('Authorization', 'Bearer fake-token')
        .send(planData);

      expect(planRes.statusCode).toEqual(201);
      expect(planRes.body).toHaveProperty('plan');
      planId = planRes.body.plan._id;

      // 3. Crear sesión
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      
      const sesionData = {
        clienteId,
        planId,
        fecha: dayAfterTomorrow.toISOString(),
        hora: "09:00",
        tipoEntrenamiento: "Fuerza",
        duracion: 60,
        ejercicios: [{
          ejercicio: ejercicioId,
          orden: 1,
          series: 3,
          repeticiones: 10,
          peso: 80,
          tiempoDescanso: 60
        }]
      };

      const sesionRes = await request(app)
        .post('/api/training/sesiones')
        .set('Authorization', 'Bearer fake-token')
        .send(sesionData);

      expect(sesionRes.statusCode).toEqual(201);
      expect(sesionRes.body).toHaveProperty('sesion');
      sesionId = sesionRes.body.sesion._id;
    });

    it('debería permitir asignar y remover clientes del plan', async () => {
      // Asignar cliente
      const asignarRes = await request(app)
        .post(`/api/training/planes/${planId}/clientes`)
        .set('Authorization', 'Bearer fake-token')
        .send({ clienteId: new mongoose.Types.ObjectId().toString() });

      expect(asignarRes.statusCode).toEqual(200);
      expect(asignarRes.body).toHaveProperty('message', 'Cliente asignado correctamente');

      // Remover cliente
      const removerRes = await request(app)
        .delete(`/api/training/planes/${planId}/clientes/${clienteId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(removerRes.statusCode).toEqual(200);
      expect(removerRes.body).toHaveProperty('message', 'Cliente removido correctamente');
    });

    it('debería permitir marcar sesión como completada y agregar notas', async () => {
      // Marcar como completada
      const completarRes = await request(app)
        .patch(`/api/training/sesiones/${sesionId}/completar`)
        .set('Authorization', 'Bearer fake-token');

      expect(completarRes.statusCode).toEqual(200);
      expect(completarRes.body).toHaveProperty('message', 'Sesión marcada como completada');

      // Agregar notas
      const notasRes = await request(app)
        .patch(`/api/training/sesiones/${sesionId}/notas`)
        .set('Authorization', 'Bearer fake-token')
        .send({ notas: "Sesión muy productiva, el cliente progresó bien" });

      expect(notasRes.statusCode).toEqual(200);
      expect(notasRes.body).toHaveProperty('message', 'Notas agregadas correctamente');
    });
  });

  describe('Consultas y filtros integrados', () => {
    it('debería permitir filtrar ejercicios por grupo muscular', async () => {
      const res = await request(app)
        .get('/api/training/ejercicios?grupoMuscular=Pecho')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ejercicios');
    });

    it('debería permitir filtrar planes por objetivo', async () => {
      const res = await request(app)
        .get('/api/training/planes?objetivo=Ganancia muscular')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('planes');
    });

    it('debería permitir filtrar sesiones por tipo de entrenamiento', async () => {
      const res = await request(app)
        .get('/api/training/sesiones?tipoEntrenamiento=Fuerza')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('sesiones');
    });
  });

  describe('Validaciones de integridad', () => {
    it('debería fallar al crear ejercicio con nombre duplicado del mismo creador', async () => {
      const ejercicioDuplicado = {
        nombre: "Press de Banca",
        descripcion: "Descripción diferente",
        grupoMuscular: "Pecho",
        equipamiento: "Barra",
        series: 3,
        repeticiones: 10,
        tiempoDescanso: 60,
        nivelDificultad: "Intermedio",
        nivelIntensidad: "Media"
      };

      const res = await request(app)
        .post('/api/training/ejercicios')
        .set('Authorization', 'Bearer fake-token')
        .send(ejercicioDuplicado);

      expect(res.statusCode).toEqual(400);
    });

    it('debería fallar al crear plan con sesiones por semana excediendo duración', async () => {
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

    it('debería fallar al crear sesión con fecha anterior al día actual', async () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      
      const sesionInvalida = {
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
        .send(sesionInvalida);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('Operaciones de eliminación', () => {
    it('debería permitir eliminar ejercicio (soft delete)', async () => {
      const res = await request(app)
        .delete(`/api/training/ejercicios/${ejercicioId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Ejercicio eliminado correctamente');
    });

    it('debería permitir eliminar plan de entrenamiento (soft delete)', async () => {
      const res = await request(app)
        .delete(`/api/training/planes/${planId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Plan de entrenamiento eliminado correctamente');
    });

    it('debería permitir eliminar sesión', async () => {
      const res = await request(app)
        .delete(`/api/training/sesiones/${sesionId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Sesión eliminada correctamente');
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar IDs inválidos correctamente', async () => {
      const res = await request(app)
        .get('/api/training/ejercicios/invalid-id')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(400);
    });

    it('debería manejar datos faltantes correctamente', async () => {
      const res = await request(app)
        .post('/api/training/ejercicios')
        .set('Authorization', 'Bearer fake-token')
        .send({});

      expect(res.statusCode).toEqual(400);
    });

    it('debería manejar validaciones de enums correctamente', async () => {
      const ejercicioInvalido = {
        nombre: "Test Exercise",
        descripcion: "Test description",
        grupoMuscular: "Grupo Invalido",
        equipamiento: "Ninguno",
        series: 3,
        repeticiones: 10,
        tiempoDescanso: 60,
        nivelDificultad: "Principiante",
        nivelIntensidad: "Baja"
      };

      const res = await request(app)
        .post('/api/training/ejercicios')
        .set('Authorization', 'Bearer fake-token')
        .send(ejercicioInvalido);

      expect(res.statusCode).toEqual(400);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
