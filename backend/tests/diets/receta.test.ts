import mongoose from 'mongoose';
import { crearRecetaService, obtenerRecetaService, obtenerRecetasPublicasService, actualizarRecetaService, eliminarRecetaService } from '../../src/service/diets/recetaService';
import Receta from '../../src/models/diets/receta';

// Mock del modelo Receta
jest.mock('../../src/models/diets/receta', () => {
  const mockSave = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByIdAndUpdate = jest.fn();
  const mockFindByIdAndDelete = jest.fn();
  // mockFind no se usa directamente
  const mockFindOne = jest.fn();
  
  // Configurar el mock de find para que tenga populate y sort
  const mockFindWithPopulate = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    })
  });

  // El mock del save se configurará dinámicamente en cada test

  const mockReceta = jest.fn().mockImplementation((data) => ({
        _id: new mongoose.Types.ObjectId(),
        nombreReceta: data.nombreReceta,
        ingredientes: data.ingredientes,
        pasosPreparacion: data.pasosPreparacion || [],
        tiempoPreparacion: data.tiempoPreparacion || '',
        imagenes: data.imagenes || [],
        publica: data.publica,
        creador: data.creador,
    save: mockSave
  }));

  // Asignar métodos estáticos - usando any para evitar conflictos con tipos de Mongoose
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockReceta as any).findById = mockFindById;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockReceta as any).findByIdAndUpdate = mockFindByIdAndUpdate;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockReceta as any).findByIdAndDelete = mockFindByIdAndDelete;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockReceta as any).find = mockFindWithPopulate;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockReceta as any).findOne = mockFindOne;

  return {
    __esModule: true,
    default: mockReceta
  };
});

// Mock del modelo Ingrediente
jest.mock('../../src/models/diets/ingrediente', () => ({
  __esModule: true,
  default: {
    findById: jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      nombre: 'Test Ingrediente',
      calorias: 100,
      proteinas: 10,
      grasas: 5,
      hidratosCarbono: 15
    }),
    findOne: jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      nombre: 'Test Ingrediente',
      calorias: 100,
      proteinas: 10,
      grasas: 5,
      hidratosCarbono: 15
    })
  }
}));

