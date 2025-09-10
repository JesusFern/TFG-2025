
// Evitar que se ejecute el setup global
jest.mock('../../tests/setup.ts', () => ({}), { virtual: true });

// Crear mocks antes de importar el controlador
jest.mock('../../src/models/suscriptionPlans/suscriptionPlan', () => ({
  find: jest.fn(),
  findById: jest.fn()
}));

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}));

// Mocks adicionales necesarios para evitar errores con dependencias del controlador
jest.mock('../../src/models/suscriptionPlans/userSuscription', () => ({}));
jest.mock('../../src/models/payments/payment', () => ({}));
jest.mock('../../src/service/suscriptionPlan/suscriptionPlanService', () => ({
  SuscriptionPlanService: {
    createSubscriptionPayment: jest.fn(),
    confirmPayment: jest.fn(),
    checkStripePaymentStatus: jest.fn()
  }
}));

// Ahora importamos el controlador que depende de los mocks
import { SuscriptionPlanController } from '../../src/controllers/suscriptionPlans/suscriptionPlanController';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SuscriptionPlan from '../../src/models/suscriptionPlans/suscriptionPlan';
import { SuscriptionPlanService } from '../../src/service/suscriptionPlan/suscriptionPlanService';
import { AuthenticatedRequest } from '../../src/types';

