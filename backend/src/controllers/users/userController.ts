import { Request, Response } from 'express';
import { Types } from 'mongoose';
import User from '../../models/users/user';
import DatosSaludYNutricion from '../../models/users/datosSaludYNutricion';
import DatosActividadFisica from '../../models/users/datosActividadFisica';
import { MongoError, AuthenticatedRequest } from '../../types';
import { PasswordService } from '../../utils/passwordService';
import { TokenService } from '../../utils/tokenService';
import { UserService } from '../../service/users/userService';

interface ValidationRequest extends Request {
  validationErrors?: Array<{
    type: string;
    value: string;
    msg: string;
    path: string;
    location: string;
  }>;
}

export const registerUser = async (req: ValidationRequest, res: Response): Promise<void> => {
  try {
    // Verificar si hay errores de validación
    if (req.validationErrors && req.validationErrors.length > 0) {
      res.status(400).json({ 
        message: 'Errores de validación',
        errors: req.validationErrors 
      });
      return;
    }

    const { fullName, email, password, phoneNumber, gender, birthDate, profilePicture } = req.body;

    // Campos opcionales que pueden venir del frontend como parte del registro
    // health: datos de salud y nutrición
    // activity: datos de actividad física
    const health = req.body.health as Record<string, unknown> | undefined;
    const activity = req.body.activity as Record<string, unknown> | undefined;

    // Crea el usuario con rol fijo 'user'
    const user = new User({
      fullName,
      email,
      password,
      phoneNumber,
      gender,
      birthDate,
      profilePicture,
      role: 'user'
    });

    await user.save();

    // Crea los documentos relacionados si llegan en el payload
    let datosSaludId: Types.ObjectId | undefined;
    let datosActividadId: Types.ObjectId | undefined;

    // Helper para coerción de texto a array de strings
    const toStringArray = (value: unknown): string[] => {
      if (Array.isArray(value)) {
        return value.map((v) => String(v)).filter((v) => v.trim().length > 0);
      }
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
      }
      return [];
    };

    if (health) {
      // Validar que horariosComidas no esté vacío
      if (!health.horariosComidas || !Array.isArray(health.horariosComidas) || health.horariosComidas.length === 0) {
        res.status(400).json({
          message: 'Debe especificar al menos un horario de comida',
          field: 'horariosComidas'
        });
        return;
      }

      // Crear objeto sanitizado con campos explícitos para evitar riesgos de seguridad
      const datosSaludSanitizados = {
        userId: user._id,
        altura: Number(health.altura),
        pesoActual: Number(health.pesoActual ?? health.peso),
        objetivoPeso: Number(health.objetivoPeso),
        condicionesMedicas: toStringArray(health.condicionesMedicas ?? health.condiciones),
        restriccionesDieteticas: toStringArray(health.restriccionesDieteticas ?? health.restricciones),
        alergiasIntolerancias: toStringArray(health.alergiasIntolerancias ?? health.alergias),
        medicacionActual: toStringArray(health.medicacionActual),
        preferenciasAlimentarias: toStringArray(health.preferenciasAlimentarias ?? health.preferencias),
        horariosComidas: Array.isArray(health.horariosComidas) ? health.horariosComidas : []
      };

      // Crear instancia del modelo y asignar valores de forma explícita
      const datosSalud = new DatosSaludYNutricion();
      datosSalud.userId = user._id as Types.ObjectId;
      datosSalud.altura = datosSaludSanitizados.altura;
      datosSalud.pesoActual = datosSaludSanitizados.pesoActual;
      datosSalud.objetivoPeso = datosSaludSanitizados.objetivoPeso;
      datosSalud.condicionesMedicas = datosSaludSanitizados.condicionesMedicas;
      datosSalud.restriccionesDieteticas = datosSaludSanitizados.restriccionesDieteticas;
      datosSalud.alergiasIntolerancias = datosSaludSanitizados.alergiasIntolerancias;
      datosSalud.medicacionActual = datosSaludSanitizados.medicacionActual;
      datosSalud.preferenciasAlimentarias = datosSaludSanitizados.preferenciasAlimentarias;
      datosSalud.horariosComidas = datosSaludSanitizados.horariosComidas;
      
      await datosSalud.save();
      datosSaludId = datosSalud._id as Types.ObjectId;
    }

    if (activity) {
      // Crear objeto sanitizado con campos explícitos para evitar riesgos de seguridad
      const datosActividadSanitizados = {
        userId: user._id,
        frecuenciaEjercicio: String(activity.nivelActividad),
        tipoEjercicioPractica: toStringArray(activity.tipoEjercicio),
        objetivosPrincipales: [String(activity.objetivo)],
        preferenciasEjercicios: toStringArray(activity.preferenciasEjercicios ?? activity.otrosEjercicios),
        limitacionesFisicas: [],
        numeroContactoEmergencia: undefined
      };

      // Crear instancia del modelo y asignar valores de forma explícita
      const datosActividad = new DatosActividadFisica();
      datosActividad.userId = user._id as Types.ObjectId;
      datosActividad.frecuenciaEjercicio = datosActividadSanitizados.frecuenciaEjercicio;
      datosActividad.tipoEjercicioPractica = datosActividadSanitizados.tipoEjercicioPractica;
      datosActividad.objetivosPrincipales = datosActividadSanitizados.objetivosPrincipales;
      datosActividad.preferenciasEjercicios = datosActividadSanitizados.preferenciasEjercicios;
      datosActividad.limitacionesFisicas = datosActividadSanitizados.limitacionesFisicas;
      datosActividad.numeroContactoEmergencia = datosActividadSanitizados.numeroContactoEmergencia || '';
      
      await datosActividad.save();
      datosActividadId = datosActividad._id as Types.ObjectId;
    }

    if (datosSaludId || datosActividadId) {
      user.datosSaludYNutricion = datosSaludId ?? user.datosSaludYNutricion;
      user.datosActividadFisica = datosActividadId ?? user.datosActividadFisica;
      await user.save();
    }

    const token = TokenService.generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        gender: user.gender,
        role: user.role,
        datosSaludYNutricion: user.datosSaludYNutricion ?? null,
        datosActividadFisica: user.datosActividadFisica ?? null
      },
      token
    });
  } catch (error: unknown) {
    const mongoError = error as MongoError;
    if (mongoError.code === 11000) {
      const duplicatedField = Object.keys(mongoError.keyValue!)[0];
      res.status(400).json({
        message: `El ${duplicatedField} ya está en uso. Por favor, utiliza otro.`,
        field: duplicatedField,
      });
    } else {
      res.status(500).json({ message: (error as Error).message || 'Error interno del servidor' });
    }
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toString().trim().toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    const isPasswordValid = await PasswordService.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    const token = TokenService.generateToken({ id: user._id, role: user.role });    
    res.status(200).json({ 
      token, 
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        workerType: user.workerType || undefined,
        profilePicture: user.profilePicture || undefined
      },
      message: 'Inicio de sesión exitoso'
    });
  } catch (error: unknown) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(user);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(user);
  } catch (error: unknown) {
    const mongoError = error as MongoError;
    if (mongoError.code === 11000) {
      const duplicatedField = Object.keys(mongoError.keyValue!)[0];
      res.status(400).json({
        message: `El ${duplicatedField} ya está en uso. Por favor, utiliza otro.`,
        field: duplicatedField,
      });
    } else {
      res.status(400).json({ message: (error as Error).message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

// Nuevo método para obtener el perfil del usuario autenticado
export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const user = await User.findById(userId)
      .populate('datosSaludYNutricion')
      .populate('datosActividadFisica');

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ user });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

// Nuevo método para actualizar el perfil del usuario autenticado
export const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { fullName, email, phoneNumber, gender, birthDate, profilePicture, workerType, biography, availability } = req.body;

    // Verificar que el email no esté duplicado si se está cambiando
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existingUser) {
        res.status(400).json({ message: 'El email ya está en uso' });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, email, phoneNumber, gender, birthDate, profilePicture, workerType, biography, availability },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ user });
  } catch (error: unknown) {
    const mongoError = error as MongoError;
    if (mongoError.code === 11000) {
      const duplicatedField = Object.keys(mongoError.keyValue!)[0];
      res.status(400).json({
        message: `El ${duplicatedField} ya está en uso. Por favor, utiliza otro.`,
        field: duplicatedField,
      });
    } else {
      res.status(400).json({ message: (error as Error).message });
    }
  }
};

