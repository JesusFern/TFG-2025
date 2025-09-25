import mongoose from 'mongoose';
import { 
  buscarAlimentosHibridoService, 
  buscarAlimentosLocalesService
} from '../../src/service/alimentos/alimentosHibridoService';

// Mock del modelo Ingrediente
jest.mock('../../src/models/diets/ingrediente', () => {
  return {
    __esModule: true,
    default: {
      aggregate: jest.fn()
    }
  };
});

// Mock del helper de OpenFoodFacts
jest.mock('../../src/helpers/ingredientes/ingredientesHelper', () => ({
  buscarAlimentosOpenFoodFacts: jest.fn()
}));

import Ingrediente from '../../src/models/diets/ingrediente';
import { buscarAlimentosOpenFoodFacts } from '../../src/helpers/ingredientes/ingredientesHelper';

const mockIngrediente = Ingrediente as jest.Mocked<typeof Ingrediente>;
const mockBuscarAlimentosOpenFoodFacts = buscarAlimentosOpenFoodFacts as jest.MockedFunction<typeof buscarAlimentosOpenFoodFacts>;

describe('Alimentos Híbridos Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarAlimentosLocalesService', () => {
    it('debería buscar ingredientes solo en la base de datos local', async () => {
      const mockResultados = [{
        ingredientes: [
          {
            _id: new mongoose.Types.ObjectId(),
            nombre: 'Manzana',
            calorias: 52,
            proteinas: 0.3,
            grasas: 0.2,
            hidratosCarbono: 14,
            fuente: 'Interna' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: [{ count: 1 }]
      }];

      mockIngrediente.aggregate.mockResolvedValue(mockResultados);

      const resultado = await buscarAlimentosLocalesService('manzana', 1, 10);

      expect(resultado).toBeDefined();
      expect(resultado.alimentos).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(resultado.fuentes.local).toBe(1);
      expect(resultado.fuentes.openfoodfacts).toBe(0);
      expect(mockIngrediente.aggregate).toHaveBeenCalled();
    });

    it('debería devolver array vacío cuando no hay resultados locales', async () => {
      const mockResultados = [{
        ingredientes: [],
        total: [{ count: 0 }]
      }];

      mockIngrediente.aggregate.mockResolvedValue(mockResultados);

      const resultado = await buscarAlimentosLocalesService('alimento_inexistente', 1, 10);

      expect(resultado).toBeDefined();
      expect(resultado.alimentos).toHaveLength(0);
      expect(resultado.total).toBe(0);
      expect(resultado.fuentes.local).toBe(0);
      expect(resultado.fuentes.openfoodfacts).toBe(0);
    });

    it('debería manejar errores en la búsqueda local', async () => {
      mockIngrediente.aggregate.mockRejectedValue(new Error('Error de base de datos'));

      const resultado = await buscarAlimentosLocalesService('manzana', 1, 10);

      expect(resultado).toBeDefined();
      expect(resultado.alimentos).toHaveLength(0);
      expect(resultado.total).toBe(0);
    });

    it('debería validar parámetros correctamente', async () => {
      // Test con término muy corto - debería lanzar error
      await expect(buscarAlimentosLocalesService('a', 1, 10)).rejects.toThrow('El nombre debe tener al menos 2 caracteres');

      // Test con maxResults > 100 - debería ajustarse a 100
      const mockResultados = [{
        ingredientes: [],
        total: [{ count: 0 }]
      }];
      mockIngrediente.aggregate.mockResolvedValue(mockResultados);

      const resultado2 = await buscarAlimentosLocalesService('manzana', 1, 150);
      expect(resultado2.maxResultados).toBe(100); // Debería limitar a 100
    });
  });

  describe('buscarAlimentosHibridoService', () => {
    it('debería buscar en ambas fuentes y combinar resultados', async () => {
      // Mock para búsqueda local
      const mockResultadosLocales = [{
        ingredientes: [
          {
            _id: new mongoose.Types.ObjectId(),
            nombre: 'Manzana Local',
            calorias: 52,
            proteinas: 0.3,
            grasas: 0.2,
            hidratosCarbono: 14,
            fuente: 'Interna' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: [{ count: 1 }]
      }];

      // Mock para OpenFoodFacts
      const mockResultadosOpenFF = {
        alimentos: [
          {
            id: '123456789',
            nombre: 'Manzana OpenFoodFacts',
            marca: 'Marca Test',
            categorias: 'Frutas',
            pais: 'España',
            imagen: 'https://example.com/imagen.jpg',
            informacionNutricional: {
              calorias: 50,
              proteinas: 0.3,
              carbohidratos: 13,
              grasas: 0.2,
              fibra: 2.4,
              azucares: 10.4,
              sal: 0,
              sodio: 1
            }
          }
        ],
        total: 1,
        pagina: 1,
        maxResultados: 10,
        hayMasResultados: false
      };

      mockIngrediente.aggregate.mockResolvedValue(mockResultadosLocales);
      mockBuscarAlimentosOpenFoodFacts.mockResolvedValue(mockResultadosOpenFF);

      const resultado = await buscarAlimentosHibridoService('manzana', 1, 10);

      expect(resultado).toBeDefined();
      expect(resultado.alimentos).toHaveLength(2);
      expect(resultado.total).toBe(2);
      expect(resultado.fuentes.local).toBe(1);
      expect(resultado.fuentes.openfoodfacts).toBe(1);
      expect(mockIngrediente.aggregate).toHaveBeenCalled();
      expect(mockBuscarAlimentosOpenFoodFacts).toHaveBeenCalledWith('manzana', 1, 10);
    });

    it('debería manejar errores en una fuente y continuar con la otra', async () => {
      // Mock para búsqueda local exitosa
      const mockResultadosLocales = [{
        ingredientes: [
          {
            _id: new mongoose.Types.ObjectId(),
            nombre: 'Manzana Local',
            calorias: 52,
            proteinas: 0.3,
            grasas: 0.2,
            hidratosCarbono: 14,
            fuente: 'Interna' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: [{ count: 1 }]
      }];

      mockIngrediente.aggregate.mockResolvedValue(mockResultadosLocales);
      mockBuscarAlimentosOpenFoodFacts.mockRejectedValue(new Error('Error OpenFoodFacts'));

      const resultado = await buscarAlimentosHibridoService('manzana', 1, 10);

      expect(resultado).toBeDefined();
      expect(resultado.alimentos).toHaveLength(1);
      expect(resultado.fuentes.local).toBe(1);
      expect(resultado.fuentes.openfoodfacts).toBe(0);
    });

    it('debería manejar errores en ambas fuentes', async () => {
      mockIngrediente.aggregate.mockRejectedValue(new Error('Error local'));
      mockBuscarAlimentosOpenFoodFacts.mockRejectedValue(new Error('Error OpenFoodFacts'));

      const resultado = await buscarAlimentosHibridoService('manzana', 1, 10);

      expect(resultado).toBeDefined();
      expect(resultado.alimentos).toHaveLength(0);
      expect(resultado.fuentes.local).toBe(0);
      expect(resultado.fuentes.openfoodfacts).toBe(0);
    });

    it('debería validar parámetros correctamente', async () => {
      // Test con término muy corto
      await expect(buscarAlimentosHibridoService('a', 1, 10)).rejects.toThrow('El nombre debe tener al menos 2 caracteres');
    });

    it('debería priorizar ingredientes locales sobre OpenFoodFacts', async () => {
      // Mock para búsqueda local
      const mockResultadosLocales = [{
        ingredientes: [
          {
            _id: new mongoose.Types.ObjectId(),
            nombre: 'Manzana',
            calorias: 52,
            proteinas: 0.3,
            grasas: 0.2,
            hidratosCarbono: 14,
            fuente: 'Interna' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: [{ count: 1 }]
      }];

      // Mock para OpenFoodFacts
      const mockResultadosOpenFF = {
        alimentos: [
          {
            id: '123456789',
            nombre: 'Manzana OpenFoodFacts',
            marca: 'Marca Test',
            informacionNutricional: {
              calorias: 50,
              proteinas: 0.3,
              carbohidratos: 13,
              grasas: 0.2
            }
          }
        ],
        total: 1,
        pagina: 1,
        maxResultados: 10,
        hayMasResultados: false
      };

      mockIngrediente.aggregate.mockResolvedValue(mockResultadosLocales);
      mockBuscarAlimentosOpenFoodFacts.mockResolvedValue(mockResultadosOpenFF);

      const resultado = await buscarAlimentosHibridoService('manzana', 1, 10);

      expect(resultado).toBeDefined();
      expect(resultado.alimentos).toHaveLength(2);
      // El primer elemento debería ser el local (prioridad)
      expect(resultado.alimentos[0]).toHaveProperty('fuente', 'Interna');
      expect(resultado.alimentos[1]).toHaveProperty('id', '123456789');
    });

    it('debería calcular correctamente si hay más resultados', async () => {
      const mockResultadosLocales = [{
        ingredientes: [
          {
            _id: new mongoose.Types.ObjectId(),
            nombre: 'Manzana Local',
            calorias: 52,
            proteinas: 0.3,
            grasas: 0.2,
            hidratosCarbono: 14,
            fuente: 'Interna' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: [{ count: 1 }]
      }];

      const mockResultadosOpenFF = {
        alimentos: [],
        total: 0,
        pagina: 1,
        maxResultados: 10,
        hayMasResultados: false
      };

      mockIngrediente.aggregate.mockResolvedValue(mockResultadosLocales);
      mockBuscarAlimentosOpenFoodFacts.mockResolvedValue(mockResultadosOpenFF);

      const resultado = await buscarAlimentosHibridoService('manzana', 1, 10);

      expect(resultado.hayMasResultados).toBe(false);
    });
  });

  describe('Casos Edge', () => {
    it('debería manejar términos de búsqueda con espacios', async () => {
      const mockResultados = [{
        ingredientes: [],
        total: [{ count: 0 }]
      }];

      mockIngrediente.aggregate.mockResolvedValue(mockResultados);

      const resultado = await buscarAlimentosLocalesService('  manzana  ', 1, 10);

      expect(resultado).toBeDefined();
      expect(mockIngrediente.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              $text: expect.objectContaining({
                $search: 'manzana'
              })
            })
          })
        ])
      );
    });

    it('debería manejar páginas inválidas', async () => {
      const mockResultados = [{
        ingredientes: [],
        total: [{ count: 0 }]
      }];

      mockIngrediente.aggregate.mockResolvedValue(mockResultados);

      // Test con página 0 (el servicio no ajusta páginas inválidas)
      const resultado = await buscarAlimentosLocalesService('manzana', 0, 10);
      expect(resultado.pagina).toBe(0);
    });

    it('debería manejar maxResults inválidos', async () => {
      const mockResultados = [{
        ingredientes: [],
        total: [{ count: 0 }]
      }];

      mockIngrediente.aggregate.mockResolvedValue(mockResultados);

      // Test con maxResults < 1 (debería ajustarse a 20)
      const resultado = await buscarAlimentosLocalesService('manzana', 1, 0);
      expect(resultado.maxResultados).toBe(20);

      // Test con maxResults > 100 (debería limitar a 100)
      const resultado2 = await buscarAlimentosLocalesService('manzana', 1, 150);
      expect(resultado2.maxResultados).toBe(100);
    });
  });

  describe('Conversión de tipos', () => {
    it('debería convertir correctamente ingredientes locales al formato estándar', async () => {
      const mockResultados = [{
        ingredientes: [
          {
            _id: new mongoose.Types.ObjectId(),
            nombre: 'Manzana',
            calorias: 52,
            proteinas: 0.3,
            grasas: 0.2,
            hidratosCarbono: 14,
            fuente: 'Interna' as const,
            creador: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: [{ count: 1 }]
      }];

      mockIngrediente.aggregate.mockResolvedValue(mockResultados);

      const resultado = await buscarAlimentosLocalesService('manzana', 1, 10);

      expect(resultado.alimentos[0]).toMatchObject({
        _id: expect.any(String),
        nombre: 'Manzana',
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14,
        fuente: 'Interna',
        creador: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
