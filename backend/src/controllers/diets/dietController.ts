import { Response } from 'express';
import Dieta from '../../models/diets/dieta';
import User from '../../models/users/user';
import { AuthenticatedRequest } from '../../types';


export const crearDieta = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const creadorId = req.user?.id;

    const { nombre, descripcion, tipo, duracion, asignadaA, fechaInicio } = req.body;

    const usuarioAsignado = await User.findById(asignadaA);
    if (!usuarioAsignado || usuarioAsignado.role !== 'user') {
      res.status(400).json({ message: 'El usuario asignado debe tener rol user' });
      return;
    }

    if (!duracion || !Number.isInteger(duracion) || duracion < 1) {
      res.status(400).json({ message: 'La duración debe ser un número entero mayor que 0' });
      return;
    }
    if (!fechaInicio) {
      res.status(400).json({ message: 'La fecha de inicio es obligatoria' });
      return;
    }
    const [day, month, year] = fechaInicio.split('-').map(Number);
    const fechaInicioDate = new Date(year, month - 1, day);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaInicioDate <= hoy) {
      res.status(400).json({ message: 'La fecha de inicio debe ser posterior al día actual' });
      return;
    }

    const dias = Array.from({ length: duracion }, () => ({
      caloriasTotales: null,
      macronutrientes: '',
      micronutrientes: '',
      numeroComidas: null,
      genero: '',
      requerimientosHidratacion: '',
      cumplimiento: false,
      comidas: []
    }));

    const dieta = new Dieta({
      nombre,
      descripcion,
      tipo,
      duracion,
      dias,
      fechaInicio: fechaInicioDate,
      creador: creadorId,
      asignadaA: [asignadaA]
    });

    await dieta.save();
    res.status(201).json({ message: 'Dieta creada correctamente', dieta });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la dieta', error: (error as Error).message });
  }
};