// Nuevo método para cambiar la contraseña del usuario autenticado
export const changeMyPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Verificar la contraseña actual
    const isCurrentPasswordValid = await PasswordService.comparePasswords(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      return;
    }

    // Cambiar la contraseña
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

// Nuevo método para subir foto de perfil
export const uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { profilePicture } = req.body;

    // Validar que profilePicture existe
    if (!profilePicture) {
      res.status(400).json({ message: 'La imagen de perfil es obligatoria' });
      return;
    }

    // Validar formato de imagen base64
    if (typeof profilePicture !== 'string') {
      res.status(400).json({ message: 'Formato de imagen inválido' });
      return;
    }

    // Validar que sea una imagen base64 válida
    if (!profilePicture.startsWith('data:image/')) {
      res.status(400).json({ message: 'Formato de imagen no válido. Debe ser una imagen base64' });
      return;
    }

    // Validar tamaño del base64 (aproximadamente 1.37x el tamaño del archivo original)
    const base64Size = Buffer.byteLength(profilePicture, 'utf8');
    const maxBase64Size = 15 * 1024 * 1024; // 15MB para base64 (equivalente a ~11MB de archivo)
    
    if (base64Size > maxBase64Size) {
      res.status(413).json({ 
        message: 'La imagen es demasiado grande. Máximo 10MB permitido.',
        size: `${(base64Size / 1024 / 1024).toFixed(1)}MB`,
        maxSize: '10MB'
      });
      return;
    }

    // Validar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Actualizar la foto de perfil
    user.profilePicture = profilePicture;
    await user.save();

    res.status(200).json({ 
      message: 'Foto de perfil actualizada correctamente',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ 
      message: 'Error interno del servidor al procesar la imagen',
      error: err.message 
    });
  }
};


