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
      slug: ejercicioData.slug,
      descripcion: ejercicioData.descripcion,
      grupoMuscular: ejercicioData.grupoMuscular,
      equipamiento: ejercicioData.equipamiento,
      nivelDificultad: ejercicioData.nivelDificultad,
      tipoEjercicio: ejercicioData.tipoEjercicio,
      instrucciones: ejercicioData.instrucciones,
      videoDemostrativo: ejercicioData.videoDemostrativo,
      creador: ejercicioData.creadorId,
      arquetipo: false,
      publico: ejercicioData.publico || false,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }),
  obtenerEjerciciosService: jest.fn().mockImplementation(async () => {
    return [{
      _id: ejercicioId,
      nombre: "Press de Banca",
      slug: "press-de-banca",
      descripcion: "Ejercicio para pecho",
      grupoMuscular: "Pecho",
      equipamiento: "Barra",
      nivelDificultad: "Intermedio",
      tipoEjercicio: "Fuerza",
      instrucciones: "Acuéstate en banco y presiona la barra",
      videoDemostrativo: "https://example.com/video.mp4",
      creador: { _id: workerId, nombre: "Test Trainer", email: "trainer@test.com" },
      arquetipo: false,
      publico: true,
      activo: true
    }];
  }),
  obtenerEjercicioPorIdService: jest.fn().mockImplementation(async (id) => {
    return {
      _id: id,
      nombre: "Press de Banca",
      slug: "press-de-banca",
      descripcion: "Ejercicio para pecho",
      grupoMuscular: "Pecho",
      equipamiento: "Barra",
      nivelDificultad: "Intermedio",
      tipoEjercicio: "Fuerza",
      instrucciones: "Acuéstate en banco y presiona la barra",
      videoDemostrativo: "https://example.com/video.mp4",
      creador: { _id: workerId, nombre: "Test Trainer", email: "trainer@test.com" },
      arquetipo: false,
      publico: true,
      activo: true
    };
  }),
  obtenerEjercicioPorSlugService: jest.fn().mockImplementation(async (slug) => {
    if (slug === 'invalid-slug') {
      throw new Error('Ejercicio no encontrado');
    }
    return {
      _id: ejercicioId,
      nombre: "Press de Banca",
      slug: slug,
      descripcion: "Ejercicio para pecho",
      grupoMuscular: "Pecho",
      equipamiento: "Barra",
      nivelDificultad: "Intermedio",
      tipoEjercicio: "Fuerza",
      instrucciones: "Acuéstate en banco y presiona la barra",
      videoDemostrativo: "https://example.com/video.mp4",
      creador: { _id: workerId, nombre: "Test Trainer", email: "trainer@test.com" },
      arquetipo: false,
      publico: true,
      activo: true
    };
  }),
  actualizarEjercicioService: jest.fn().mockImplementation(async (id, creadorId, datos) => {
    return {
      _id: id,
      nombre: datos.nombre || "Press de Banca",
      slug: datos.slug || "press-de-banca",
      descripcion: datos.descripcion || "Ejercicio para pecho",
      grupoMuscular: datos.grupoMuscular || "Pecho",
      equipamiento: datos.equipamiento || "Barra",
      nivelDificultad: datos.nivelDificultad || "Intermedio",
      tipoEjercicio: datos.tipoEjercicio || "Fuerza",
      instrucciones: datos.instrucciones || "Acuéstate en banco y presiona la barra",
      videoDemostrativo: datos.videoDemostrativo || "https://example.com/video.mp4",
      creador: creadorId,
      arquetipo: false,
      publico: datos.publico !== undefined ? datos.publico : true,
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
        slug: "press-de-banca",
        descripcion: "Ejercicio para desarrollar el pecho",
        grupoMuscular: "Pecho",
        equipamiento: "Barra",
        nivelDificultad: "Intermedio",
        tipoEjercicio: "Fuerza",
        instrucciones: "Acuéstate en banco y presiona la barra",
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
        // Faltan campos requeridos: slug, equipamiento, nivelDificultad, tipoEjercicio
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

  describe('GET /api/training/ejercicios/slug/:slug', () => {
    it('debería obtener un ejercicio por slug', async () => {
      const res = await request(app)
        .get('/api/training/ejercicios/slug/press-de-banca')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ejercicio');
      expect(res.body.ejercicio.slug).toEqual('press-de-banca');
    });

    it('debería fallar con slug inválido', async () => {
      const res = await request(app)
        .get('/api/training/ejercicios/slug/invalid-slug')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toEqual(404);
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
        slug: "test-exercise",
        descripcion: "Test description",
        grupoMuscular: "Grupo Invalido",
        equipamiento: "Ninguno",
        nivelDificultad: "Principiante",
        tipoEjercicio: "Fuerza"
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
        slug: "test-exercise",
        descripcion: "Test description",
        grupoMuscular: "Pecho",
        equipamiento: "Ninguno",
        nivelDificultad: "Nivel Invalido",
        tipoEjercicio: "Fuerza"
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
