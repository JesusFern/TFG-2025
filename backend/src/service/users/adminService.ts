import User from '../../models/users/user';
import mongoose from 'mongoose';
import { MongoError } from '../../types';

// Función para escapar caracteres especiales de regex de forma segura
function escapeRegexString(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Interfaces para tipos de datos

interface BaseQuery {
  [key: string]: unknown;
}

// Función auxiliar para construir filtros de usuario desde query parameters
export function buildUserFiltersFromQuery(query: Record<string, unknown>): UserFilters {
  return {
    search: typeof query.search === 'string' ? query.search : undefined,
    gender: typeof query.gender === 'string' ? query.gender : undefined,
    planType: typeof query.planType === 'string' ? query.planType : undefined,
    planPrecio: typeof query.planPrecio === 'string' ? query.planPrecio : undefined
  };
}

// Función auxiliar para construir filtros de trabajador desde query parameters
export function buildWorkerFiltersFromQuery(query: Record<string, unknown>): WorkerFilters {
  return {
    search: typeof query.search === 'string' ? query.search : undefined,
    workerType: typeof query.workerType === 'string' ? query.workerType : undefined,
    isWorkerAvailable: typeof query.isWorkerAvailable === 'string' ? query.isWorkerAvailable : undefined,
    gender: typeof query.gender === 'string' ? query.gender : undefined,
    sortBy: typeof query.sortBy === 'string' ? query.sortBy : undefined,
    sortOrder: typeof query.sortOrder === 'string' ? query.sortOrder : undefined
  };
}

// Función auxiliar para construir parámetros de paginación
export function buildPaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = parseInt(typeof query.page === 'string' ? query.page : '1') || 1;
  const limit = parseInt(typeof query.limit === 'string' ? query.limit : '10') || 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

interface SortOptions {
  [key: string]: 1 | -1;
}

interface FacetPipeline {
  [key: string]: Array<unknown>;
}

interface PlanMatchFilter {
  [key: string]: string | { $and?: Array<{ [key: string]: string }> };
}

export interface UserFilters {
  search?: string;
  gender?: string;
  planType?: string;
  planPrecio?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface UsersResult {
  users: unknown[];
  totalUsers: number;
  totalUsersInApp: number;
  totalPages: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  filters: {
    search: string;
    gender: string;
    planType: string;
    planPrecio: string;
  };
}

// Función auxiliar para construir la query base con filtros seguros
function buildUserQuery(filters: UserFilters): BaseQuery {
  const baseQuery: BaseQuery = { role: 'user' };
  
  // Aplicar filtros de búsqueda de forma segura
  if (filters.search) {
    // Escapar caracteres especiales de regex para prevenir ReDoS
    const escapedSearch = escapeRegexString(filters.search);
    const searchRegex = new RegExp(escapedSearch, 'i');
    baseQuery.$or = [
      { fullName: searchRegex },
      { email: searchRegex }
    ];
  }
  
  if (filters.gender) {
    baseQuery.gender = filters.gender;
  }
  
  return baseQuery;
}

export async function getUsersService(
  filters: UserFilters,
  pagination: PaginationParams
): Promise<UsersResult> {
  try {
    const { page, limit, skip } = pagination;
    
    // Construir query base de forma segura
    const baseQuery = buildUserQuery(filters);

    // Filtros por tipo de plan y precio (requieren join con SuscriptionPlan)
    if (filters.planType || filters.planPrecio) {
      // Caso especial: si se filtra por "Gratuito", incluir usuarios sin suscripción Y usuarios con plan gratuito
      if (filters.planPrecio === 'Gratuito') {
        // No aplicamos restricción de suscripción aquí, se manejará en el pipeline
      } else {
        // Para otros filtros, solo mostramos usuarios con suscripción
        baseQuery.suscripcion = { $exists: true };
      }
    }
    
    
    // Obtener el total de usuarios con rol 'user' en la aplicación
    const totalUsersInApp = await User.countDocuments({ role: 'user' });
    
    // Si necesitamos filtrar por tipo de plan o precio, usar aggregation
    let users, totalUsers;
    
    if (filters.planType || filters.planPrecio) {
      const planTypeStr = filters.planType;
      const planPrecioStr = filters.planPrecio;
      
      
      // Caso especial: filtro por "Gratuito" - incluir usuarios sin suscripción Y usuarios con plan gratuito
      if (planPrecioStr === 'Gratuito') {
        // Construir el pipeline de facet dinámicamente
        const facetPipeline: FacetPipeline = {
          usuariosConPlanGratuito: [
            { $match: { suscripcion: { $exists: true } } },
            {
              $lookup: {
                from: 'usersuscriptions',
                localField: 'suscripcion',
                foreignField: '_id',
                as: 'userSuscription'
              }
            },
            {
              $unwind: {
                path: '$userSuscription',
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $lookup: {
                from: 'suscriptionplans',
                localField: 'userSuscription.planId',
                foreignField: '_id',
                as: 'planInfo'
              }
            },
            {
              $unwind: {
                path: '$planInfo',
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $match: { 
                'planInfo.tipoPrecio': 'Gratuito',
                ...(planTypeStr ? { 'planInfo.tipoPlan': planTypeStr } : {})
              }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                password: 0,
                planInfo: 0,
                userSuscription: 0
              }
            }
          ]
        };

        // Solo incluir usuarios sin suscripción si no se especifica tipo de plan
        if (!planTypeStr) {
          facetPipeline.usuariosSinSuscripcion = [
            { $match: { suscripcion: { $exists: false } } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
          ];
        }

        const pipelineGratuito = [
          { $match: baseQuery },
          { $facet: facetPipeline },
          {
            $project: {
              usuariosCombinados: {
                $concatArrays: [
                  facetPipeline.usuariosSinSuscripcion ? '$usuariosSinSuscripcion' : [],
                  '$usuariosConPlanGratuito'
                ]
              }
            }
          },
          { $unwind: '$usuariosCombinados' },
          { $replaceRoot: { newRoot: '$usuariosCombinados' } }
        ];
        
        // Construir el pipeline de conteo dinámicamente
        const countFacetPipeline: FacetPipeline = {
          usuariosConPlanGratuito: [
            { $match: { suscripcion: { $exists: true } } },
            {
              $lookup: {
                from: 'usersuscriptions',
                localField: 'suscripcion',
                foreignField: '_id',
                as: 'userSuscription'
              }
            },
            {
              $unwind: {
                path: '$userSuscription',
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $lookup: {
                from: 'suscriptionplans',
                localField: 'userSuscription.planId',
                foreignField: '_id',
                as: 'planInfo'
              }
            },
            {
              $unwind: {
                path: '$planInfo',
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $match: { 
                'planInfo.tipoPrecio': 'Gratuito',
                ...(planTypeStr ? { 'planInfo.tipoPlan': planTypeStr } : {})
              }
            },
            { $count: 'total' }
          ]
        };

        // Solo incluir usuarios sin suscripción si no se especifica tipo de plan
        if (!planTypeStr) {
          countFacetPipeline.usuariosSinSuscripcion = [
            { $match: { suscripcion: { $exists: false } } },
            { $count: 'total' }
          ];
        }

        const countPipelineGratuito = [
          { $match: baseQuery },
          { $facet: countFacetPipeline },
          {
            $project: {
              total: {
                $add: [
                  countFacetPipeline.usuariosSinSuscripcion ? 
                    { $ifNull: [{ $arrayElemAt: ['$usuariosSinSuscripcion.total', 0] }, 0] } : 0,
                  { $ifNull: [{ $arrayElemAt: ['$usuariosConPlanGratuito.total', 0] }, 0] }
                ]
              }
            }
          }
        ];
        
        const [usersResult, countResult] = await Promise.all([
          User.aggregate(pipelineGratuito as unknown as mongoose.PipelineStage[]),
          User.aggregate(countPipelineGratuito as unknown as mongoose.PipelineStage[])
        ]);
        
        
        users = usersResult;
        totalUsers = countResult[0]?.total || 0;
      } else {
        // Casos normales: filtros de tipo de plan o precio específico (no Gratuito)
        const planMatchFilter: PlanMatchFilter = {};
        
        if (planTypeStr && planPrecioStr) {
          // Ambos filtros activos
          (planMatchFilter as { $and: Array<{ [key: string]: string }> }).$and = [
            { 'planInfo.tipoPlan': planTypeStr },
            { 'planInfo.tipoPrecio': planPrecioStr }
          ];
        } else if (planTypeStr) {
          // Solo filtro por tipo de plan
          planMatchFilter['planInfo.tipoPlan'] = planTypeStr;
        } else if (planPrecioStr) {
          // Solo filtro por tipo de precio
          planMatchFilter['planInfo.tipoPrecio'] = planPrecioStr;
        }
        
        
        const pipeline = [
        { $match: baseQuery },
        {
          $lookup: {
            from: 'usersuscriptions',
            localField: 'suscripcion',
            foreignField: '_id',
            as: 'userSuscription'
          }
        },
        {
          $unwind: {
            path: '$userSuscription',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $lookup: {
            from: 'suscriptionplans',
            localField: 'userSuscription.planId',
            foreignField: '_id',
            as: 'planInfo'
          }
        },
        {
          $unwind: {
            path: '$planInfo',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $match: planMatchFilter
        },
        { $sort: { createdAt: -1 as 1 | -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            password: 0, // Excluir la contraseña
            planInfo: 0, // No necesitamos los datos del plan en la respuesta
            userSuscription: 0 // No necesitamos los datos de la suscripción en la respuesta
          }
        }
      ];
      
      const countPipeline = [
        { $match: baseQuery },
        {
          $lookup: {
            from: 'usersuscriptions',
            localField: 'suscripcion',
            foreignField: '_id',
            as: 'userSuscription'
          }
        },
        {
          $unwind: {
            path: '$userSuscription',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $lookup: {
            from: 'suscriptionplans',
            localField: 'userSuscription.planId',
            foreignField: '_id',
            as: 'planInfo'
          }
        },
        {
          $unwind: {
            path: '$planInfo',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $match: planMatchFilter
        },
        { $count: 'total' }
      ];
      
      const [usersResult, countResult] = await Promise.all([
        User.aggregate(pipeline as unknown as mongoose.PipelineStage[]),
        User.aggregate(countPipeline as unknown as mongoose.PipelineStage[])
      ]);
      
      
        users = usersResult;
        totalUsers = countResult[0]?.total || 0;
      }
    } else {
      [users, totalUsers] = await Promise.all([
        User.find(baseQuery)
          .select('-password') // Excluir la contraseña
          .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(baseQuery)
      ]);
    }
    
    const totalPages = Math.ceil(totalUsers / limit);
    
    return {
      users,
      totalUsers,
      totalUsersInApp,
      totalPages,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      },
      filters: {
        search: filters.search || '',
        gender: filters.gender || '',
        planType: filters.planType || '',
        planPrecio: filters.planPrecio || ''
      }
    };
  } catch (error) {
    console.error('Error en getUsersService:', error);
    throw error;
  }
}

export async function getUserByIdService(userId: string): Promise<unknown> {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  } catch (error) {
    console.error('Error en getUserByIdService:', error);
    throw error;
  }
}

// Interfaces para gestión de trabajadores
export interface WorkerFilters {
  search?: string;
  workerType?: string;
  isWorkerAvailable?: string;
  gender?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface WorkersResult {
  workers: unknown[];
  totalWorkers: number;
  totalWorkersInApp: number;
  totalPages: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalWorkers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  filters: {
    search: string;
    workerType: string;
    isWorkerAvailable: string;
    gender: string;
  };
}

// Función auxiliar para construir la query base de trabajadores con filtros seguros
function buildWorkerQuery(filters: WorkerFilters): BaseQuery {
  const baseQuery: BaseQuery = { role: 'worker' };
  
  // Aplicar filtros de búsqueda de forma segura
  if (filters.search) {
    // Escapar caracteres especiales de regex para prevenir ReDoS
    const escapedSearch = escapeRegexString(filters.search);
    const searchRegex = new RegExp(escapedSearch, 'i');
    baseQuery.$or = [
      { fullName: searchRegex },
      { email: searchRegex }
    ];
  }
  
  if (filters.workerType) {
    baseQuery.workerType = filters.workerType;
  }

  if (filters.isWorkerAvailable !== undefined && filters.isWorkerAvailable !== '') {
    baseQuery.isWorkerAvailable = filters.isWorkerAvailable === 'true';
  }

  if (filters.gender) {
    baseQuery.gender = filters.gender;
  }
  
  return baseQuery;
}

export async function getWorkersService(
  filters: WorkerFilters,
  pagination: PaginationParams
): Promise<WorkersResult> {
  try {
    const { page, limit, skip } = pagination;
    
    // Construir query base de forma segura
    const baseQuery = buildWorkerQuery(filters);

    // Obtener el total de trabajadores en la aplicación
    const totalWorkersInApp = await User.countDocuments({ role: 'worker' });
    
    // Configurar ordenamiento
    const sortField = filters.sortBy || 'createdAt';
    const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: SortOptions = { [sortField]: sortDirection };
    
    // Ejecutar consulta
    const [workers, totalWorkers] = await Promise.all([
      User.find(baseQuery)
        .select('-password') // Excluir la contraseña
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(baseQuery)
    ]);
    
    const totalPages = Math.ceil(totalWorkers / limit);
    
    return {
      workers,
      totalWorkers,
      totalWorkersInApp,
      totalPages,
      pagination: {
        currentPage: page,
        totalPages,
        totalWorkers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      },
      filters: {
        search: filters.search || '',
        workerType: filters.workerType || '',
        isWorkerAvailable: filters.isWorkerAvailable || '',
        gender: filters.gender || ''
      }
    };
  } catch (error) {
    console.error('Error en getWorkersService:', error);
    throw error;
  }
}

export async function getWorkerByIdService(workerId: string): Promise<unknown> {
  try {
    const worker = await User.findById(workerId)
      .select('-password')
      .populate({
        path: 'clientesAsignados.clienteId',
        select: '_id fullName email'
      })
      .lean();
      
    if (!worker) {
      throw new Error('Trabajador no encontrado');
    }
    
    if (worker.role !== 'worker') {
      throw new Error('El usuario especificado no es un trabajador');
    }
    
    return worker;
  } catch (error) {
    console.error('Error en getWorkerByIdService:', error);
    throw error;
  }
}

// Interfaces para registro de trabajadores
interface WorkerRegistrationData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  workerType: 'Entrenador personal' | 'Nutricionista' | 'Nutricionista y Entrenador personal';
  biography: string;
  availability: string;
  gender?: 'Masculino' | 'Femenino' | 'Otro';
  birthDate?: Date;
  profilePicture?: string;
  isWorkerAvailable?: boolean;
}

export async function registerWorkerService(workerData: WorkerRegistrationData) {
  try {
    // Verificar que el email no esté ya registrado
    const existingUser = await User.findOne({ email: workerData.email });
    if (existingUser) {
      throw new Error('Ya existe un usuario registrado con este email');
    }

    // Crear el nuevo trabajador
    const newWorker = new User({
      ...workerData,
      role: 'worker',
      isNew: true,
      isWorkerAvailable: workerData.isWorkerAvailable ?? true,
      satisfactionRating: 0 // Inicializar rating en 0
    });

    // Guardar el trabajador
    const savedWorker = await newWorker.save();

    // Retornar los datos del trabajador sin la contraseña
    const workerResponse = {
      _id: savedWorker._id,
      fullName: savedWorker.fullName,
      email: savedWorker.email,
      phoneNumber: savedWorker.phoneNumber,
      role: savedWorker.role,
      workerType: savedWorker.workerType,
      biography: savedWorker.biography,
      availability: savedWorker.availability,
      gender: savedWorker.gender,
      birthDate: savedWorker.birthDate,
      profilePicture: savedWorker.profilePicture,
      isWorkerAvailable: savedWorker.isWorkerAvailable,
      satisfactionRating: savedWorker.satisfactionRating,
      clientesAsignados: savedWorker.clientesAsignados || [],
      createdAt: (savedWorker as mongoose.Document & { createdAt?: Date }).createdAt,
      updatedAt: (savedWorker as mongoose.Document & { updatedAt?: Date }).updatedAt
    };

    return {
      success: true,
      message: 'Trabajador registrado exitosamente',
      data: workerResponse
    };

  } catch (error) {
    console.error('Error en registerWorkerService:', error);
    
    if (error instanceof Error) {
      // Errores de validación de Mongoose
      if (error.name === 'ValidationError') {
        const mongoError = error as Error & { errors?: Record<string, { message: string }> };
        const validationErrors = Object.values(mongoError.errors || {}).map((err) => err.message);
        throw new Error(`Error de validación: ${validationErrors.join(', ')}`);
      }
      
      // Error de duplicado
      if ((error as MongoError).code === 11000) {
        throw new Error('Ya existe un usuario registrado con este email');
      }
      
      throw error;
    }
    
    throw new Error('Error interno del servidor al registrar el trabajador');
  }
}
