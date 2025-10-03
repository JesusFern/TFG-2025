import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { ValoracionService } from '../services/valoracionService';

interface UseWorkerRatingProps {
  workerId: string;
  enabled?: boolean;
}

interface UseWorkerRatingReturn {
  satisfactionRating: number | null;
  loading: boolean;
  error: string | null;
  refreshRating: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useWorkerRating = ({
  workerId,
  enabled = true
}: UseWorkerRatingProps): UseWorkerRatingReturn => {
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const hasLoadedRef = useRef(false);

  const cargarRating = useCallback(async () => {
    if (!enabled || !workerId) return;
    
    try {
      setError(null);

      // Cargar estadísticas del trabajador para obtener la calificación promedio
      const estadisticasResponse = await ValoracionService.obtenerEstadisticas({
        trabajadorId: workerId
      });
      
      setSatisfactionRating(estadisticasResponse.calificacionPromedio || null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la calificación');
    } finally {
      setLoading(false);
    }
  }, [enabled, workerId]);

  const refreshRating = useCallback(async () => {
    await cargarRating();
  }, [cargarRating]);

  // Usar el hook de socket con eventos de calificaciones
  useSocket({
    onWorkerRatingUpdated: (data: { workerId: string; rating: unknown; timestamp: Date }) => {
      // Solo actualizar si es para el trabajador actual
      if (data.workerId === workerId) {
        const rating = data.rating as { satisfactionRating?: number; totalValoraciones?: number };
        if (rating.satisfactionRating !== undefined) {
          setSatisfactionRating(rating.satisfactionRating);
          setLastUpdated(new Date());
        }
      }
    }
  });

  // Cargar rating inicial
  useEffect(() => {
    if (enabled && workerId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      cargarRating();
    }
  }, [enabled, workerId, cargarRating]);

  return {
    satisfactionRating,
    loading,
    error,
    refreshRating,
    lastUpdated
  };
};
