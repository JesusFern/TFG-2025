import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types';
import { calcularSemanasDieta } from '../../src/service/diets/listaCompraService';

const workerId = new mongoose.Types.ObjectId().toString();
const dietaId = new mongoose.Types.ObjectId().toString();
const ingredienteId = new mongoose.Types.ObjectId().toString();

// Mock de la dieta
const mockDieta = {
  _id: dietaId,
  nombre: 'Dieta Test',
  descripcion: 'Dieta para testear lista de compra',
  tipo: ['Equilibrada'],
  duracion: 10,
  comidasDiarias: 3,
  fechaInicio: new Date('2024-01-15'), // Lunes
  creador: workerId,
  asignadaA: [workerId],
  dias: [
    {
      cumplimiento: false,
      comidas: [
        {
          horaEstimada: '08:00',
          nombreComida: 'Desayuno',
          platos: [{
            orden: 1,
            nombre: 'Manzana con yogur',
            receta: null,
            ingredientesPersonalizados: [{ ingrediente: ingredienteId, peso: 150 }]
          }]
        }
      ]
    }
  ]
};

// Mock de ingrediente
const mockIngrediente = {
  _id: ingredienteId,
  nombre: 'Manzana',
  calorias: 52,
  proteinas: 0.3,
  grasas: 0.2,
  hidratosCarbono: 14,
  fuente: 'Interna',
  creador: workerId
};

jest.mock('../../src/models/diets/dieta', () => {
  return {
    findById: jest.fn().mockImplementation((id) => {
      if (id === dietaId) {
        return {
          ...mockDieta,
          populate: jest.fn().mockResolvedValue(mockDieta)
        };
      }
      return null;
    })
  };
});

jest.mock('../../src/models/diets/ingrediente', () => {
  return {
    findById: jest.fn().mockImplementation((id) => {
      if (id === ingredienteId) {
        return mockIngrediente;
      }
      return null;
    })
  };
});

jest.mock('../../src/middlewares/authMiddleware', () => {
  return {
    authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      req.user = { id: workerId, role: 'worker', email: 'worker@test.com' };
      next();
    }
  };
});

describe('Lista de Compra Service', () => {
  describe('calcularSemanasDieta', () => {
    it('debe calcular correctamente las semanas para una dieta de 28 días empezando en lunes', () => {
      const fechaInicio = new Date('2024-01-15'); // Lunes
      const duracion = 28;

      const semanas = calcularSemanasDieta(fechaInicio, duracion);

      expect(semanas).toHaveLength(5);
      
      // Semana 1: días 0-6 (lunes a domingo)
      expect(semanas[0]).toEqual({
        semana: 1,
        fechaInicio: new Date('2024-01-15'),
        fechaFin: new Date('2024-01-21'),
        diasIncluidos: [0, 1, 2, 3, 4, 5, 6]
      });

      // Semana 2: días 7-13 (lunes a domingo)
      expect(semanas[1]).toEqual({
        semana: 2,
        fechaInicio: new Date('2024-01-22'),
        fechaFin: new Date('2024-01-28'),
        diasIncluidos: [7, 8, 9, 10, 11, 12, 13]
      });

      // Semana 5: últimos 4 días (días 24-27)
      expect(semanas[4]).toEqual({
        semana: 5,
        fechaInicio: new Date('2024-01-08'),
        fechaFin: new Date('2024-01-14'),
        diasIncluidos: [24, 25, 26, 27]
      });
    });

    it('debe empezar desde la fecha exacta si no es lunes', () => {
      const fechaInicio = new Date('2024-01-17'); // Miércoles
      const duracion = 10;

      const semanas = calcularSemanasDieta(fechaInicio, duracion);

      expect(semanas).toHaveLength(2);
      
      // Debe empezar desde la fecha exacta (17 de enero - miércoles)
      expect(semanas[0].fechaInicio).toEqual(new Date('2024-01-17'));
      expect(semanas[0].diasIncluidos).toEqual([0, 1, 2, 3, 4]); // Miércoles a domingo
    });

    it('debe manejar dietas de duración corta', () => {
      const fechaInicio = new Date('2024-01-15'); // Lunes
      const duracion = 3;

      const semanas = calcularSemanasDieta(fechaInicio, duracion);

      expect(semanas).toHaveLength(1);
      expect(semanas[0].diasIncluidos).toEqual([0, 1, 2]);
    });
  });

});

afterAll(async () => {
  await mongoose.connection.close();
});