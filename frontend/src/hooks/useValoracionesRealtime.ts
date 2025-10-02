import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { ValoracionService } from '../services/valoracionService';
import { 
  Valoracion, 
  EstadisticasValoraciones, 
  EstadisticasValoracionesPorTipo 
} from '../types/valoraciones';

interface UseValoracionesRealtimeProps {
  workerId: string;
  enabled?: boolean;
}

interface UseValoracionesRealtimeReturn {
  valoraciones: Valoracion[];
  estadisticas: EstadisticasValoraciones | null;
  estadisticasPorTipo: EstadisticasValoracionesPorTipo[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useValoracionesRealtime = ({
  workerId,
  enabled = true
}: UseValoracionesRealtimeProps): UseValoracionesRealtimeReturn => {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasValoraciones | null>(null);
  const [estadisticasPorTipo, setEstadisticasPorTipo] = useState<EstadisticasValoracionesPorTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const hasLoadedRef = useRef(false);

  const cargarDatos = useCallback(async () => {
    if (!enabled || !workerId) return;
    
    try {
      setError(null);

      // Cargar valoraciones del trabajador
      const valoracionesResponse = await ValoracionService.obtenerValoracionesPorTrabajador(
        workerId,
        { activa: true }
      );
      setValoraciones(valoracionesResponse.data);

      // Cargar estadísticas generales
      const estadisticasResponse = await ValoracionService.obtenerEstadisticas({
        trabajadorId: workerId
      });
      setEstadisticas(estadisticasResponse);

      // Cargar estadísticas por tipo
      const estadisticasPorTipoResponse = await ValoracionService.obtenerEstadisticasPorTipo(workerId);
      setEstadisticasPorTipo(estadisticasPorTipoResponse);

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las valoraciones');
    } finally {
      setLoading(false);
    }
  }, [enabled, workerId]);

  const refreshData = useCallback(async () => {
    await cargarDatos();
  }, [cargarDatos]);

  // Usar el hook de socket con eventos de valoraciones
  useSocket({
    onValoracionUpdated: (data: { valoracion: unknown; timestamp: Date }) => {
      // Solo actualizar si es para el trabajador actual
      const valoracion = data.valoracion as Valoracion;
      if (valoracion.trabajador && valoracion.trabajador.toString() === workerId) {
        setValoraciones(prev => {
          // Verificar si ya existe la valoración
          const exists = prev.some(v => v._id === valoracion._id);
          if (exists) {
            // Actualizar valoración existente
            return prev.map(v => v._id === valoracion._id ? valoracion : v);
          } else {
            // Agregar nueva valoración al inicio
            return [valoracion, ...prev];
          }
        });
        setLastUpdated(new Date());
      }
    },
    onValoracionStatsUpdated: (data: { estadisticas: unknown; timestamp: Date }) => {
      // Actualizar estadísticas (se asume que son para el trabajador actual)
      const stats = data.estadisticas as EstadisticasValoraciones;
      setEstadisticas(stats);
      setLastUpdated(new Date());
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (enabled && workerId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      cargarDatos();
    }
  }, [enabled, workerId, cargarDatos]);

  return {
    valoraciones,
    estadisticas,
    estadisticasPorTipo,
    loading,
    error,
    refreshData,
    lastUpdated
  };
};

export default useValoracionesRealtime;