import User from '../../models/users/user';
import mongoose from 'mongoose';
import { MongoError } from '../../types';
import { createGratuitoPlanPipeline, createNoSubscriptionPipeline, createSubscriptionLookupPipeline } from '../../utils/mongoPipelineUtils';

// Función para validar y sanitizar strings de entrada
function validateAndSanitizeString(input: unknown, fieldName: string): string | undefined {
  if (input === undefined || input === null || input === '') {
    return undefined;
  }
  
  if (typeof input !== 'string') {
    throw new Error(`Invalid ${fieldName}: must be a string`);
  }
  
  // Sanitizar: eliminar caracteres peligrosos y limitar longitud
  const sanitized = input.trim().slice(0, 100);
  
  // Validar que no contenga caracteres de control o operadores MongoDB
  for (let i = 0; i < sanitized.length; i++) {
    const charCode = sanitized.charCodeAt(i);
    if (charCode < 32 || charCode === 127) {
      throw new Error(`Invalid ${fieldName}: contains control characters`);
    }
  }
  
  return sanitized;
}

// Función para validar valores de género
function validateGender(input: unknown): string | undefined {
  const sanitized = validateAndSanitizeString(input, 'gender');
  if (!sanitized) return undefined;
  
  const validGenders = ['Masculino', 'Femenino', 'Otro'];
  if (!validGenders.includes(sanitized)) {
    throw new Error('Invalid gender: must be Masculino, Femenino, or Otro');
  }
  
  return sanitized;
}

// Función para validar tipos de trabajador
function validateWorkerType(input: unknown): string | undefined {
  const sanitized = validateAndSanitizeString(input, 'workerType');
  if (!sanitized) return undefined;
  
  const validTypes = ['Entrenador personal', 'Nutricionista', 'Nutricionista y Entrenador personal'];
  if (!validTypes.includes(sanitized)) {
    throw new Error('Invalid workerType: must be a valid worker type');
  }
  
  return sanitized;
}

// Función para validar disponibilidad de trabajador
function validateWorkerAvailability(input: unknown): boolean | undefined {
  if (input === undefined || input === null || input === '') {
    return undefined;
  }
  
  if (typeof input === 'boolean') {
    return input;
  }
  
  if (typeof input === 'string') {
    const sanitized = input.trim().toLowerCase();
    if (sanitized === 'true') return true;
    if (sanitized === 'false') return false;
  }
  
  throw new Error('Invalid isWorkerAvailable: must be true or false');
}

// Función para validar tipos de plan
function validatePlanType(input: unknown): string | undefined {
  const sanitized = validateAndSanitizeString(input, 'planType');
  if (!sanitized) return undefined;
  
  const validTypes = ['Nutricion', 'Entrenamiento', 'Completo'];
  if (!validTypes.includes(sanitized)) {
    throw new Error('Invalid planType: must be Nutricion, Entrenamiento, or Completo');
  }
  
  return sanitized;
}

// Función para validar tipos de precio
function validatePlanPrecio(input: unknown): string | undefined {
  const sanitized = validateAndSanitizeString(input, 'planPrecio');
  if (!sanitized) return undefined;
  
  const validPrices = ['Gratuito', 'Básico', 'Premium'];
  if (!validPrices.includes(sanitized)) {
    throw new Error('Invalid planPrecio: must be Gratuito, Básico, or Premium');
  }
  
  return sanitized;
}

// Función para crear filtros de búsqueda seguros sin usar RegExp
function createSafeSearchFilter(searchTerm: string): { $or: Array<{ [key: string]: { $regex: string; $options: string } }> } {
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  return {
    $or: [
      { fullName: { $regex: escapedTerm, $options: 'i' } },
      { email: { $regex: escapedTerm, $options: 'i' } }
    ]
  };
}

// Interfaces para tipos de datos

interface BaseQuery {
  [key: string]: unknown;
}

