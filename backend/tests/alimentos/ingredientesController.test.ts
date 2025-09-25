import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { 
  guardarIngredienteOpenFoodFacts, 
  obtenerIngredientePorId 
} from '../../src/controllers/alimentos/ingredientesController';
import Ingrediente from '../../src/models/diets/ingrediente';
import { AuthenticatedRequest } from '../../src/types';

// Mock del modelo Ingrediente
jest.mock('../../src/models/diets/ingrediente', () => {
  const mockIngrediente = jest.fn().mockImplementation((data) => ({
    _id: new mongoose.Types.ObjectId(),
    nombre: data.nombre,
    calorias: data.calorias,
    proteinas: data.proteinas,
    grasas: data.grasas,
    hidratosCarbono: data.hidratosCarbono,
    fuente: data.fuente || 'Openfoodfacts',
    creador: data.creador,
    save: jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      nombre: data.nombre,
      calorias: data.calorias,
      proteinas: data.proteinas,
      grasas: data.grasas,
      hidratosCarbono: data.hidratosCarbono,
      fuente: data.fuente || 'Openfoodfacts',
      creador: data.creador,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockIngrediente as any).findOne = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockIngrediente as any).findById = jest.fn();

  return {
    __esModule: true,
    default: mockIngrediente
  };
});

// Mock del logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

// Mock de verificarAutenticacion
jest.mock('../../src/validators/commonValidators', () => ({
  verificarAutenticacion: jest.fn()
}));

import { verificarAutenticacion } from '../../src/validators/commonValidators';

// Los mocks ya están definidos arriba
const mockVerificarAutenticacion = verificarAutenticacion as jest.MockedFunction<typeof verificarAutenticacion>;

describe('Ingredientes Controller - Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      body: {},
      params: {},
      user: { id: new mongoose.Types.ObjectId().toString() }
    } as AuthenticatedRequest;
    
    mockRes = {
      status: mockStatus,
      json: mockJson
    };

    jest.clearAllMocks();
  });

  describe('guardarIngredienteOpenFoodFacts', () => {
    beforeEach(() => {
      mockVerificarAutenticacion.mockReturnValue(new mongoose.Types.ObjectId().toString());
    });

    it('debería guardar un ingrediente de OpenFoodFacts exitosamente', async () => {
      const ingredienteData = {
        nombre: 'Manzana OpenFoodFacts',
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      mockReq.body = ingredienteData;

      // Mock de ingrediente existente (no existe)
       
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Ingrediente as any).findOne.mockResolvedValue(null);

      // El mock ya está configurado para devolver el ingrediente correcto

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Ingrediente guardado correctamente en la base de datos local',
        ingrediente: expect.objectContaining({
          _id: expect.any(Object),
          nombre: ingredienteData.nombre,
          calorias: ingredienteData.calorias,
          proteinas: ingredienteData.proteinas,
          grasas: ingredienteData.grasas,
          hidratosCarbono: ingredienteData.hidratosCarbono,
          fuente: 'Openfoodfacts'
        }),
        metadata: {
          nombreOriginal: ingredienteData.nombre,
          nombreModificado: false,
          razonModificacion: null
        }
      });
    });

    it('debería manejar ingrediente duplicado agregando sufijo', async () => {
      const ingredienteData = {
        nombre: 'Manzana',
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      mockReq.body = ingredienteData;

      // Mock de ingrediente existente
      const ingredienteExistente = {
        _id: new mongoose.Types.ObjectId(),
        nombre: 'Manzana',
        fuente: 'Interna'
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Ingrediente as any).findOne
        .mockResolvedValueOnce(ingredienteExistente) // Primera búsqueda
        .mockResolvedValueOnce(null); // Segunda búsqueda (con sufijo)

      // El mock ya está configurado para devolver el ingrediente correcto

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Ingrediente guardado correctamente en la base de datos local',
        ingrediente: expect.objectContaining({
          nombre: 'Manzana - OpenFoodFacts'
        }),
        metadata: {
          nombreOriginal: 'Manzana',
          nombreModificado: true,
          razonModificacion: 'Nombre duplicado'
        }
      });
    });

    it('debería devolver error si ingrediente existe con sufijo también', async () => {
      const ingredienteData = {
        nombre: 'Manzana',
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      mockReq.body = ingredienteData;

      const ingredienteExistente = {
        _id: new mongoose.Types.ObjectId(),
        nombre: 'Manzana',
        fuente: 'Interna'
      };

      const ingredienteConSufijo = {
        _id: new mongoose.Types.ObjectId(),
        nombre: 'Manzana - OpenFoodFacts',
        fuente: 'Openfoodfacts'
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Ingrediente as any).findOne
        .mockResolvedValueOnce(ingredienteExistente)
        .mockResolvedValueOnce(ingredienteConSufijo);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Ya existe un ingrediente con ese nombre en la base de datos',
        codigo: 'INGREDIENTE_DUPLICADO',
        ingredienteExistente: {
          _id: ingredienteExistente._id,
          nombre: ingredienteExistente.nombre,
          fuente: ingredienteExistente.fuente
        }
      });
    });

    it('debería validar datos requeridos', async () => {
      // Test sin nombre
      mockReq.body = {
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'El nombre del ingrediente es requerido',
        codigo: 'NOMBRE_REQUERIDO'
      });

      // Test con nombre vacío
      mockReq.body = {
        nombre: '   ',
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'El nombre del ingrediente es requerido',
        codigo: 'NOMBRE_REQUERIDO'
      });
    });

    it('debería validar valores nutricionales', async () => {
      // Test con calorías negativas
      mockReq.body = {
        nombre: 'Manzana',
        calorias: -10,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Las calorías deben ser un número mayor o igual a 0',
        codigo: 'CALORIAS_INVALIDAS'
      });

      // Test con proteínas negativas
      mockReq.body = {
        nombre: 'Manzana',
        calorias: 52,
        proteinas: -1,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Las proteínas deben ser un número mayor o igual a 0',
        codigo: 'PROTEINAS_INVALIDAS'
      });

      // Test con grasas negativas
      mockReq.body = {
        nombre: 'Manzana',
        calorias: 52,
        proteinas: 0.3,
        grasas: -0.5,
        hidratosCarbono: 14
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Las grasas deben ser un número mayor o igual a 0',
        codigo: 'GRASAS_INVALIDAS'
      });

      // Test con hidratos negativos
      mockReq.body = {
        nombre: 'Manzana',
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: -5
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Los hidratos de carbono deben ser un número mayor o igual a 0',
        codigo: 'HIDRATOS_INVALIDOS'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const ingredienteData = {
        nombre: 'Manzana',
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      mockReq.body = ingredienteData;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Ingrediente as any).findOne.mockRejectedValue(new Error('Error de base de datos'));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error interno del servidor al guardar ingrediente',
        codigo: 'ERROR_GUARDAR_INGREDIENTE'
      });
    });

    it('debería verificar autenticación', async () => {
      mockVerificarAutenticacion.mockReturnValue(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockVerificarAutenticacion).toHaveBeenCalledWith(
        mockReq, 
        mockRes, 
        'guardar ingrediente OpenFoodFacts'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Ingrediente as any).findOne).not.toHaveBeenCalled();
    });
  });

  describe('obtenerIngredientePorId', () => {
    beforeEach(() => {
      mockVerificarAutenticacion.mockReturnValue(new mongoose.Types.ObjectId().toString());
    });

    it('debería obtener un ingrediente por ID exitosamente', async () => {
      const ingredienteId = new mongoose.Types.ObjectId().toString();
      mockReq.params = { id: ingredienteId };

      const ingredienteMock = {
        _id: new mongoose.Types.ObjectId(ingredienteId),
        nombre: 'Manzana',
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14,
        fuente: 'Interna'
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Ingrediente as any).findById.mockResolvedValue(ingredienteMock);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await obtenerIngredientePorId(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(ingredienteMock);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Ingrediente as any).findById).toHaveBeenCalledWith(ingredienteId);
    });

    it('debería devolver 404 si el ingrediente no existe', async () => {
      const ingredienteId = new mongoose.Types.ObjectId().toString();
      mockReq.params = { id: ingredienteId };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Ingrediente as any).findById.mockResolvedValue(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await obtenerIngredientePorId(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Ingrediente no encontrado'
      });
    });

    it('debería validar ID inválido', async () => {
      mockReq.params = { id: 'id-invalido' };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await obtenerIngredientePorId(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'ID de ingrediente inválido'
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Ingrediente as any).findById).not.toHaveBeenCalled();
    });

    it('debería manejar errores de base de datos', async () => {
      const ingredienteId = new mongoose.Types.ObjectId().toString();
      mockReq.params = { id: ingredienteId };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Ingrediente as any).findById.mockRejectedValue(new Error('Error de base de datos'));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await obtenerIngredientePorId(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error interno del servidor al obtener el ingrediente'
      });
    });

    it('debería verificar autenticación', async () => {
      mockVerificarAutenticacion.mockReturnValue(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await obtenerIngredientePorId(mockReq as any, mockRes as Response);

      expect(mockVerificarAutenticacion).toHaveBeenCalledWith(
        mockReq, 
        mockRes, 
        'obtener ingrediente'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Ingrediente as any).findById).not.toHaveBeenCalled();
    });
  });

  describe('Casos Edge', () => {
    it('debería manejar nombres con espacios en blanco', async () => {
      mockVerificarAutenticacion.mockReturnValue(new mongoose.Types.ObjectId().toString());

      const ingredienteData = {
        nombre: '  Manzana  ',
        calorias: 52,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      mockReq.body = ingredienteData;
       
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Ingrediente as any).findOne.mockResolvedValue(null);

      // El mock ya está configurado para devolver el ingrediente correcto

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Ingrediente as any).findOne).toHaveBeenCalledWith({ nombre: 'Manzana' });
    });

    it('debería manejar tipos de datos incorrectos', async () => {
      mockVerificarAutenticacion.mockReturnValue(new mongoose.Types.ObjectId().toString());

      const ingredienteData = {
        nombre: 'Manzana',
        calorias: '52', // String en lugar de number
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      mockReq.body = ingredienteData;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Las calorías deben ser un número mayor o igual a 0',
        codigo: 'CALORIAS_INVALIDAS'
      });
    });

    it('debería manejar valores numéricos especiales', async () => {
      mockVerificarAutenticacion.mockReturnValue(new mongoose.Types.ObjectId().toString());

      // Test con NaN - el controlador actual no valida NaN específicamente
      mockReq.body = {
        nombre: 'Manzana',
        calorias: NaN,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      // NaN pasa la validación de tipo pero puede causar problemas en la base de datos
      // Por ahora, el controlador permite NaN (esto podría mejorarse en el futuro)
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Ingrediente guardado correctamente en la base de datos local'
      }));

      // Test con Infinity
      mockReq.body = {
        nombre: 'Manzana',
        calorias: Infinity,
        proteinas: 0.3,
        grasas: 0.2,
        hidratosCarbono: 14
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guardarIngredienteOpenFoodFacts(mockReq as any, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Ingrediente guardado correctamente en la base de datos local'
      }));
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