describe('Receta Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearRecetaService', () => {
    it('debería crear una receta exitosamente', async () => {
      const datosReceta = {
        nombreReceta: 'Ensalada César',
        ingredientes: [
          {
            nombre: 'Lechuga',
            peso: 100,
            informacionNutricional: {
              calorias: 15,
              proteinas: 1.4,
              carbohidratos: 3,
              grasas: 0.2
            }
          }
        ],
        pasosPreparacion: ['Cortar la lechuga'],
        tiempoPreparacion: '15 minutos',
        imagenes: ['/uploads/recipes/test/image.jpg'],
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      // Configurar el mock del save para devolver los datos correctos
      const mockSave = jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        nombreReceta: datosReceta.nombreReceta,
        ingredientes: datosReceta.ingredientes,
        pasosPreparacion: datosReceta.pasosPreparacion,
        tiempoPreparacion: datosReceta.tiempoPreparacion,
        imagenes: datosReceta.imagenes,
        publica: datosReceta.publica,
        creador: datosReceta.creadorId
      });

      // Reemplazar el mock del save - usando any para evitar conflictos con tipos de Mongoose
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Receta as any).mockImplementation((data: Record<string, unknown>) => ({
        _id: new mongoose.Types.ObjectId(),
        nombreReceta: data.nombreReceta,
        ingredientes: data.ingredientes,
        pasosPreparacion: data.pasosPreparacion || [],
        tiempoPreparacion: data.tiempoPreparacion || '',
        imagenes: data.imagenes || [],
        publica: data.publica,
        creador: data.creador,
        save: mockSave
      }));

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.nombreReceta).toBe('Ensalada César');
      expect(resultado.publica).toBe(true);
    });

    it('debería convertir publica de string a boolean', async () => {
      const datosReceta = {
        nombreReceta: 'Ensalada Simple',
        ingredientes: [
          {
            nombre: 'Lechuga',
            peso: 100,
            informacionNutricional: {
              calorias: 15,
              proteinas: 1.4,
              carbohidratos: 3,
              grasas: 0.2
            }
          }
        ],
        publica: 'false',
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.publica).toBe(false);
    });

    it('debería manejar ingredientes vacíos', async () => {
      const datosReceta = {
        nombreReceta: 'Receta Vacía',
        ingredientes: [],
        publica: true,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const resultado = await crearRecetaService(datosReceta);

      expect(resultado).toBeDefined();
      expect(resultado.ingredientes).toEqual([]);
    });
  });

  describe('obtenerRecetaService', () => {
    it('debería obtener una receta por ID', async () => {
      const recetaId = new mongoose.Types.ObjectId().toString();
      const recetaMock = {
        _id: recetaId,
        nombreReceta: 'Test Recipe',
        ingredientes: [
          {
            ingrediente: new mongoose.Types.ObjectId(),
            peso: 100
          }
        ],
        pasosPreparacion: ['Paso 1'],
        tiempoPreparacion: '15 minutos',
        imagenes: [],
        publica: true,
        creador: new mongoose.Types.ObjectId()
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Receta as any).findById.mockResolvedValue(recetaMock);

      const resultado = await obtenerRecetaService(recetaId);

      expect(resultado).toBeDefined();
      expect(resultado.nombreReceta).toBe('Test Recipe');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Receta as any).findById).toHaveBeenCalledWith(recetaId);
    });

    it('debería lanzar error si la receta no existe', async () => {
      const recetaId = new mongoose.Types.ObjectId().toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Receta as any).findById.mockResolvedValue(null);

      await expect(obtenerRecetaService(recetaId)).rejects.toThrow('Receta no encontrada');
    });
  });

  describe('obtenerRecetasPublicasService', () => {
    it('debería obtener recetas públicas', async () => {
      const recetasMock = [
          {
            _id: new mongoose.Types.ObjectId(),
          nombreReceta: 'Receta 1',
          ingredientes: [],
          pasosPreparacion: [],
          tiempoPreparacion: '15 minutos',
          imagenes: [],
              publica: true,
              creador: new mongoose.Types.ObjectId()
            },
            {
              _id: new mongoose.Types.ObjectId(),
          nombreReceta: 'Receta 2',
          ingredientes: [],
          pasosPreparacion: [],
          tiempoPreparacion: '20 minutos',
          imagenes: [],
              publica: true,
              creador: new mongoose.Types.ObjectId()
        }
      ];

      // Configurar el mock para que funcione con populate y sort
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(recetasMock)
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Receta as any).find.mockReturnValue(mockQuery);

      const resultado = await obtenerRecetasPublicasService();

      expect(resultado).toBeDefined();
      expect(resultado.length).toBe(2);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Receta as any).find).toHaveBeenCalledWith({ publica: true });
      expect(mockQuery.populate).toHaveBeenCalledWith('ingredientes.ingrediente');
      expect(mockQuery.sort).toHaveBeenCalledWith({ nombreReceta: 1 });
    });
  });

  describe('actualizarRecetaService', () => {
    it('debería actualizar una receta existente', async () => {
      const recetaId = new mongoose.Types.ObjectId().toString();
      const datosActualizacion = {
        nombreReceta: 'Receta Actualizada',
        ingredientes: [
          {
            nombre: 'Ingrediente Actualizado',
            peso: 200,
            informacionNutricional: {
              calorias: 200,
              proteinas: 20,
              carbohidratos: 30,
              grasas: 10
            }
          }
        ],
        publica: false,
        creadorId: new mongoose.Types.ObjectId().toString()
      };

      const recetaActualizada = {
        _id: recetaId,
        ...datosActualizacion
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Receta as any).findByIdAndUpdate.mockResolvedValue(recetaActualizada);

      const resultado = await actualizarRecetaService(recetaId, datosActualizacion);

      expect(resultado).toBeDefined();
      expect(resultado.nombreReceta).toBe('Receta Actualizada');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Receta as any).findByIdAndUpdate).toHaveBeenCalledWith(recetaId, expect.any(Object), { new: true, runValidators: true });
    });
  });

  describe('eliminarRecetaService', () => {
    it('debería eliminar una receta', async () => {
      const recetaId = new mongoose.Types.ObjectId().toString();
      const recetaEliminada = {
        _id: recetaId,
        nombreReceta: 'Receta Eliminada'
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Receta as any).findByIdAndDelete.mockResolvedValue(recetaEliminada);

      const resultado = await eliminarRecetaService(recetaId);

      expect(resultado).toBeDefined();
      expect(resultado.nombreReceta).toBe('Receta Eliminada');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Receta as any).findByIdAndDelete).toHaveBeenCalledWith(recetaId);
    });

    it('debería lanzar error si la receta a eliminar no existe', async () => {
      const recetaId = new mongoose.Types.ObjectId().toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Receta as any).findByIdAndDelete.mockResolvedValue(null);

      await expect(eliminarRecetaService(recetaId)).rejects.toThrow('Receta no encontrada');
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});