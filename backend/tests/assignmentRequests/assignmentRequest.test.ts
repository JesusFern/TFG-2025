import { Types } from 'mongoose';
import {
  createAssignmentRequest,
  getAssignmentRequestsByUser,
  getAssignmentRequestsByWorker,
  getPendingAssignmentRequestsByWorker,
  updateAssignmentRequestStatus,
  cancelAssignmentRequest,
  validateSubscriptionCompatibility
} from '../../src/service/assignmentRequests/assignmentRequestService';

// Mock de los modelos
jest.mock('../../src/models/users/assignmentRequest');
jest.mock('../../src/models/users/user');
jest.mock('../../src/models/suscriptionPlans/userSuscription');
jest.mock('../../src/models/suscriptionPlans/suscriptionPlan');

import AssignmentRequest from '../../src/models/users/assignmentRequest';
import User from '../../src/models/users/user';
import UserSuscription from '../../src/models/suscriptionPlans/userSuscription';

// Test data setup
const USER_ID = new Types.ObjectId();
const WORKER_ID = new Types.ObjectId();
const PLAN_ID = new Types.ObjectId();
const ASSIGNMENT_REQUEST_ID = new Types.ObjectId();

describe('AssignmentRequest Service Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAssignmentRequest', () => {
    it('should create a new assignment request successfully', async () => {
      // Arrange
      const mockWorker = {
        _id: WORKER_ID,
        role: 'worker',
        isWorkerAvailable: true
      };

      const mockAssignmentRequest = {
        _id: ASSIGNMENT_REQUEST_ID,
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        estado: 'pendiente',
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findById as jest.Mock).mockResolvedValue(mockWorker);
      (AssignmentRequest.findOne as jest.Mock).mockResolvedValue(null);
      (AssignmentRequest.prototype.save as jest.Mock) = jest.fn().mockResolvedValue(mockAssignmentRequest);

      // Act
      const result = await createAssignmentRequest(USER_ID, WORKER_ID);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(WORKER_ID);
      expect(AssignmentRequest.findOne).toHaveBeenCalledWith({
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        estado: 'pendiente'
      });
      expect(result).toBeDefined();
    });

    it('should throw error when worker does not exist', async () => {
      // Arrange
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(createAssignmentRequest(USER_ID, WORKER_ID))
        .rejects.toThrow('Trabajador no encontrado');
    });

    it('should throw error when worker is not available', async () => {
      // Arrange
      const mockWorker = {
        _id: WORKER_ID,
        role: 'worker',
        isWorkerAvailable: false
      };
      (User.findById as jest.Mock).mockResolvedValue(mockWorker);

      // Act & Assert
      await expect(createAssignmentRequest(USER_ID, WORKER_ID))
        .rejects.toThrow('El trabajador no está disponible para nuevas asignaciones');
    });

    it('should throw error when duplicate request exists', async () => {
      // Arrange
      const mockWorker = {
        _id: WORKER_ID,
        role: 'worker',
        isWorkerAvailable: true
      };

      const mockExistingRequest = {
        _id: ASSIGNMENT_REQUEST_ID,
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        estado: 'pendiente'
      };

      (User.findById as jest.Mock).mockResolvedValue(mockWorker);
      (AssignmentRequest.findOne as jest.Mock).mockResolvedValue(mockExistingRequest);

      // Act & Assert
      await expect(createAssignmentRequest(USER_ID, WORKER_ID))
        .rejects.toThrow('Ya tienes una solicitud pendiente para este trabajador');
    });
  });

  describe('getAssignmentRequestsByUser', () => {
    it('should return assignment requests for a user', async () => {
      // Arrange
      const mockRequests = [
        {
          _id: ASSIGNMENT_REQUEST_ID,
          usuarioSolicitante: USER_ID,
          trabajadorSolicitado: WORKER_ID,
          estado: 'pendiente'
        }
      ];

      (AssignmentRequest.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockRequests)
        })
      });

      // Act
      const result = await getAssignmentRequestsByUser(USER_ID);

      // Assert
      expect(AssignmentRequest.find).toHaveBeenCalledWith({
        usuarioSolicitante: USER_ID
      });
      expect(result).toEqual(mockRequests);
    });

    it('should return empty array when no requests exist', async () => {
      // Arrange
      (AssignmentRequest.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        })
      });

      // Act
      const result = await getAssignmentRequestsByUser(USER_ID);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('getAssignmentRequestsByWorker', () => {
    it('should return assignment requests for a worker', async () => {
      // Arrange
      const mockRequests = [
        {
          _id: ASSIGNMENT_REQUEST_ID,
          usuarioSolicitante: USER_ID,
          trabajadorSolicitado: WORKER_ID,
          estado: 'pendiente'
        }
      ];

      (AssignmentRequest.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockRequests)
        })
      });

      // Act
      const result = await getAssignmentRequestsByWorker(WORKER_ID);

      // Assert
      expect(AssignmentRequest.find).toHaveBeenCalledWith({
        trabajadorSolicitado: WORKER_ID
      });
      expect(result).toEqual(mockRequests);
    });
  });

  describe('getPendingAssignmentRequestsByWorker', () => {
    it('should return only pending requests for a worker', async () => {
      // Arrange
      const mockRequests = [
        {
          _id: ASSIGNMENT_REQUEST_ID,
          usuarioSolicitante: USER_ID,
          trabajadorSolicitado: WORKER_ID,
          estado: 'pendiente'
        }
      ];

      (AssignmentRequest.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockRequests)
        })
      });

      // Act
      const result = await getPendingAssignmentRequestsByWorker(WORKER_ID);

      // Assert
      expect(AssignmentRequest.find).toHaveBeenCalledWith({
        trabajadorSolicitado: WORKER_ID,
        estado: 'pendiente'
      });
      expect(result).toEqual(mockRequests);
    });
  });

  describe('updateAssignmentRequestStatus', () => {
    it('should accept an assignment request successfully', async () => {
      // Arrange
      const mockRequest = {
        _id: ASSIGNMENT_REQUEST_ID,
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        estado: 'pendiente',
        save: jest.fn().mockResolvedValue(true)
      };

      const mockWorker = {
        _id: WORKER_ID,
        clientesAsignados: [],
        save: jest.fn().mockResolvedValue(true)
      };

      (AssignmentRequest.findById as jest.Mock).mockResolvedValue(mockRequest);
      (User.findById as jest.Mock).mockResolvedValue(mockWorker);

      // Act
      await updateAssignmentRequestStatus(ASSIGNMENT_REQUEST_ID, WORKER_ID, 'aceptada');

      // Assert
      expect(AssignmentRequest.findById).toHaveBeenCalledWith(ASSIGNMENT_REQUEST_ID);
      expect(mockRequest.estado).toBe('aceptada');
      expect(mockRequest.save).toHaveBeenCalled();
    });

    it('should reject an assignment request successfully', async () => {
      // Arrange
      const mockRequest = {
        _id: ASSIGNMENT_REQUEST_ID,
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        estado: 'pendiente',
        save: jest.fn().mockResolvedValue(true)
      };

      (AssignmentRequest.findById as jest.Mock).mockResolvedValue(mockRequest);

      // Act
      await updateAssignmentRequestStatus(ASSIGNMENT_REQUEST_ID, WORKER_ID, 'rechazada');

      // Assert
      expect(mockRequest.estado).toBe('rechazada');
      expect(mockRequest.save).toHaveBeenCalled();
    });

    it('should throw error when request does not exist', async () => {
      // Arrange
      (AssignmentRequest.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(updateAssignmentRequestStatus(ASSIGNMENT_REQUEST_ID, WORKER_ID, 'aceptada'))
        .rejects.toThrow('Solicitud de asignación no encontrada');
    });

    it('should throw error when request is not pending', async () => {
      // Arrange
      const mockRequest = {
        _id: ASSIGNMENT_REQUEST_ID,
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        estado: 'aceptada'
      };

      (AssignmentRequest.findById as jest.Mock).mockResolvedValue(mockRequest);

      // Act & Assert
      await expect(updateAssignmentRequestStatus(ASSIGNMENT_REQUEST_ID, WORKER_ID, 'aceptada'))
        .rejects.toThrow('Esta solicitud ya ha sido procesada');
    });
  });

  describe('cancelAssignmentRequest', () => {
    it('should cancel an assignment request successfully', async () => {
      // Arrange
      const mockRequest = {
        _id: ASSIGNMENT_REQUEST_ID,
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        estado: 'pendiente'
      };

      (AssignmentRequest.findById as jest.Mock).mockResolvedValue(mockRequest);
      (AssignmentRequest.findByIdAndDelete as jest.Mock).mockResolvedValue(mockRequest);

      // Act
      const result = await cancelAssignmentRequest(ASSIGNMENT_REQUEST_ID, USER_ID);

      // Assert
      expect(AssignmentRequest.findById).toHaveBeenCalledWith(ASSIGNMENT_REQUEST_ID);
      expect(AssignmentRequest.findByIdAndDelete).toHaveBeenCalledWith(ASSIGNMENT_REQUEST_ID);
      expect(result).toBe(true);
    });

    it('should throw error when request does not exist', async () => {
      // Arrange
      (AssignmentRequest.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(cancelAssignmentRequest(ASSIGNMENT_REQUEST_ID, USER_ID))
        .rejects.toThrow('Solicitud de asignación no encontrada');
    });

    it('should throw error when request is not pending', async () => {
      // Arrange
      const mockRequest = {
        _id: ASSIGNMENT_REQUEST_ID,
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        estado: 'aceptada'
      };

      (AssignmentRequest.findById as jest.Mock).mockResolvedValue(mockRequest);

      // Act & Assert
      await expect(cancelAssignmentRequest(ASSIGNMENT_REQUEST_ID, USER_ID))
        .rejects.toThrow('Solo se pueden cancelar solicitudes pendientes');
    });
  });

  describe('validateSubscriptionCompatibility', () => {
    it('should validate compatibility between user plan and worker type', async () => {
      // Arrange
      const mockPlan = {
        _id: PLAN_ID,
        tipoPlan: 'Nutricion',
        tipoPrecio: 'Básico'
      };

      const mockSubscription = {
        userId: USER_ID,
        planId: mockPlan,
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const mockWorker = {
        _id: WORKER_ID,
        role: 'worker',
        workerType: 'Nutricionista'
      };

      // Mock the chain of calls
      const mockPopulate = jest.fn().mockResolvedValue(mockSubscription);
      (UserSuscription.findOne as jest.Mock).mockReturnValue({
        populate: mockPopulate
      });
      (User.findById as jest.Mock).mockResolvedValue(mockWorker);

      // Act
      const result = await validateSubscriptionCompatibility(USER_ID, WORKER_ID);

      // Assert
      expect(UserSuscription.findOne).toHaveBeenCalledWith({ userId: USER_ID });
      expect(User.findById).toHaveBeenCalledWith(WORKER_ID);
      expect(result).toBe(true);
    });

    it('should throw error when user has no subscription', async () => {
      // Arrange
      const mockPopulate = jest.fn().mockResolvedValue(null);
      (UserSuscription.findOne as jest.Mock).mockReturnValue({
        populate: mockPopulate
      });

      // Act & Assert
      await expect(validateSubscriptionCompatibility(USER_ID, WORKER_ID))
        .rejects.toThrow('No tienes una suscripción activa');
    });

    it('should throw error when plan is incompatible', async () => {
      // Arrange
      const mockPlan = {
        _id: PLAN_ID,
        tipoPlan: 'Nutricion',
        tipoPrecio: 'Básico'
      };

      const mockSubscription = {
        userId: USER_ID,
        planId: mockPlan,
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const mockWorker = {
        _id: WORKER_ID,
        role: 'worker',
        workerType: 'Entrenador personal'
      };

      const mockPopulate = jest.fn().mockResolvedValue(mockSubscription);
      (UserSuscription.findOne as jest.Mock).mockReturnValue({
        populate: mockPopulate
      });
      (User.findById as jest.Mock).mockResolvedValue(mockWorker);

      // Act & Assert
      await expect(validateSubscriptionCompatibility(USER_ID, WORKER_ID))
        .rejects.toThrow('Tu plan de suscripción "Nutricion" no es compatible con trabajadores de tipo "Entrenador personal"');
    });
  });
});