import React, { useEffect, useCallback } from 'react';
import { 
  Stack, 
  Divider
} from '@mantine/core';
import { estadisticasNutricionalesService } from '../../services/estadisticasNutricionalesService';
import { 
  EstadisticasNutricionalesSemanal
} from '../../types/estadisticasNutricionales';
import EmptyProgresoNutricionalState from './EmptyProgresoNutricionalState';
import WeekPanel from './shared/WeekPanel';
import HistorialSelector from './shared/HistorialSelector';
import { LoadingState, ErrorState } from './shared/LoadingErrorStates';
import EstadisticasGeneralesGrid from './shared/EstadisticasGeneralesGrid';
import EstadisticasSemanalesGrid from './shared/EstadisticasSemanalesGrid';
import PlatosFavoritosGrid from './shared/PlatosFavoritosGrid';
import { useProgressTab } from '../../hooks/useProgressTab';
import { useProgressStats } from '../../hooks/useProgressStats';

// Tipo extendido para manejar la diferencia entre frontend y backend
interface EstadisticasSemanalBackend extends Omit<EstadisticasNutricionalesSemanal, 'tendencias'> {
  progreso: {
    porcentajeCompletitud: number;
    comidasRegistradas: number;
    comidasPlanificadas: number;
    promedioSatisfaccion: number;
    promedioCumplimiento: number;
  };
  asistencia: {
    comidasConsumidas: number;
    comidasOmitidas: number;
    comidasParciales: number;
    porcentajeAsistencia: number;
  };
  tendencias: {
    satisfaccion: string;
    cumplimiento: string;
  };
}


// Tipo para la respuesta del backend
interface BackendProgresoComidas {
  comidas: Array<{
    nombre: string;
    satisfaccionPromedio: number;
    cumplimientoPromedio: number;
    vecesConsumida: number;
    ultimaConsumida: string | null;
  }>;
  total: number;
  pagina: number;
  totalPaginas: number;
}

const ProgresoNutricionTab: React.FC = () => {

  const {
    getCurrentWeekNumber,
    semanaSeleccionada,
    añoSeleccionado,
    mostrarHistorial,
    isCurrentWeek,
    setSemanaSeleccionada,
    setAñoSeleccionado,
    setMostrarHistorial,
    handleVolverActual
  } = useProgressTab();

  // Funciones memoizadas para evitar bucles infinitos
  const loadGeneralStats = useCallback(async () => {
    const response = await estadisticasNutricionalesService.getMiProgresoNutricional();
    return response.success && response.estadisticas ? response.estadisticas : null;
  }, []);

  const loadWeeklyStats = useCallback(async (semana: number, año: number) => {
    const response = await estadisticasNutricionalesService.getMiProgresoNutricionalSemanal(semana, año);
    console.log('Respuesta de estadísticas semanales:', response);
    if (response.success && response.estadisticas) {
      console.log('Datos recibidos del backend:', response.estadisticas);
      return response.estadisticas as EstadisticasSemanalBackend;
    }
    return null;
  }, []);

  const loadProgressStats = useCallback(async () => {
    const response = await estadisticasNutricionalesService.getMiProgresoComidas();
    console.log('Respuesta de getMiProgresoComidas:', response);
    if (response.success && response.progreso) {
      // El backend devuelve { comidas: [...], total: ..., pagina: ..., totalPaginas: ... }
      // Necesitamos extraer el array de comidas
      const backendData = response.progreso as unknown as BackendProgresoComidas;
      if (backendData.comidas && Array.isArray(backendData.comidas)) {
        // Transformar los datos del backend al formato esperado por el frontend
        return backendData.comidas.map((comida) => ({
          comidaId: comida.nombre, // Usar el nombre como ID temporal
          nombreComida: comida.nombre,
          nombreDieta: 'Dieta General', // Valor por defecto
          estadisticas: {
            totalRegistros: comida.vecesConsumida,
            satisfaccionPromedio: comida.satisfaccionPromedio,
            cumplimientoPromedio: comida.cumplimientoPromedio,
            tendenciaSatisfaccion: 'estable' as const // Valor por defecto
          }
        }));
      }
    }
    return null;
  }, []);

  // Hook para manejar estadísticas
  const {
    loading,
    error,
    estadisticas,
    estadisticasSemanal,
    progresoStats: progresoComidas,
    cargarEstadisticas
  } = useProgressStats({
    loadGeneralStats,
    loadWeeklyStats,
    loadProgressStats
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarEstadisticas(semanaSeleccionada, añoSeleccionado);
  }, [semanaSeleccionada, añoSeleccionado, cargarEstadisticas]);

  // Log para debuggear los datos recibidos
  useEffect(() => {
    console.log('Datos en ProgresoNutricionTab:', {
      estadisticasSemanal,
      progresoComidas,
      loading,
      error
    });
    
    if (estadisticasSemanal) {
      console.log('Estadísticas semanales recibidas:', estadisticasSemanal);
    }
    
    if (progresoComidas) {
      console.log('Progreso comidas recibido:', progresoComidas);
    }
  }, [estadisticasSemanal, progresoComidas, loading, error]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => cargarEstadisticas(semanaSeleccionada, añoSeleccionado)}
        emptyStateComponent={<EmptyProgresoNutricionalState onRetry={() => cargarEstadisticas(semanaSeleccionada, añoSeleccionado)} />}
      />
    );
  }

  return (
    <Stack gap="xl">
      {/* Panel de información de la semana */}
      <WeekPanel
        semanaSeleccionada={semanaSeleccionada}
        añoSeleccionado={añoSeleccionado}
        isCurrentWeek={isCurrentWeek}
        onRefresh={() => cargarEstadisticas(semanaSeleccionada, añoSeleccionado)}
        onToggleHistorial={() => setMostrarHistorial(!mostrarHistorial)}
        mostrarHistorial={mostrarHistorial}
        color="green"
      />
        
      {/* Selectores de historial (solo cuando se muestre) */}
      {mostrarHistorial && (
        <HistorialSelector
          semanaSeleccionada={semanaSeleccionada}
          añoSeleccionado={añoSeleccionado}
          onSemanaChange={setSemanaSeleccionada}
          onAñoChange={setAñoSeleccionado}
          onVolverActual={handleVolverActual}
          getCurrentWeekNumber={getCurrentWeekNumber}
        />
      )}

      {/* Estadísticas Generales */}
      {estadisticas && (
        <EstadisticasGeneralesGrid 
          estadisticas={estadisticas} 
        />
      )}

      {/* Estadísticas Semanales */}
      {estadisticasSemanal && (
        <>
          <Divider my="md" />
          <EstadisticasSemanalesGrid 
            estadisticasSemanal={estadisticasSemanal} 
          />
        </>
      )}

      {/* Platos Favoritos */}
      {progresoComidas && progresoComidas.length > 0 && (
        <>
          <Divider my="md" />
          <PlatosFavoritosGrid 
            progresoComidas={progresoComidas}
          />
        </>
      )}
    </Stack>
  );
};

export default ProgresoNutricionTab;
