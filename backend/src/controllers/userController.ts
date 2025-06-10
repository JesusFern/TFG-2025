import { Request, Response } from 'express';
import User from '../models/User';
import { MongoError } from '../types';
import { PasswordService } from '../services/passwordService';
import { TokenService } from '../services/tokenService';

export const createUser = async (req: Request, res: Response,): Promise<void> => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'Usuario creado exitosamente', user });
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
    res.status(200).json({ token });
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