describe('SuscriptionPlanController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let authReq: Partial<AuthenticatedRequest>;

  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    
    // Setup básico de request y response
    req = {
      params: {},
      query: {},
      body: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000')
    };

    // Setup para request autenticado
    authReq = {
      ...req,
      user: {
        id: 'mockUserId',
        email: 'test@example.com',
        role: 'user'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getAllPlans', () => {
    it('devuelve todos los planes correctamente', async () => {
      // Arrange
      const mockPlans = [{ nombre: 'Plan 1' }];
      (SuscriptionPlan.find as jest.Mock).mockResolvedValue(mockPlans);

      // Act
      await SuscriptionPlanController.getAllPlans(req as Request, res as Response);

      // Assert
      expect(SuscriptionPlan.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        data: mockPlans 
      });
    });

    it('maneja errores correctamente', async () => {
      // Arrange
      (SuscriptionPlan.find as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Act
      await SuscriptionPlanController.getAllPlans(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Database error' 
      });
    });
  });

  describe('getPlanById', () => {
    it('devuelve un plan por ID correctamente', async () => {
      // Arrange
      const mockPlan = { _id: 'validId', nombre: 'Plan Premium' };
      req.params = { id: 'validId' };
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (SuscriptionPlan.findById as jest.Mock).mockResolvedValue(mockPlan);

      // Act
      await SuscriptionPlanController.getPlanById(req as Request, res as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validId');
      expect(SuscriptionPlan.findById).toHaveBeenCalledWith('validId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        data: mockPlan 
      });
    });

    it('devuelve error cuando el ID no es válido', async () => {
      // Arrange
      req.params = { id: 'invalidId' };
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      // Act
      await SuscriptionPlanController.getPlanById(req as Request, res as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalidId');
      expect(SuscriptionPlan.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'ID de plan no válido' 
      });
    });

    it('devuelve 404 cuando el plan no existe', async () => {
      // Arrange
      req.params = { id: 'validButNonExistentId' };
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (SuscriptionPlan.findById as jest.Mock).mockResolvedValue(null);

      // Act
      await SuscriptionPlanController.getPlanById(req as Request, res as Response);

      // Assert
      expect(SuscriptionPlan.findById).toHaveBeenCalledWith('validButNonExistentId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Plan no encontrado' 
      });
    });

    it('maneja errores de base de datos', async () => {
      // Arrange
      req.params = { id: 'validId' };
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (SuscriptionPlan.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act
      await SuscriptionPlanController.getPlanById(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Database error' 
      });
    });
  });

  describe('getPlansByPriceType', () => {
    it('devuelve planes filtrados por tipo de precio', async () => {
      // Arrange
      const mockPlans = [
        { nombre: 'Plan Premium', tipoPrecio: 'Premium' },
        { nombre: 'Plan Premium Plus', tipoPrecio: 'Premium' }
      ];
      req.params = { tipoPrecio: 'Premium' };
      (SuscriptionPlan.find as jest.Mock).mockResolvedValue(mockPlans);

      // Act
      await SuscriptionPlanController.getPlansByPriceType(req as Request, res as Response);

      // Assert
      expect(SuscriptionPlan.find).toHaveBeenCalledWith({ tipoPrecio: 'Premium' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        data: mockPlans 
      });
    });

    it('devuelve error para tipos de precio inválidos', async () => {
      // Arrange
      req.params = { tipoPrecio: 'super-premium' };
      
      // Act
      await SuscriptionPlanController.getPlansByPriceType(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Tipo de precio no válido. Debe ser Gratuito, Básico o Premium' 
      });
    });

    it('maneja errores de base de datos', async () => {
      // Arrange
      req.params = { tipoPrecio: 'Premium' };
      (SuscriptionPlan.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act
      await SuscriptionPlanController.getPlansByPriceType(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Database error' 
      });
    });
  });

  describe('subscribeToPlan', () => {
    // Mock para pruebas de suscripción
    const mockPlan = { 
      _id: 'planId', 
      nombre: 'Plan Premium', 
      precio: 29.99,
      tipoPrecio: 'Premium'
    };

    beforeEach(() => {
      // Setup para tests de subscribeToPlan
      authReq.body = { 
        planId: 'planId',
        frecuenciaPago: 'mensual'
      };
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (SuscriptionPlan.findById as jest.Mock).mockResolvedValue(mockPlan);
    });

    it('crea un pago de suscripción correctamente', async () => {
      // Arrange
      const mockResult = {
        success: true,
        sessionId: 'mock-session-id',
        checkoutUrl: undefined
      };
      
      (SuscriptionPlanService.createSubscriptionPayment as jest.Mock).mockResolvedValue(mockResult);

      // Act
      await SuscriptionPlanController.subscribeToPlan(authReq as AuthenticatedRequest, res as Response);

      // Assert
      expect(SuscriptionPlanService.createSubscriptionPayment).toHaveBeenCalledWith(
        authReq.user?.id,
        'planId',
        'mensual',
        expect.any(String),  // URL de éxito
        expect.any(String)   // URL de cancelación
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        sessionId: 'mock-session-id',
        checkoutUrl: undefined
      });
    });

    it('maneja correctamente cuando el usuario no está autenticado', async () => {
      // Arrange
      const nonAuthReq = { 
        ...req, 
        body: { 
          planId: 'planId',
          frecuenciaPago: 'mensual'
        }
      };
      
      // Act
      await SuscriptionPlanController.subscribeToPlan(nonAuthReq as AuthenticatedRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
      expect(SuscriptionPlanService.createSubscriptionPayment).not.toHaveBeenCalled();
    });

    it('devuelve error cuando faltan datos', async () => {
      // Arrange
      authReq.body = {};
      
      // Act
      await SuscriptionPlanController.subscribeToPlan(authReq as AuthenticatedRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Datos incompletos. Se requiere planId y frecuenciaPago' 
      });
      expect(SuscriptionPlanService.createSubscriptionPayment).not.toHaveBeenCalled();
    });

    it('maneja errores del servicio de pago', async () => {
      // Arrange
      const error = new Error('Error de pago');
      (SuscriptionPlanService.createSubscriptionPayment as jest.Mock).mockRejectedValue(error);
      
      // Act
      await SuscriptionPlanController.subscribeToPlan(authReq as AuthenticatedRequest, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);  // Según la implementación actual, devuelve 400
      expect(res.json).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Error de pago' 
      });
    });
  });
});

