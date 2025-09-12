import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import trainingService from '../services/trainingService';
import type { PlanEntrenamiento, SesionPlan, Ejercicio } from '../types/training';

interface UseTrainingDataProps {
  planId: string | undefined;
  options?: {
    redirectToEdit?: boolean;
    redirectToView?: boolean;
    loadExercises?: boolean;
  };
}

interface UseTrainingDataReturn {
  plan: PlanEntrenamiento | null;
  sesiones: SesionPlan[];
  ejercicios: Ejercicio[];
  loading: boolean;
  error: string | null;
  fechaInicio: Date | null;
  setError: (error: string | null) => void;
  getEjercicioById: (ejercicioId: string) => Ejercicio | null;
  refetch: () => Promise<void>;
}

export const useTrainingData = ({ 
  planId, 
  options = {} 
}: UseTrainingDataProps): UseTrainingDataReturn => {
  const navigate = useNavigate();
  const { redirectToEdit = false, redirectToView = false, loadExercises = true } = options;
  
  const [plan, setPlan] = useState<PlanEntrenamiento | null>(null);
  const [sesiones, setSesiones] = useState<SesionPlan[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    const normalizeSesiones = (sesionesData: SesionPlan[]): SesionPlan[] => {
      return sesionesData.map(sesion => ({
        ...sesion,
        ejercicios: sesion.ejercicios.map(ejercicio => ({
          ...ejercicio,
          ejercicio: typeof ejercicio.ejercicio === 'object' && ejercicio.ejercicio !== null 
            ? (ejercicio.ejercicio as { _id: string })._id 
            : ejercicio.ejercicio
        }))
      }));
    };
    if (!planId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [planData, sesionesData, ejerciciosData] = await Promise.all([
        trainingService.obtenerPlanPorId(planId),
        trainingService.obtenerSesiones({ plan: planId }),
        loadExercises ? trainingService.obtenerEjercicios() : Promise.resolve([])
      ]);
      
      setPlan(planData);
      
      // Lógica de redirección
      if (redirectToEdit && planData.draftMode) {
        navigate(`/editar-plan-entrenamiento/${planId}`);
        return;
      }
      
      if (redirectToView && !planData.draftMode) {
        navigate(`/training/planes/${planId}`);
        return;
      }
      
      // Normalizar sesiones
      const sesionesNormalizadas = normalizeSesiones(sesionesData);
      setSesiones(sesionesNormalizadas);
      
      if (loadExercises) {
        setEjercicios(ejerciciosData);
      }
      
      // Configurar fecha de inicio
      if (planData.fechaInicio) {
        const fechaInicioDate = new Date(planData.fechaInicio);
        setFechaInicio(fechaInicioDate);
      }
      
    } catch (e) {
      setError((e as Error).message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [planId, navigate, redirectToEdit, redirectToView, loadExercises]);

  useEffect(() => {
    void loadData();
  }, [planId, navigate, redirectToEdit, redirectToView, loadExercises, loadData]);

  const getEjercicioById = (ejercicioId: string): Ejercicio | null => {
    return ejercicios.find(ej => ej._id === ejercicioId) || null;
  };

  return {
    plan,
    sesiones,
    ejercicios,
    loading,
    error,
    fechaInicio,
    setError,
    getEjercicioById,
    refetch: loadData
  };
};

// Hook específico para edición (mantiene compatibilidad)
export const useTrainingPlanData = ({ planId, redirectToEdit = false }: { planId: string | undefined; redirectToEdit?: boolean }) => {
  return useTrainingData({ 
    planId, 
    options: { redirectToEdit, loadExercises: true } 
  });
};
