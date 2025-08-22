import { Request, Response } from 'express';
import { Types } from 'mongoose';
import User from '../../models/users/user';
import DatosSaludYNutricion from '../../models/users/datosSaludYNutricion';
import DatosActividadFisica from '../../models/users/datosActividadFisica';
import { MongoError } from '../../types';
import { PasswordService } from '../../utils/passwordService';
import { TokenService } from '../../utils/tokenService';

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
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        gender: user.gender,
        role: user.role
      }
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