describe('SuscriptionPlanController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let authReq: Partial<AuthenticatedRequest>;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000')
    };
    
    authReq = {
      ...req,
      user: {
        id: 'mockUserId',
        role: 'user',
        email: 'user@example.com'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  describe('getAllPlans', () => {
    it('getAllPlans - éxito', async () => {
      const mockPlans = [{ nombre: 'Plan 1' }];
      (SuscriptionPlan.find as jest.Mock).mockResolvedValue(mockPlans);

      await SuscriptionPlanController.getAllPlans(req as Request, res as Response);

      expect(SuscriptionPlan.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockPlans });
    });

    it('getAllPlans - error', async () => {
      (SuscriptionPlan.find as jest.Mock).mockRejectedValue(new Error('fail'));
      await SuscriptionPlanController.getAllPlans(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'fail' });
    });
  });
  
  describe('getPlansByPriceType', () => {
    it('devuelve planes filtrados por tipo de precio', async () => {
      // Configurar request params
      req.params = { tipoPrecio: 'Básico' };
      
      // Mock de los datos
      const mockPlans = [
        { _id: 'plan1', nombre: 'Plan Básico 1', tipoPrecio: 'Básico' },
        { _id: 'plan2', nombre: 'Plan Básico 2', tipoPrecio: 'Básico' }
      ];
      
      // Configurar el mock para devolver planes
      (SuscriptionPlan.find as jest.Mock).mockResolvedValue(mockPlans);

      // Ejecutar el método
      await SuscriptionPlanController.getPlansByPriceType(req as Request, res as Response);

      // Verificar que se llamó correctamente al modelo
      expect(SuscriptionPlan.find).toHaveBeenCalledWith({ tipoPrecio: 'Básico' });
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPlans
      });
    });

    it('devuelve error cuando el tipo de precio es inválido', async () => {
      // Configurar request params
      req.params = { tipoPrecio: 'TipoInvalido' };
      
      // Ejecutar el método
      await SuscriptionPlanController.getPlansByPriceType(req as Request, res as Response);

      // Verificar que no se llama al modelo
      expect(SuscriptionPlan.find).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tipo de precio no válido. Debe ser Gratuito, Básico o Premium'
      });
    });
    
    it('maneja errores de base de datos', async () => {
      // Configurar request params
      req.params = { tipoPrecio: 'Básico' };
      
      // Simular error de base de datos
      const error = new Error('Error de conexión');
      (SuscriptionPlan.find as jest.Mock).mockRejectedValue(error);

      // Ejecutar el método
      await SuscriptionPlanController.getPlansByPriceType(req as Request, res as Response);
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de conexión'
      });
    });
  });
  
  describe('getPlanById', () => {
    it('devuelve un plan específico por ID', async () => {
      // Mock para validación de ObjectId
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      
      // Configurar request params
      req.params = { id: 'validPlanId' };
      
      // Mock de los datos
      const mockPlan = { 
        _id: 'validPlanId', 
        nombre: 'Plan Premium', 
        descripcion: 'Descripción del plan',
        tipoPrecio: 'Premium'
      };
      
      // Configurar el mock para devolver un plan
      (SuscriptionPlan.findById as jest.Mock).mockResolvedValue(mockPlan);

      // Ejecutar el método
      await SuscriptionPlanController.getPlanById(req as Request, res as Response);

      // Verificar que se validó correctamente el ID
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validPlanId');
      
      // Verificar que se llamó correctamente al modelo
      expect(SuscriptionPlan.findById).toHaveBeenCalledWith('validPlanId');
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPlan
      });
    });

    it('devuelve error cuando el ID no es válido', async () => {
      // Mock para validación de ObjectId
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);
      
      // Configurar request params
      req.params = { id: 'invalidPlanId' };
      
      // Ejecutar el método
      await SuscriptionPlanController.getPlanById(req as Request, res as Response);

      // Verificar que se validó correctamente el ID
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalidPlanId');
      
      // Verificar que no se llamó al modelo
      expect(SuscriptionPlan.findById).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'ID de plan no válido'
      });
    });
    
    it('devuelve 404 cuando el plan no existe', async () => {
      // Mock para validación de ObjectId
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      
      // Configurar request params
      req.params = { id: 'nonExistentPlanId' };
      
      // Configurar el mock para devolver null (plan no encontrado)
      (SuscriptionPlan.findById as jest.Mock).mockResolvedValue(null);

      // Ejecutar el método
      await SuscriptionPlanController.getPlanById(req as Request, res as Response);
      
      // Verificar que se llamó correctamente al modelo
      expect(SuscriptionPlan.findById).toHaveBeenCalledWith('nonExistentPlanId');
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Plan no encontrado'
      });
    });
    
    it('maneja errores de base de datos', async () => {
      // Mock para validación de ObjectId
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      
      // Configurar request params
      req.params = { id: 'validPlanId' };
      
      // Simular error de base de datos
      const error = new Error('Error de conexión');
      (SuscriptionPlan.findById as jest.Mock).mockRejectedValue(error);

      // Ejecutar el método
      await SuscriptionPlanController.getPlanById(req as Request, res as Response);
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de conexión'
      });
    });
  });
  
  describe('subscribeToPlan', () => {
    it('crea una suscripción de pago y devuelve URL de checkout', async () => {
      // Configurar request body
      authReq.body = {
        planId: 'validPlanId',
        frecuenciaPago: 'mensual'
      };
      
      // Mock del resultado del servicio
      const mockResult = {
        sessionId: 'mock-session-id',
        url: 'https://checkout.stripe.com/pay/mock-session'
      };
      
      // Configurar el mock del servicio
      jest.spyOn(SuscriptionPlanService, 'createSubscriptionPayment').mockResolvedValue(mockResult);
      
      // Ejecutar el método
      await SuscriptionPlanController.subscribeToPlan(authReq as AuthenticatedRequest, res as Response);
      
      // Verificar que se llamó al servicio con los parámetros correctos
      expect(SuscriptionPlanService.createSubscriptionPayment).toHaveBeenCalledWith(
        'mockUserId',
        'validPlanId',
        'mensual',
        expect.stringContaining('sessionId={CHECKOUT_SESSION_ID}'),
        expect.any(String)
      );
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        sessionId: 'mock-session-id',
        checkoutUrl: 'https://checkout.stripe.com/pay/mock-session'
      });
    });
    
    it('crea una suscripción gratuita', async () => {
      // Configurar request body
      authReq.body = {
        planId: 'freePlanId',
        frecuenciaPago: 'mensual'
      };
      
      // Mock del resultado del servicio para plan gratuito
      const mockResult = {
        freeSubscription: true,
        redirect: '/dashboard',
        success: true
      };
      
      // Configurar el mock del servicio
      jest.spyOn(SuscriptionPlanService, 'createSubscriptionPayment').mockResolvedValue(mockResult);
      
      // Ejecutar el método
      await SuscriptionPlanController.subscribeToPlan(authReq as AuthenticatedRequest, res as Response);
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Suscripción gratuita activada correctamente',
        redirect: '/dashboard'
      });
    });
    
    it('devuelve error 401 cuando el usuario no está autenticado', async () => {
      // Request sin usuario autenticado
      const nonAuthReq = { ...req, body: { planId: 'validPlanId', frecuenciaPago: 'mensual' } };
      
      // Ejecutar el método
      await SuscriptionPlanController.subscribeToPlan(nonAuthReq as AuthenticatedRequest, res as Response);
      
      // Verificar que no se llama al servicio
      expect(SuscriptionPlanService.createSubscriptionPayment).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });
    
    it('devuelve error 400 cuando faltan datos en la solicitud', async () => {
      // Configurar request con datos incompletos
      authReq.body = { planId: 'validPlanId' }; // Sin frecuenciaPago
      
      // Ejecutar el método
      await SuscriptionPlanController.subscribeToPlan(authReq as AuthenticatedRequest, res as Response);
      
      // Verificar que no se llama al servicio
      expect(SuscriptionPlanService.createSubscriptionPayment).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos incompletos. Se requiere planId y frecuenciaPago'
      });
    });
    
    it('devuelve error 400 cuando la frecuencia de pago es inválida', async () => {
      // Configurar request con frecuencia inválida
      authReq.body = { 
        planId: 'validPlanId',
        frecuenciaPago: 'bianual' // Frecuencia inválida
      };
      
      // Ejecutar el método
      await SuscriptionPlanController.subscribeToPlan(authReq as AuthenticatedRequest, res as Response);
      
      // Verificar que no se llama al servicio
      expect(SuscriptionPlanService.createSubscriptionPayment).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Frecuencia de pago no válida. Debe ser mensual, trimestral o anual'
      });
    });
    
    it('maneja errores del servicio', async () => {
      // Configurar request body
      authReq.body = {
        planId: 'validPlanId',
        frecuenciaPago: 'mensual'
      };
      
      // Simular error en el servicio
      const error = new Error('Error al crear la suscripción');
      jest.spyOn(SuscriptionPlanService, 'createSubscriptionPayment').mockRejectedValue(error);
      
      // Ejecutar el método
      await SuscriptionPlanController.subscribeToPlan(authReq as AuthenticatedRequest, res as Response);
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al crear la suscripción'
      });
    });
  });
});