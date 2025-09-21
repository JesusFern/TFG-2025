import { Request, Response } from 'express';
import { 
  getUsersService, 
  getUserByIdService, 
  getWorkersService, 
  getWorkerByIdService, 
  registerWorkerService,
  buildUserFiltersFromQuery,
  buildWorkerFiltersFromQuery,
  buildPaginationParams
} from '../../service/users/adminService';
import { AuthenticatedRequest } from '../../types';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Construir filtros y paginación de forma segura
    const filters = buildUserFiltersFromQuery(req.query);
    const pagination = buildPaginationParams(req.query);

    const result = await getUsersService(filters, pagination);
    
    res.status(200).json({
      success: true,
      data: result.users,
      totalUsers: result.totalUsers,
      totalUsersInApp: result.totalUsersInApp,
      pagination: result.pagination,
      filters: result.filters
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.status(200).json(user);
  } catch (error: unknown) {
    const err = error as Error;
    const statusCode = err.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Construir filtros y paginación de forma segura
    const filters = buildWorkerFiltersFromQuery(req.query);
    const pagination = buildPaginationParams(req.query);

    const result = await getWorkersService(filters, pagination);
    
    res.status(200).json({
      success: true,
      data: result.workers,
      totalWorkers: result.totalWorkers,
      totalWorkersInApp: result.totalWorkersInApp,
      pagination: result.pagination,
      filters: result.filters
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getWorkerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getWorkerByIdService(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: unknown) {
    const err = error as Error;
    const statusCode = err.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const registerWorker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerData = req.body;
    
    const result = await registerWorkerService(workerData);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error en registerWorker controller:', error);
    
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    
    res.status(400).json({
      success: false,
      message
    });
  }
};
