import { Types } from 'mongoose';
import {
  createAssignmentRequest,
  updateAssignmentRequestStatus,
  cancelAssignmentRequest
} from '../../src/service/assignmentRequests/assignmentRequestService';

// Mock de los modelos
jest.mock('../../src/models/assignmentRequest/assignmentRequest');
jest.mock('../../src/models/users/user');
jest.mock('../../src/models/suscriptionPlans/userSuscription');
jest.mock('../../src/models/suscriptionPlans/suscriptionPlan');

import AssignmentRequest from '../../src/models/assignmentRequest/assignmentRequest';
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
        tipoAsignacion: 'Nutricionista',
        estado: 'pendiente',
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findById as jest.Mock).mockResolvedValue(mockWorker);
      (AssignmentRequest.findOne as jest.Mock).mockResolvedValue(null);
      (AssignmentRequest.prototype.save as jest.Mock) = jest.fn().mockResolvedValue(mockAssignmentRequest);

      // Act
      const result = await createAssignmentRequest(USER_ID, WORKER_ID, 'Nutricionista');

      // Assert
      expect(User.findById).toHaveBeenCalledWith(WORKER_ID);
      expect(AssignmentRequest.findOne).toHaveBeenCalledWith({
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        tipoAsignacion: 'Nutricionista',
        estado: 'pendiente'
      });
      expect(result).toBeDefined();
    });

    it('should throw error when worker does not exist', async () => {
      // Arrange
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(createAssignmentRequest(USER_ID, WORKER_ID, 'Nutricionista'))
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
      await expect(createAssignmentRequest(USER_ID, WORKER_ID, 'Nutricionista'))
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
        tipoAsignacion: 'Nutricionista',
        estado: 'pendiente'
      };

      (User.findById as jest.Mock).mockResolvedValue(mockWorker);
      (AssignmentRequest.findOne as jest.Mock).mockResolvedValue(mockExistingRequest);

      // Act & Assert
      await expect(createAssignmentRequest(USER_ID, WORKER_ID, 'Nutricionista'))
        .rejects.toThrow('Ya tienes una solicitud pendiente para este trabajador');
    });
  });


  describe('updateAssignmentRequestStatus', () => {
    it('should accept an assignment request successfully', async () => {
      // Arrange
      const mockRequest = {
        _id: ASSIGNMENT_REQUEST_ID,
        usuarioSolicitante: USER_ID,
        trabajadorSolicitado: WORKER_ID,
        tipoAsignacion: 'Nutricionista',
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
        tipoAsignacion: 'Nutricionista',
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
        tipoAsignacion: 'Nutricionista',
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
        tipoAsignacion: 'Nutricionista',
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
        tipoAsignacion: 'Nutricionista',
        estado: 'aceptada'
      };

      (AssignmentRequest.findById as jest.Mock).mockResolvedValue(mockRequest);

      // Act & Assert
      await expect(cancelAssignmentRequest(ASSIGNMENT_REQUEST_ID, USER_ID))
        .rejects.toThrow('Solo se pueden cancelar solicitudes pendientes');
    });
  });

});