// Función auxiliar para construir filtros de usuario desde query parameters
export function buildUserFiltersFromQuery(query: Record<string, unknown>): UserFilters {
  try {
    return {
      search: validateAndSanitizeString(query.search, 'search'),
      gender: validateGender(query.gender),
      planType: validatePlanType(query.planType),
      planPrecio: validatePlanPrecio(query.planPrecio)
    };
  } catch (error) {
    throw new Error(`Invalid filter parameters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Función auxiliar para construir filtros de trabajador desde query parameters
export function buildWorkerFiltersFromQuery(query: Record<string, unknown>): WorkerFilters {
  try {
    return {
      search: validateAndSanitizeString(query.search, 'search'),
      workerType: validateWorkerType(query.workerType),
      isWorkerAvailable: validateWorkerAvailability(query.isWorkerAvailable)?.toString(),
      gender: validateGender(query.gender),
      sortBy: validateAndSanitizeString(query.sortBy, 'sortBy'),
      sortOrder: validateAndSanitizeString(query.sortOrder, 'sortOrder')
    };
  } catch (error) {
    throw new Error(`Invalid filter parameters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Función auxiliar para construir parámetros de paginación
export function buildPaginationParams(query: Record<string, unknown>): PaginationParams {
  try {
    const pageStr = validateAndSanitizeString(query.page, 'page') || '1';
    const limitStr = validateAndSanitizeString(query.limit, 'limit') || '10';
    
    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);
    
    // Validar rangos
    if (isNaN(page) || page < 1 || page > 1000) {
      throw new Error('Invalid page: must be between 1 and 1000');
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new Error('Invalid limit: must be between 1 and 100');
    }
    
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
  } catch (error) {
    throw new Error(`Invalid pagination parameters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
    const searchFilter = createSafeSearchFilter(filters.search);
    baseQuery.$or = searchFilter.$or;
  }
  
  // Aplicar filtro de género de forma segura (ya validado)
  if (filters.gender) {
    baseQuery.gender = filters.gender; // Ya está validado y sanitizado
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
            ...createGratuitoPlanPipeline(planTypeStr),
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
            ...createNoSubscriptionPipeline(),
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
            ...createGratuitoPlanPipeline(planTypeStr),
            { $count: 'total' }
          ]
        };

        // Solo incluir usuarios sin suscripción si no se especifica tipo de plan
        if (!planTypeStr) {
          countFacetPipeline.usuariosSinSuscripcion = [
            ...createNoSubscriptionPipeline(),
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
        ...createSubscriptionLookupPipeline(),
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
        ...createSubscriptionLookupPipeline(),
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
          .populate({
            path: 'suscripcion',
            populate: {
              path: 'planId',
              model: 'SuscriptionPlan'
            }
          })
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
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'suscripcion',
        populate: {
          path: 'planId',
          model: 'SuscriptionPlan'
        }
      })
      .lean();
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
    const searchFilter = createSafeSearchFilter(filters.search);
    baseQuery.$or = searchFilter.$or;
  }
  
  // Aplicar filtros de forma segura (ya validados)
  if (filters.workerType) {
    baseQuery.workerType = filters.workerType; // Ya está validado y sanitizado
  }

  if (filters.isWorkerAvailable !== undefined && filters.isWorkerAvailable !== '') {
    baseQuery.isWorkerAvailable = filters.isWorkerAvailable === 'true'; // Ya está validado
  }

  if (filters.gender) {
    baseQuery.gender = filters.gender; // Ya está validado y sanitizado
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
    // Validar y sanitizar el email antes de usarlo en la query
    const sanitizedEmail = validateAndSanitizeString(workerData.email, 'email');
    if (!sanitizedEmail) {
      throw new Error('Email es requerido');
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      throw new Error('Formato de email inválido');
    }
    
    // Verificar que el email no esté ya registrado
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      throw new Error('Ya existe un usuario registrado con este email');
    }

    // Crear el nuevo trabajador con datos sanitizados
    const newWorker = new User({
      ...workerData,
      email: sanitizedEmail, // Usar el email sanitizado
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
