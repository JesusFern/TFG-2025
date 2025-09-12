import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import trainingService from '../services/trainingService';
import type { PlanEntrenamiento, SesionPlan, Ejercicio } from '../types/training';

interface UseTrainingPlanDataProps {
  planId: string | undefined;
  redirectToEdit?: boolean;
}

export const useTrainingPlanData = ({ planId, redirectToEdit = false }: UseTrainingPlanDataProps) => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanEntrenamiento | null>(null);
  const [sesiones, setSesiones] = useState<SesionPlan[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!planId) return;
      setLoading(true);
      try {
        const [planData, sesionesData, ejerciciosData] = await Promise.all([
          trainingService.obtenerPlanPorId(planId),
          trainingService.obtenerSesiones({ plan: planId }),
          trainingService.obtenerEjercicios()
        ]);
        
        setPlan(planData);
        
        if (redirectToEdit && planData.draftMode) {
          navigate(`/editar-plan-entrenamiento/${planId}`);
          return;
        }
        
        const sesionesNormalizadas = sesionesData.map(sesion => ({
          ...sesion,
          ejercicios: sesion.ejercicios.map(ejercicio => ({
            ...ejercicio,
            ejercicio: typeof ejercicio.ejercicio === 'object' && ejercicio.ejercicio !== null 
              ? (ejercicio.ejercicio as { _id: string })._id 
              : ejercicio.ejercicio
          }))
        }));
        
        setSesiones(sesionesNormalizadas);
        setEjercicios(ejerciciosData);
        
        if (planData.fechaInicio) {
          const fechaInicioDate = new Date(planData.fechaInicio);
          setFechaInicio(fechaInicioDate);
        }
        
      } catch (e) {
        setError((e as Error).message || 'Error al cargar el plan');
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [planId, navigate, redirectToEdit]);

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
    getEjercicioById
  };
};
