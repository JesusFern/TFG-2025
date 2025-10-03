import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

interface UseProgressStatsOptions<T, W, P = unknown> {
  loadGeneralStats: () => Promise<T | null>;
  loadWeeklyStats: (semana: number, año: number) => Promise<W | null>;
  loadProgressStats?: () => Promise<P | null>;
}

export const useProgressStats = <T, W = unknown, P = unknown>({
  loadGeneralStats,
  loadWeeklyStats,
  loadProgressStats
}: UseProgressStatsOptions<T, W, P>) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<T | null>(null);
  const [estadisticasSemanal, setEstadisticasSemanal] = useState<W | null>(null);
  const [progresoStats, setProgresoStats] = useState<P | null>(null);

  // Usar refs para mantener las referencias a las funciones sin que cambien
  const loadGeneralStatsRef = useRef(loadGeneralStats);
  const loadWeeklyStatsRef = useRef(loadWeeklyStats);
  const loadProgressStatsRef = useRef(loadProgressStats);

  // Actualizar las referencias cuando cambien las funciones
  useEffect(() => {
    loadGeneralStatsRef.current = loadGeneralStats;
    loadWeeklyStatsRef.current = loadWeeklyStats;
    loadProgressStatsRef.current = loadProgressStats;
  }, [loadGeneralStats, loadWeeklyStats, loadProgressStats]);

  const cargarEstadisticas = useCallback(async (semanaSeleccionada: number, añoSeleccionado: number) => {
    try {
      console.log('Hook useProgressStats: Iniciando carga de estadísticas', { semanaSeleccionada, añoSeleccionado });
      setLoading(true);
      setError(null);

      // Cargar estadísticas generales
      try {
        console.log('Hook useProgressStats: Cargando estadísticas generales...');
        const responseGeneral = await loadGeneralStatsRef.current();
        console.log('Hook useProgressStats: Respuesta general recibida:', responseGeneral);
        if (responseGeneral) {
          setEstadisticas(responseGeneral);
        }
      } catch (err) {
        console.warn('No se pudieron cargar las estadísticas generales:', err);
      }

      // Cargar estadísticas semanales
      try {
        console.log('Hook useProgressStats: Cargando estadísticas semanales...');
        const responseSemanal = await loadWeeklyStatsRef.current(semanaSeleccionada, añoSeleccionado);
        console.log('Hook useProgressStats: Datos semanales recibidos:', responseSemanal);
        if (responseSemanal) {
          setEstadisticasSemanal(responseSemanal);
        }
      } catch (err) {
        console.warn('No se pudieron cargar las estadísticas semanales:', err);
      }

      // Cargar progreso específico (opcional)
      if (loadProgressStatsRef.current) {
        try {
          const responseProgreso = await loadProgressStatsRef.current();
          if (responseProgreso) {
            setProgresoStats(responseProgreso);
          }
        } catch (err) {
          console.warn('No se pudo cargar el progreso específico:', err);
        }
      }

    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error('Error cargando estadísticas:', err);
    } finally {
      console.log('Hook useProgressStats: Finalizando carga de estadísticas');
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    loading,
    error,
    estadisticas,
    estadisticasSemanal,
    progresoStats,
    cargarEstadisticas
  }), [loading, error, estadisticas, estadisticasSemanal, progresoStats, cargarEstadisticas]);
};