export const getTrabajadoresRol = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const result = await UserService.getTrabajadoresRol(userId);

    res.status(200).json({
      success: true,
      message: `Trabajadores disponibles para tu plan ${result.planType}`,
      data: result
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error al obtener trabajadores por rol:', err);
    
    // Determinar el código de estado según el tipo de error
    let statusCode = 500;
    if (err.message.includes('No tienes una suscripción activa') || 
        err.message.includes('plan gratuito') || 
        err.message.includes('expirado')) {
      statusCode = 403;
    } else if (err.message.includes('Tipo de plan no válido')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      message: err.message 
    });
  }
};

export const getAllAvailableWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const workers = await UserService.getAllAvailableWorkers();

    res.status(200).json(workers);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error al obtener trabajadores disponibles:', err);
    res.status(500).json({ 
      message: 'Error interno del servidor al obtener trabajadores',
      error: err.message 
    });
  }
};

export const getWorkersAssignedToClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { clienteId } = req.params;

    if (!Types.ObjectId.isValid(clienteId)) {
      res.status(400).json({ message: 'ID de cliente inválido' });
      return;
    }

    // Buscar trabajadores que tengan este cliente asignado
    const workers = await User.find({
      role: 'worker',
      'clientesAsignados.clienteId': new Types.ObjectId(clienteId)
    }).select('_id fullName email workerType');

    // Mapear a formato ProfesionalCita
    const profesionalesAsignados = workers.map(worker => ({
      _id: (worker._id as Types.ObjectId).toString(),
      fullName: worker.fullName,
      email: worker.email,
      workerType: worker.workerType
    }));

    res.status(200).json(profesionalesAsignados);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error al obtener trabajadores asignados:', err);
    res.status(500).json({ 
      message: 'Error interno del servidor al obtener trabajadores asignados',
      error: err.message 
    });
  }
};


export const checkUserSubscriptionStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    if (user.role !== 'user') {
      res.status(403).json({ message: 'Solo los usuarios pueden acceder a esta información' });
      return;
    }

    const result = await UserService.checkUserSubscriptionStatus(userId);

    res.status(200).json(result);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error al verificar estado de suscripción:', err);
    res.status(500).json({ 
      message: 'Error interno del servidor al verificar suscripción',
      error: err.message 
    });
  }
};

// Obtener clientes asignados a un trabajador
export const getClientsAssignedToWorker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;

    if (!Types.ObjectId.isValid(workerId)) {
      res.status(400).json({ message: 'ID de trabajador inválido' });
      return;
    }

    // Buscar el trabajador y obtener sus clientes asignados
    const worker = await User.findById(workerId).select('clientesAsignados');
    
    if (!worker) {
      res.status(404).json({ message: 'Trabajador no encontrado' });
      return;
    }

    // Extraer los IDs de los clientes asignados
    const clientesIds = worker.clientesAsignados?.map(cliente => cliente.clienteId) || [];

    // Buscar los clientes
    const clientes = await User.find({
      _id: { $in: clientesIds },
      role: 'user'
    }).select('_id fullName email profilePicture role');

    // Mapear a formato UsuarioResumido
    const clientesAsignados = clientes.map(cliente => ({
      _id: (cliente._id as Types.ObjectId).toString(),
      fullName: cliente.fullName,
      email: cliente.email,
      profilePicture: cliente.profilePicture,
      role: cliente.role
    }));

    res.status(200).json(clientesAsignados);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error al obtener clientes asignados:', err);
    res.status(500).json({ 
      message: 'Error interno del servidor al obtener clientes asignados',
      error: err.message 
    });
  }
};
