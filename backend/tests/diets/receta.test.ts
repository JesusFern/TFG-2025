import mongoose from 'mongoose';
import { 
  crearRecetaService, 
  obtenerRecetasPublicasService, 
  obtenerMisRecetasService, 
  obtenerRecetasPublicasYPropiasService,
  actualizarRecetaService,
  eliminarRecetaService,
  limpiarImagenesHuerfanasService
} from '../../src/service/diets/recetaService';
import Receta from '../../src/models/diets/receta';

// Mock del modelo Receta

jest.mock('../../src/models/diets/receta', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((data) => {
      const receta = {
        _id: new mongoose.Types.ObjectId(),
        nombreReceta: data.nombreReceta,
        ingredientes: data.ingredientes,
        pasosPreparacion: data.pasosPreparacion || [],
        tiempoPreparacion: data.tiempoPreparacion || '',
        informacionNutricional: data.informacionNutricional || '',
        imagenes: data.imagenes || [],
        publica: data.publica,
        creador: data.creador,
        save: jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          nombreReceta: data.nombreReceta,
          ingredientes: data.ingredientes,
          pasosPreparacion: data.pasosPreparacion || [],
          tiempoPreparacion: data.tiempoPreparacion || '',
          informacionNutricional: data.informacionNutricional || '',
          imagenes: data.imagenes || [],
          publica: data.publica,
          creador: data.creador
        })
      };
      return receta;
    }),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn()
  };
});

