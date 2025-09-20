import { useState, useEffect } from 'react';
import { Ejercicio } from '../types/training';
import { trainingService } from '../services/trainingService';

export const useEjercicioData = (ejercicioId?: string) => {
  const [ejercicio, setEjercicio] = useState<Ejercicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEjercicio = async () => {
      if (!ejercicioId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const ejercicioData = await trainingService.obtenerEjercicioPorId(ejercicioId);
        setEjercicio(ejercicioData);
        
      } catch (err) {
        console.error('Error al cargar ejercicio:', err);
        setError('Error al cargar los datos del ejercicio');
      } finally {
        setLoading(false);
      }
    };

    cargarEjercicio();
  }, [ejercicioId]);

  return { ejercicio, loading, error };
};

export const getDifficultyColor = (nivel: string | undefined) => {
  if (!nivel) return 'blue';
  switch (nivel.toLowerCase()) {
    case 'principiante':
      return 'green';
    case 'intermedio':
      return 'yellow';
    case 'avanzado':
      return 'red';
    default:
      return 'blue';
  }
};

export const getIntensityColor = (nivel: string | undefined) => {
  if (!nivel) return 'blue';
  switch (nivel.toLowerCase()) {
    case 'baja':
      return 'green';
    case 'media':
      return 'yellow';
    case 'alta':
      return 'red';
    default:
      return 'blue';
  }
};
