import { Request, Response } from 'express';
import { getUsersService, getUserByIdService, UserFilters, getWorkersService, getWorkerByIdService, WorkerFilters, registerWorkerService } from '../../service/users/adminService';
import { AuthenticatedRequest } from '../../types';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const filters: UserFilters = {
      search: req.query.search as string,
      gender: req.query.gender as string,
      planType: req.query.planType as string,
      planPrecio: req.query.planPrecio as string
    };

    const result = await getUsersService(filters, { page, limit, skip });
    
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
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const filters: WorkerFilters = {
      search: req.query.search as string,
      workerType: req.query.workerType as string,
      isWorkerAvailable: req.query.isWorkerAvailable as string,
      gender: req.query.gender as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as string
    };

    const result = await getWorkersService(filters, { page, limit, skip });
    
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
    res.status(500).json({ 
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
