import request from 'supertest';
import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types';

const workerId = new mongoose.Types.ObjectId().toString();
const clienteId = new mongoose.Types.ObjectId().toString();
const platoId = new mongoose.Types.ObjectId().toString();

interface Plato {
  _id?: string;
  orden?: number;
  nombre?: string;
  receta?: string | null;
  descripcion?: string;
  imagenUrl?: string;
  calorias?: number;
  macros?: {
    proteinas?: number;
    carbohidratos?: number;
    grasas?: number;
  };
  alergenos?: string[];
  tiempoPreparacion?: number;
  [key: string]: unknown;
}

jest.mock('../../src/middlewares/authMiddleware', () => {
  return {
    authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      req.user = { id: workerId, role: 'worker' };
      next();
    },
    authorizeWorker: (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      next();
    },
    authorizeNutricionista: (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      next();
    },
    authorizeUserOrAdmin: (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      next();
    },
    authorizeAdmin: (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
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
          role: 'worker',
          workerType: 'Nutricionista'
        });
      }
      return Promise.resolve({
        _id: id,
        role: 'user'
      });
    })
  };
});

jest.mock('../../src/service/diets/dietService', () => ({
  crearDietaService: jest.fn().mockImplementation(async (dietaData) => {
    const fechaParts = dietaData.fechaInicio.split('-');
    const fechaInicio = new Date(
      parseInt(fechaParts[2]), 
      parseInt(fechaParts[1]) - 1, 
      parseInt(fechaParts[0])
    );
    
    const dias = Array.from({ length: dietaData.duracion }, () => ({
      caloriasTotales: null,
      macronutrientes: '',
      micronutrientes: '',
      numeroComidas: null,
      genero: '',
      requerimientosHidratacion: '',
      cumplimiento: false,
      comidas: Array.from({ length: dietaData.comidasDiarias }, () => ({
        horaEstimada: null,
        platos: [{
          _id: platoId,
          orden: 1,
          nombre: "Plato Test",
          receta: null
        }]
      }))
    }));

    return {
      _id: new mongoose.Types.ObjectId().toString(),
      nombre: dietaData.nombre,
      descripcion: dietaData.descripcion,
      tipo: dietaData.tipo,
      duracion: dietaData.duracion,
      comidasDiarias: dietaData.comidasDiarias,
      fechaInicio: fechaInicio,
      creador: dietaData.creadorId,
      asignadaA: [dietaData.asignadaA],
      dias
    };
  })
}));

jest.mock('../../src/service/diets/plateService', () => ({
  actualizarPlatosService: jest.fn().mockImplementation(async (platos: Plato[]) => {
    return platos.map((p: Plato) => ({
      ...p,
      nombre: p.nombre || "Plato original",
      receta: p.receta === null ? null : (p.receta || "Receta original")
    }));
  })
}));

jest.mock('../../src/validators/userValidators', () => ({
  loginValidator: [],
  createUserValidator: [],
  updateUserValidator: [],
  registerValidator: [],
  step0Validator: [],
  step1Validator: [],
  step2Validator: [],
  step3Validator: [],
  step4Validator: []
}));

import app from '../../src/server';

describe('Diet Endpoints', () => {
  beforeAll(async () => {
  });

  it('debería crear una dieta', async () => {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 7);
    const fechaFormateada = `${fechaInicio.getDate()}-${fechaInicio.getMonth() + 1}-${fechaInicio.getFullYear()}`;
    
    const res = await request(app)
      .post('/api/diets')
      .set('Authorization', 'Bearer fake-token')
      .send({
        nombre: "Dieta Test",
        descripcion: "Dieta de prueba",
        tipo: ["Mediterránea"],
        duracion: 2,
        comidasDiarias: 2,
        asignadaA: clienteId,
        fechaInicio: fechaFormateada
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('dieta');
  });

  it('debería actualizar el nombre y poner receta a null en un plato embebido', async () => {
    const res = await request(app)
      .put('/api/diets/platos')
      .set('Authorization', 'Bearer fake-token')
      .send({
        platos: [
          {
            _id: platoId,
            nombre: "Plato Actualizado",
            receta: null
          }
        ]
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.platos[0].nombre).toBe("Plato Actualizado");
    expect(res.body.platos[0].receta).toBeNull();
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});