describe('Receta Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearRecetaService', () => {
    it('debería crear una receta exitosamente', async () => {
      const datosReceta = {
        nombreReceta: 'Ensalada César',
        ingredientes: ['Lechuga', 'Pollo', 'Queso parmesano'],
        pasosPreparacion: ['Cortar la lechuga', 'Cocinar el pollo'],
        tiempoPreparacion: '20 minutos',
        informacionNutricional: '350 calorías',
        imagenes: ['/uploads/recipes/test/image.jpg'],
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.nombreReceta).toBe(datosReceta.nombreReceta);
      expect(resultado.ingredientes).toEqual(datosReceta.ingredientes);
      expect(resultado.publica).toBe(true);
    });

    it('debería convertir publica de string a boolean', async () => {
      const datosReceta = {
        nombreReceta: 'Ensalada César',
        ingredientes: ['Lechuga', 'Pollo'],
        publica: 'false',
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.publica).toBe(false);
    });

    it('debería manejar ingredientes vacíos correctamente', async () => {
      const datosReceta = {
        nombreReceta: 'Ensalada César',
        ingredientes: [],
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.ingredientes).toEqual([]);
    });

    it('debería manejar campos opcionales correctamente', async () => {
      const datosReceta = {
        nombreReceta: 'Receta Simple',
        ingredientes: ['Ingrediente 1'],
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.pasosPreparacion).toEqual([]);
      expect(resultado.tiempoPreparacion).toBe('');
      expect(resultado.informacionNutricional).toBe('');
      expect(resultado.imagenes).toEqual([]);
    });
  });

  describe('obtenerRecetasPublicasService', () => {
    it('debería obtener solo recetas públicas', async () => {
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            nombreReceta: 'Receta Pública',
            publica: true
          }
        ])
      });

      (Receta as jest.MockedClass<typeof Receta>).find = mockFind;

      const resultado = await obtenerRecetasPublicasService();

      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado)).toBe(true);
      expect(mockFind).toHaveBeenCalledWith({ publica: true });
    });

    it('debería devolver array vacío si no hay recetas públicas', async () => {
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      (Receta as jest.MockedClass<typeof Receta>).find = mockFind;

      const resultado = await obtenerRecetasPublicasService();

      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(0);
    });
  });

  describe('obtenerMisRecetasService', () => {
    it('debería obtener recetas del creador específico', async () => {
      const creadorId = new mongoose.Types.ObjectId().toString();
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            nombreReceta: 'Mi Receta',
            creador: creadorId
          }
        ])
      });

      (Receta as jest.MockedClass<typeof Receta>).find = mockFind;

      const resultado = await obtenerMisRecetasService(creadorId);

      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado)).toBe(true);
      expect(mockFind).toHaveBeenCalledWith({ creador: creadorId });
    });

    it('debería devolver array vacío si el creador no tiene recetas', async () => {
      const creadorId = new mongoose.Types.ObjectId().toString();
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      (Receta as jest.MockedClass<typeof Receta>).find = mockFind;

      const resultado = await obtenerMisRecetasService(creadorId);

      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(0);
    });
  });

  describe('obtenerRecetasPublicasYPropiasService', () => {
    it('debería obtener recetas públicas y propias del usuario', async () => {
      const creadorId = new mongoose.Types.ObjectId().toString();
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            nombreReceta: 'Receta Pública',
            publica: true
          },
          {
            _id: new mongoose.Types.ObjectId(),
            nombreReceta: 'Mi Receta',
            publica: false,
            creador: creadorId
          }
        ])
      });

      (Receta as jest.MockedClass<typeof Receta>).find = mockFind;

      const resultado = await obtenerRecetasPublicasYPropiasService(creadorId);

      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(2);
      expect(mockFind).toHaveBeenCalledWith({
        $or: [
          { publica: true },
          { creador: creadorId }
        ]
      });
    });

    it('debería manejar casos donde no hay recetas', async () => {
      const creadorId = new mongoose.Types.ObjectId().toString();
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      (Receta as jest.MockedClass<typeof Receta>).find = mockFind;

      const resultado = await obtenerRecetasPublicasYPropiasService(creadorId);

      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(0);
    });
  });

  describe('Validaciones de Datos', () => {
    it('debería manejar ingredientes con espacios en blanco', async () => {
      const datosReceta = {
        nombreReceta: 'Receta Test',
        ingredientes: ['  Ingrediente 1  ', '  Ingrediente 2  '],
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.ingredientes).toEqual(['Ingrediente 1', 'Ingrediente 2']);
    });

    it('debería manejar pasos de preparación con espacios en blanco', async () => {
      const datosReceta = {
        nombreReceta: 'Receta Test',
        ingredientes: ['Ingrediente 1'],
        pasosPreparacion: ['  Paso 1  ', '  Paso 2  '],
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.pasosPreparacion).toEqual(['Paso 1', 'Paso 2']);
    });

    it('debería manejar múltiples imágenes', async () => {
      const datosReceta = {
        nombreReceta: 'Receta con Imágenes',
        ingredientes: ['Ingrediente 1'],
        imagenes: [
          '/uploads/recipes/test/image1.jpg',
          '/uploads/recipes/test/image2.jpg',
          '/uploads/recipes/test/image3.jpg'
        ],
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.imagenes).toHaveLength(3);
      expect(resultado.imagenes).toEqual(datosReceta.imagenes);
    });
  });

  describe('Casos Edge', () => {
    it('debería manejar nombre de receta con espacios', async () => {
      const datosReceta = {
        nombreReceta: '  Ensalada César  ',
        ingredientes: ['Lechuga'],
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.nombreReceta).toBe('Ensalada César');
    });

    it('debería manejar información nutricional vacía', async () => {
      const datosReceta = {
        nombreReceta: 'Receta Test',
        ingredientes: ['Ingrediente 1'],
        informacionNutricional: '',
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.informacionNutricional).toBe('');
    });

    it('debería manejar tiempo de preparación vacío', async () => {
      const datosReceta = {
        nombreReceta: 'Receta Test',
        ingredientes: ['Ingrediente 1'],
        tiempoPreparacion: '',
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.tiempoPreparacion).toBe('');
    });
  });

  describe('actualizarRecetaService', () => {
    it('debería ser una función definida', () => {
      expect(typeof actualizarRecetaService).toBe('function');
    });
  });

  describe('eliminarRecetaService', () => {
    it('debería ser una función definida', () => {
      expect(typeof eliminarRecetaService).toBe('function');
    });
  });

  describe('limpiarImagenesHuerfanasService', () => {
    it('debería manejar directorio que no existe', async () => {
      const resultado = await limpiarImagenesHuerfanasService();

      expect(resultado).toBeDefined();
      expect(resultado).toHaveProperty('mensaje');
      expect(resultado).toHaveProperty('imagenesEncontradas');
      expect(resultado).toHaveProperty('imagenesEliminadas');
      if (resultado.imagenesHuerfanas !== undefined) {
        expect(Array.isArray(resultado.imagenesHuerfanas)).toBe(true);
      }
    });

    it('debería devolver estructura de respuesta correcta', async () => {
      const resultado = await limpiarImagenesHuerfanasService();

      expect(resultado).toBeDefined();
      expect(typeof resultado.mensaje).toBe('string');
      expect(typeof resultado.imagenesEncontradas).toBe('number');
      expect(typeof resultado.imagenesEliminadas).toBe('number');
      if (resultado.imagenesHuerfanas !== undefined) {
        expect(Array.isArray(resultado.imagenesHuerfanas)).toBe(true);
      }
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});