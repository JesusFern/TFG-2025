import request from 'supertest';
import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types';

const workerId = new mongoose.Types.ObjectId().toString();
const clienteId = new mongoose.Types.ObjectId().toString();
const platoId = new mongoose.Types.ObjectId().toString();
const dietaId = new mongoose.Types.ObjectId().toString();

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

jest.mock('../../src/models/diets/dieta', () => {
  return {
    findById: jest.fn().mockImplementation((id) => {
      return {
        _id: id,
        nombre: "Dieta Test",
        creador: workerId,
        draftMode: true,
        save: jest.fn().mockResolvedValue({
          _id: id,
          nombre: "Dieta Test",
          creador: workerId,
          draftMode: false
        })
      };
    })
  };
});

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
      comidas: Array.from({ length: dietaData.comidasDiarias }, (_, index) => ({
        nombreComida: dietaData.nombreComidas[index],
        horaEstimada: dietaData.horasComidas[index],
        platos: [{
          _id: platoId,
          orden: 1,
          nombre: "Plato Test",
          receta: null
        }]
      }))
    }));

    return {
      _id: dietaId,
      nombre: dietaData.nombre,
      descripcion: dietaData.descripcion,
      tipo: dietaData.tipo,
      duracion: dietaData.duracion,
      comidasDiarias: dietaData.comidasDiarias,
      fechaInicio: fechaInicio,
      creador: dietaData.creadorId,
      asignadaA: [dietaData.asignadaA],
      draftMode: true,
      dias
    };
  }),
  
  obtenerDietaService: jest.fn().mockImplementation(async (id) => {
    return {
      _id: id,
      nombre: "Dieta Test",
      descripcion: "Dieta de prueba",
      tipo: ["Mediterránea"],
      duracion: 2,
      comidasDiarias: 2,
      fechaInicio: new Date(),
      creador: workerId,
      asignadaA: [clienteId],
      draftMode: true,
      dias: [
        {
          caloriasTotales: 2000,
          comidas: [
            {
              nombreComida: "Desayuno",
              horaEstimada: "08:00",
              platos: [{ _id: platoId, nombre: "Plato Test", receta: null }]
            },
            {
              nombreComida: "Almuerzo",
              horaEstimada: "14:00",
              platos: [{ _id: platoId, nombre: "Plato Test", receta: null }]
            }
          ]
        },
        {
          caloriasTotales: 2100,
          comidas: [
            {
              nombreComida: "Desayuno",
              horaEstimada: "08:00",
              platos: [{ _id: platoId, nombre: "Plato Test", receta: null }]
            },
            {
              nombreComida: "Almuerzo",
              horaEstimada: "14:00",
              platos: [{ _id: platoId, nombre: "Plato Test", receta: null }]
            }
          ]
        }
      ]
    };
  }),
  
  actualizarDietaService: jest.fn().mockImplementation(async (id, userId, datosActualizacion) => {
    return {
      _id: id,
      ...datosActualizacion,
      creador: workerId,
      asignadaA: [clienteId],
      draftMode: true
    };
  }),
  
  actualizarDiaDietaService: jest.fn().mockImplementation(async (dietaId, userId, diaIndex, datosDia) => {
    return {
      ...datosDia,
      comidas: [
        {
          nombreComida: "Desayuno Actualizado",
          horaEstimada: "08:30",
          platos: [{ _id: platoId, nombre: "Plato Test", receta: null }]
        },
        {
          nombreComida: "Almuerzo Actualizado",
          horaEstimada: "14:30",
          platos: [{ _id: platoId, nombre: "Plato Test", receta: null }]
        }
      ]
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

// Mock controllers
jest.mock('../../src/controllers/users/userController', () => ({
  registerUser: jest.fn().mockImplementation((req, res) => {
    const { email } = req.body;
    if (email === 'existing@example.com') {
      res.status(400).json({ message: 'El email ya está registrado' });
    } else {
      res.status(201).json({ 
        message: 'Usuario registrado correctamente',
        user: {
          _id: '123456789012345678901234',
          fullName: 'Test User',
          email: email || 'test@example.com',
          role: 'user'
        }
      });
    }
  }),
  getMyProfile: jest.fn(),
  updateMyProfile: jest.fn(),
  loginUser: jest.fn().mockImplementation((req, res) => {
    res.status(200).json({ 
      token: 'fake-token',
      user: {
        _id: '123456789012345678901234',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }
    });
  }),
  assignWorker: jest.fn().mockImplementation((req, res) => {
    if (!req.user?.id) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    
    const { workerId } = req.body;
    
    if (!workerId) {
      res.status(400).json({ message: 'Es necesario proporcionar un ID de trabajador' });
      return;
    }
    
    res.status(200).json({
      message: 'Te has asignado correctamente al trabajador',
      worker: {
        _id: workerId,
        fullName: 'Trabajador Test',
        email: 'worker@example.com',
        workerType: 'Nutricionista'
      }
    });
  }),
  changeMyPassword: jest.fn().mockImplementation((req, res) => {
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  }),
  uploadProfilePhoto: jest.fn().mockImplementation((req, res) => {
    res.status(200).json({ message: 'Foto de perfil actualizada correctamente' });
  }),
  
  getUsers: jest.fn().mockImplementation((req, res) => {
    res.status(200).json({ users: [] });
  }),
  getUserById: jest.fn().mockImplementation((req, res) => {
    res.status(200).json({ user: {} });
  }),
  updateUser: jest.fn().mockImplementation((req, res) => {
    res.status(200).json({ message: 'Usuario actualizado' });
  }),
  deleteUser: jest.fn().mockImplementation((req, res) => {
    res.status(200).json({ message: 'Usuario eliminado' });
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
  step4Validator: [],
  assignWorkerValidator: []
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
        fechaInicio: fechaFormateada,
        horasComidas: ["08:00", "14:00"],
        nombreComidas: ["Desayuno", "Almuerzo"]
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

  it('debería obtener una dieta por ID', async () => {
    const res = await request(app)
      .get(`/api/diets/${dietaId}`)
      .set('Authorization', 'Bearer fake-token');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('dieta');
    expect(res.body.dieta).toHaveProperty('_id', dietaId);
    expect(res.body.dieta).toHaveProperty('nombre', 'Dieta Test');
  });

  it('debería actualizar una dieta', async () => {
    const res = await request(app)
      .patch(`/api/diets/${dietaId}`)
      .set('Authorization', 'Bearer fake-token')
      .send({
        nombre: "Dieta Actualizada",
        descripcion: "Descripción actualizada"
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('dieta');
    expect(res.body.dieta).toHaveProperty('nombre', 'Dieta Actualizada');
    expect(res.body.dieta).toHaveProperty('descripcion', 'Descripción actualizada');
  });

  it('debería actualizar un día de dieta', async () => {
    const res = await request(app)
      .patch(`/api/diets/${dietaId}/dias/0`)
      .set('Authorization', 'Bearer fake-token')
      .send({
        caloriasTotales: 2500,
        macronutrientes: "50% carbohidratos, 30% proteínas, 20% grasas"
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('dia');
    expect(res.body.dia).toHaveProperty('caloriasTotales', 2500);
    expect(res.body.dia).toHaveProperty('macronutrientes', '50% carbohidratos, 30% proteínas, 20% grasas');
  });

  it('debería publicar una dieta (cambiar draftMode a false)', async () => {
    const res = await request(app)
      .patch(`/api/diets/${dietaId}/publicar`)
      .set('Authorization', 'Bearer fake-token');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('dieta');
    expect(res.body.dieta).toHaveProperty('draftMode', false);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});