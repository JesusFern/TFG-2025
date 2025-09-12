import { useState, useCallback } from 'react';
import trainingService from '../services/trainingService';
import type { EjercicioSesion, SesionInfo } from '../types/trainingCommon';

interface SesionUpdateResponse {
  message: string;
  sesion: {
    _id: string;
    fecha: string;
    tipoEntrenamiento: string;
    duracion: number;
    ejercicios: EjercicioSesion[];
    [key: string]: unknown;
  };
}

interface UseExerciseSessionHandlersProps {
  currentSesionInfo: SesionInfo | null;
  activeTab: string | null;
  setPublishLoading: (loading: boolean) => void;
  setCurrentSesionLocal: (sesion: SesionInfo | null) => void;
  setEjerciciosSesionActual: (ejercicios: EjercicioSesion[]) => void;
  setForceUpdate: (fn: (prev: number) => number) => void;
  setSuccessMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  refetch: () => Promise<void>;
}

export const useExerciseSessionHandlers = ({
  currentSesionInfo,
  activeTab,
  setPublishLoading,
  setCurrentSesionLocal,
  setEjerciciosSesionActual,
  setForceUpdate,
  setSuccessMessage,
  setError,
  refetch
}: UseExerciseSessionHandlersProps) => {
  const [ejercicioAEliminar, setEjercicioAEliminar] = useState<number | null>(null);
  const [ejercicioAEditar, setEjercicioAEditar] = useState<number | null>(null);
  const [ejercicioEditando, setEjercicioEditando] = useState<EjercicioSesion | null>(null);

  // Función para preparar datos de actualización de sesión
  const prepareSessionUpdateData = useCallback((ejercicios: EjercicioSesion[]) => {
    if (!currentSesionInfo?.data) return null;
    
    const data = currentSesionInfo.data as {
      fecha: string;
      tipoEntrenamiento: string;
      duracion: number;
      ejercicios?: EjercicioSesion[];
      [key: string]: unknown;
    };
    
    return {
      fecha: data.fecha,
      tipoEntrenamiento: data.tipoEntrenamiento,
      duracion: data.duracion,
      ejercicios
    };
  }, [currentSesionInfo]);

  // Función para actualizar el estado local después de una actualización
  const updateLocalState = useCallback((sesionActualizada: SesionUpdateResponse['sesion']) => {
    if (!currentSesionInfo) return;
    
    const sesionActualizadaLocal = {
      ...currentSesionInfo,
      data: {
        ...(currentSesionInfo.data as Record<string, unknown>),
        ...sesionActualizada
      }
    };
    setCurrentSesionLocal(sesionActualizadaLocal);
    setEjerciciosSesionActual(sesionActualizada.ejercicios || (currentSesionInfo.data as { ejercicios?: EjercicioSesion[] })?.ejercicios || []);
  }, [currentSesionInfo, setCurrentSesionLocal, setEjerciciosSesionActual]);

  // Función para manejar la respuesta de actualización
  const handleUpdateResponse = useCallback(async (response: unknown) => {
    const sesionActualizada = (response as unknown as SesionUpdateResponse).sesion || response;
    updateLocalState(sesionActualizada);
    await refetch();
    setForceUpdate(prev => prev + 1);
  }, [updateLocalState, refetch, setForceUpdate]);

  // Función para mostrar mensaje de éxito
  const showSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, [setSuccessMessage]);

  // Función para manejar errores
  const handleError = useCallback((err: unknown, defaultMessage: string) => {
    setError(err instanceof Error ? err.message : defaultMessage);
  }, [setError]);

  // Agregar ejercicio
  const handleAddEjercicio = useCallback(async (ejercicioData: EjercicioSesion) => {
    if (!currentSesionInfo || !activeTab || !currentSesionInfo.data) return;
    
    const data = currentSesionInfo.data as { _id: string; ejercicios?: EjercicioSesion[]; [key: string]: unknown };
    if (!data._id) return;
    
    try {
      setPublishLoading(true);
      
      const nuevoEjercicio = {
        ejercicio: ejercicioData.ejercicio,
        orden: ejercicioData.orden,
        series: ejercicioData.series,
        repeticiones: ejercicioData.repeticiones,
        peso: ejercicioData.peso,
        tiempoDescanso: ejercicioData.tiempoDescanso,
        ejerciciosAlternativos: ejercicioData.ejerciciosAlternativos,
        opcionesProgresion: ejercicioData.opcionesProgresion
      };
      
      const ejerciciosActualizados = [...(data.ejercicios || []), nuevoEjercicio];
      const datosActualizacion = prepareSessionUpdateData(ejerciciosActualizados);
      
      if (!datosActualizacion) return;
      
      const response = await trainingService.actualizarSesion(data._id, datosActualizacion);
      await handleUpdateResponse(response);
      showSuccessMessage("Ejercicio agregado y guardado en la sesión");
    } catch (err) {
      handleError(err, 'Error al agregar el ejercicio');
    } finally {
      setPublishLoading(false);
    }
  }, [currentSesionInfo, activeTab, setPublishLoading, prepareSessionUpdateData, handleUpdateResponse, showSuccessMessage, handleError]);

  // Editar ejercicio
  const handleEditarEjercicio = useCallback((ejercicioIndex: number) => {
    if (!currentSesionInfo?.data) return;
    
    const data = currentSesionInfo.data as { ejercicios?: EjercicioSesion[]; [key: string]: unknown };
    if (!data.ejercicios) return;
    
    const ejercicio = data.ejercicios[ejercicioIndex];
    setEjercicioEditando({
      ejercicio: ejercicio.ejercicio,
      orden: ejercicio.orden,
      series: ejercicio.series,
      repeticiones: ejercicio.repeticiones,
      peso: ejercicio.peso,
      tiempoDescanso: ejercicio.tiempoDescanso,
      ejerciciosAlternativos: ejercicio.ejerciciosAlternativos || [],
      opcionesProgresion: ejercicio.opcionesProgresion || {
        aumentarPeso: false,
        masRepeticiones: false,
        mayorIntensidad: false
      }
    });
    setEjercicioAEditar(ejercicioIndex);
  }, [currentSesionInfo]);

  // Guardar ejercicio editado
  const handleGuardarEjercicioEditado = useCallback(async (ejercicioEditado: EjercicioSesion) => {
    if (!currentSesionInfo?.data || ejercicioAEditar === null || !ejercicioEditado) return;

    const data = currentSesionInfo.data as { _id: string; ejercicios?: EjercicioSesion[]; [key: string]: unknown };
    if (!data._id) return;

    try {
      setPublishLoading(true);
      
      const ejerciciosActualizados = [...(data.ejercicios || [])];
      ejerciciosActualizados[ejercicioAEditar] = {
        ...ejerciciosActualizados[ejercicioAEditar],
        ...ejercicioEditado
      };

      const datosActualizacion = prepareSessionUpdateData(ejerciciosActualizados);
      if (!datosActualizacion) return;
      
      const response = await trainingService.actualizarSesion(data._id, datosActualizacion);
      await handleUpdateResponse(response);
      showSuccessMessage("Ejercicio actualizado correctamente");
      
      setEjercicioAEditar(null);
      setEjercicioEditando(null);
    } catch (err) {
      handleError(err, 'Error al actualizar el ejercicio');
    } finally {
      setPublishLoading(false);
    }
  }, [currentSesionInfo, ejercicioAEditar, setPublishLoading, prepareSessionUpdateData, handleUpdateResponse, showSuccessMessage, handleError]);

  // Eliminar ejercicio
  const handleEliminarEjercicio = useCallback(async (ejercicioIndex: number) => {
    if (!currentSesionInfo || !currentSesionInfo.data) return;
    
    const data = currentSesionInfo.data as { _id: string; ejercicios?: EjercicioSesion[]; [key: string]: unknown };
    if (!data._id) return;
    
    try {
      setPublishLoading(true);
      
      const ejerciciosActualizados = (data.ejercicios || []).filter((_: EjercicioSesion, index: number) => index !== ejercicioIndex);
      const ejerciciosReordenados = ejerciciosActualizados.map((ejercicio: EjercicioSesion, index: number) => ({
        ...ejercicio,
        orden: index + 1
      }));
      
      const datosActualizacion = prepareSessionUpdateData(ejerciciosReordenados);
      if (!datosActualizacion) return;
      
      const response = await trainingService.actualizarSesion(data._id, datosActualizacion);
      await handleUpdateResponse(response);
      showSuccessMessage("Ejercicio eliminado de la sesión");
    } catch (err) {
      handleError(err, 'Error al eliminar el ejercicio');
    } finally {
      setPublishLoading(false);
    }
  }, [currentSesionInfo, setPublishLoading, prepareSessionUpdateData, handleUpdateResponse, showSuccessMessage, handleError]);

  // Confirmar eliminación
  const handleConfirmarEliminarEjercicio = useCallback(() => {
    if (ejercicioAEliminar === null) return;
    handleEliminarEjercicio(ejercicioAEliminar);
    setEjercicioAEliminar(null);
  }, [ejercicioAEliminar, handleEliminarEjercicio]);

  // Cancelar edición
  const handleCancelarEdicion = useCallback(() => {
    setEjercicioAEditar(null);
    setEjercicioEditando(null);
  }, []);

  // Abrir modal de ejercicios
  const handleOpenEjerciciosModal = useCallback((setEjerciciosSesion: (ejercicios: EjercicioSesion[]) => void, setShowEjerciciosModal: (show: boolean) => void) => {
    if (currentSesionInfo?.data) {
      const data = currentSesionInfo.data as { ejercicios?: EjercicioSesion[]; [key: string]: unknown };
      if (data.ejercicios) {
        setEjerciciosSesion(data.ejercicios);
      } else {
        setEjerciciosSesion([]);
      }
    } else {
      setEjerciciosSesion([]);
    }
    setShowEjerciciosModal(true);
  }, [currentSesionInfo]);

  // Ejercicio creado
  const handleEjercicioCreado = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    // Estados
    ejercicioAEliminar,
    setEjercicioAEliminar,
    ejercicioAEditar,
    setEjercicioAEditar,
    ejercicioEditando,
    setEjercicioEditando,
    
    // Handlers
    handleAddEjercicio,
    handleEditarEjercicio,
    handleGuardarEjercicioEditado,
    handleEliminarEjercicio,
    handleConfirmarEliminarEjercicio,
    handleCancelarEdicion,
    handleOpenEjerciciosModal,
    handleEjercicioCreado
  };
};
