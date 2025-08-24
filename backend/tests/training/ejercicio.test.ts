import request from 'supertest';
import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types';
import app from '../../src/server';

const workerId = new mongoose.Types.ObjectId().toString();
const ejercicioId = new mongoose.Types.ObjectId().toString();

jest.mock('../../src/middlewares/authMiddleware', () => {
  return {
    authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      req.user = { id: workerId, role: 'worker' };
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
      return Promise.resolve({
        _id: id,
        nombre: "Usuario Test",
        email: "usuario@test.com",
        role: 'user'
      });
    })
  };
});

jest.mock('../../src/service/training/ejercicioService', () => ({
  crearEjercicioService: jest.fn().mockImplementation(async (ejercicioData) => {
    return {
      _id: ejercicioId,
      nombre: ejercicioData.nombre,
      descripcion: ejercicioData.descripcion,
      grupoMuscular: ejercicioData.grupoMuscular,
      equipamiento: ejercicioData.equipamiento,
      series: ejercicioData.series,
      repeticiones: ejercicioData.repeticiones,
      tiempoDescanso: ejercicioData.tiempoDescanso,
      nivelDificultad: ejercicioData.nivelDificultad,
      nivelIntensidad: ejercicioData.nivelIntensidad,
      videoDemostrativo: ejercicioData.videoDemostrativo,
      creador: ejercicioData.creadorId,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }),
  obtenerEjerciciosService: jest.fn().mockImplementation(async () => {
    return [{
      _id: ejercicioId,
      nombre: "Press de Banca",
      descripcion: "Ejercicio para pecho",
      grupoMuscular: "Pecho",
      equipamiento: "Barra",
      series: 3,
      repeticiones: 10,
      tiempoDescanso: 60,
      nivelDificultad: "Intermedio",
      nivelIntensidad: "Media",
      videoDemostrativo: "https://example.com/video.mp4",
      creador: { _id: workerId, nombre: "Test Trainer", email: "trainer@test.com" },
      activo: true
    }];
  }),
  obtenerEjercicioPorIdService: jest.fn().mockImplementation(async (id) => {
    return {
      _id: id,
      nombre: "Press de Banca",
      descripcion: "Ejercicio para pecho",
      grupoMuscular: "Pecho",
      equipamiento: "Barra",
      series: 3,
      repeticiones: 10,
      tiempoDescanso: 60,
      nivelDificultad: "Intermedio",
      nivelIntensidad: "Media",
      videoDemostrativo: "https://example.com/video.mp4",
      creador: { _id: workerId, nombre: "Test Trainer", email: "trainer@test.com" },
      activo: true
    };
  }),
  actualizarEjercicioService: jest.fn().mockImplementation(async (id, creadorId, datos) => {
    return {
      _id: id,
      nombre: datos.nombre || "Press de Banca",
      descripcion: datos.descripcion || "Ejercicio para pecho",
      grupoMuscular: datos.grupoMuscular || "Pecho",
      equipamiento: datos.equipamiento || "Barra",
      series: datos.series || 3,
      repeticiones: datos.repeticiones || 10,
      tiempoDescanso: datos.tiempoDescanso || 60,
      nivelDificultad: datos.nivelDificultad || "Intermedio",
      nivelIntensidad: datos.nivelIntensidad || "Media",
      videoDemostrativo: datos.videoDemostrativo || "https://example.com/video.mp4",
      creador: creadorId,
      activo: true
    };
  }),
  eliminarEjercicioService: jest.fn().mockImplementation(async () => {
    return { message: 'Ejercicio eliminado correctamente' };
  })
}));

describe('Ejercicio Endpoints', () => {
  beforeAll(async () => {
    // Setup inicial
  });

  describe('POST /api/training/ejercicios', () => {
    it('debería crear un ejercicio correctamente', async () => {
      const ejercicioData = {
        nombre: "Press de Banca",
        descripcion: "Ejercicio para desarrollar el pecho",
        grupoMuscular: "Pecho",
        equipamiento: "Barra",
        series: 3,
        repeticiones: 10,
        tiempoDescanso: 60,
        nivelDificultad: "Intermedio",
        nivelIntensidad: "Media",
        videoDemostrativo: "https://example.com/video.mp4"
      };

      const res = await request(app)
        .post('/api/training/ejercicios')
        .set('Authorization', 'Bearer fake-token')
        .send(ejercicioData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Ejercicio creado correctamente');
      expect(res.body).toHaveProperty('ejercicio');
      expect(res.body.ejercicio.nombre).toEqual(ejercicioData.nombre);
      expect(res.body.ejercicio.grupoMuscular).toEqual(ejercicioData.grupoMuscular);
    });

    it('debería fallar al crear ejercicio sin campos requeridos', async () => {
      const ejercicioIncompleto = {
        nombre: "Press de Banca",
        grupoMuscular: "Pecho"
      };

      const res = await request(app)
        .post('/api/training/ejercicios')
        .set('Authorization', 'Bearer fake-token')
        .send(ejercicioIncompleto);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/training/ejercicios', () => {
    it('debería obtener todos los ejercicios', async () => {
      const res = await request(app)
        .get('/api/training/ejercicios')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ejercicios');
      expect(Array.isArray(res.body.ejercicios)).toBeTruthy();
      expect(res.body.ejercicios.length).toBeGreaterThan(0);
    });

    it('debería filtrar ejercicios por grupo muscular', async () => {
      const res = await request(app)
        .get('/api/training/ejercicios?grupoMuscular=Pecho')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ejercicios');
    });

    it('debería filtrar ejercicios por nivel de dificultad', async () => {
      const res = await request(app)
        .get('/api/training/ejercicios?nivelDificultad=Intermedio')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ejercicios');
    });
  });

  describe('GET /api/training/ejercicios/:id', () => {
    it('debería obtener un ejercicio por ID', async () => {
      const res = await request(app)
        .get(`/api/training/ejercicios/${ejercicioId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ejercicio');
      expect(res.body.ejercicio._id).toEqual(ejercicioId);
    });

    it('debería fallar con ID inválido', async () => {
      const res = await request(app)
        .get('/api/training/ejercicios/invalid-id')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PUT /api/training/ejercicios/:id', () => {
    it('debería actualizar un ejercicio correctamente', async () => {
      const datosActualizacion = {
        nombre: "Press de Banca Inclinado",
        series: 4,
        repeticiones: 12
      };

      const res = await request(app)
        .put(`/api/training/ejercicios/${ejercicioId}`)
        .set('Authorization', 'Bearer fake-token')
        .send(datosActualizacion);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Ejercicio actualizado correctamente');
      expect(res.body).toHaveProperty('ejercicio');
    });

    it('debería fallar al actualizar ejercicio inexistente', async () => {
      const res = await request(app)
        .put('/api/training/ejercicios/nonexistent-id')
        .set('Authorization', 'Bearer fake-token')
        .send({ nombre: "Nuevo Nombre" });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE /api/training/ejercicios/:id', () => {
    it('debería eliminar un ejercicio correctamente', async () => {
      const res = await request(app)
        .delete(`/api/training/ejercicios/${ejercicioId}`)
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Ejercicio eliminado correctamente');
    });

    it('debería fallar al eliminar ejercicio inexistente', async () => {
      const res = await request(app)
        .delete('/api/training/ejercicios/nonexistent-id')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('Validaciones de campos', () => {
    it('debería validar grupo muscular válido', async () => {
      const ejercicioData = {
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
        .send(ejercicioData);

      expect(res.statusCode).toEqual(400);
    });

    it('debería validar nivel de dificultad válido', async () => {
      const ejercicioData = {
        nombre: "Test Exercise",
        descripcion: "Test description",
        grupoMuscular: "Pecho",
        equipamiento: "Ninguno",
        series: 3,
        repeticiones: 10,
        tiempoDescanso: 60,
        nivelDificultad: "Nivel Invalido",
        nivelIntensidad: "Baja"
      };

      const res = await request(app)
        .post('/api/training/ejercicios')
        .set('Authorization', 'Bearer fake-token')
        .send(ejercicioData);

      expect(res.statusCode).toEqual(400);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
