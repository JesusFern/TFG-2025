import { useNavigate } from 'react-router-dom';
import trainingService from '../services/trainingService';
import type { PlanEntrenamiento, SesionPlan } from '../types/training';

interface EjercicioSesion {
  ejercicio: string;
  orden: number;
  series: number;
  repeticiones: number;
  peso?: number;
  tiempoDescanso: number;
  ejerciciosAlternativos?: string[];
  opcionesProgresion?: {
    aumentarPeso: boolean;
    masRepeticiones: boolean;
    mayorIntensidad: boolean;
  };
}

interface UseTrainingOperationsProps {
  planId: string;
  plan: PlanEntrenamiento | null;
  sesiones: SesionPlan[];
  setSesiones: (sesiones: SesionPlan[]) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  refreshSesiones: () => void;
  setActiveTab: (tab: string | null) => void;
  setCurrentSesionLocal: (sesion: any) => void;
}

export const useTrainingOperations = ({
  planId,
  plan,
  sesiones,
  setSesiones,
  setError,
  setSuccessMessage,
  refreshSesiones,
  setActiveTab,
  setCurrentSesionLocal
}: UseTrainingOperationsProps) => {
  const navigate = useNavigate();

  const handleCrearEjercicio = async (ejercicioData: any) => {
    try {
      const response = await trainingService.crearEjercicio(ejercicioData);
      const ejercicioCreado = response;
      
      setSuccessMessage('Ejercicio creado correctamente');
      return ejercicioCreado;
    } catch (error) {
      setError('Error al crear ejercicio: ' + (error as Error).message);
      throw error;
    }
  };

  const handleAddEjercicio = async (sesionId: string, ejercicioData: EjercicioSesion) => {
    try {
      const sesionActual = sesiones.find(s => s._id === sesionId);
      if (!sesionActual) {
        setError('Sesión no encontrada');
        return;
      }

      const nuevosEjercicios = [...sesionActual.ejercicios, ejercicioData];
      
      const response = await trainingService.actualizarSesion(sesionId, {
        ejercicios: nuevosEjercicios
      });

      const sesionActualizada = response;
      setSesiones(sesiones.map(s => s._id === sesionId ? sesionActualizada : s));
      
      setSuccessMessage('Ejercicio agregado correctamente');
      refreshSesiones();
    } catch (error) {
      setError('Error al agregar ejercicio: ' + (error as Error).message);
      throw error;
    }
  };

  const handleEliminarEjercicio = async (sesionId: string, indiceEjercicio: number) => {
    try {
      const sesionActual = sesiones.find(s => s._id === sesionId);
      if (!sesionActual) {
        setError('Sesión no encontrada');
        return;
      }

      const nuevosEjercicios = sesionActual.ejercicios.filter((_, index) => index !== indiceEjercicio);
      
      const ejerciciosReordenados = nuevosEjercicios.map((ejercicio, index) => ({
        ...ejercicio,
        orden: index + 1
      }));

      const response = await trainingService.actualizarSesion(sesionId, {
        ejercicios: ejerciciosReordenados
      });

      const sesionActualizada = response;
      setSesiones(sesiones.map(s => s._id === sesionId ? sesionActualizada : s));
      
      setSuccessMessage('Ejercicio eliminado correctamente');
      refreshSesiones();
    } catch (error) {
      setError('Error al eliminar ejercicio: ' + (error as Error).message);
      throw error;
    }
  };

  const handleEditarEjercicio = async (sesionId: string, indiceEjercicio: number, ejercicioData: EjercicioSesion) => {
    try {
      const sesionActual = sesiones.find(s => s._id === sesionId);
      if (!sesionActual) {
        setError('Sesión no encontrada');
        return;
      }

      const nuevosEjercicios = [...sesionActual.ejercicios];
      nuevosEjercicios[indiceEjercicio] = ejercicioData;

      const response = await trainingService.actualizarSesion(sesionId, {
        ejercicios: nuevosEjercicios
      });

      const sesionActualizada = response;
      setSesiones(sesiones.map(s => s._id === sesionId ? sesionActualizada : s));
      
      setSuccessMessage('Ejercicio editado correctamente');
      refreshSesiones();
    } catch (error) {
      setError('Error al editar ejercicio: ' + (error as Error).message);
      throw error;
    }
  };

  const handleCrearSesion = async (sesionData: any) => {
    try {
      if (!plan || !plan.clientes || plan.clientes.length === 0) {
        setError('No se pudo determinar el cliente del plan');
        return;
      }

      const clientData = plan.clientes[0];
      let clienteId: string;
      
      if (typeof clientData === 'string') {
        clienteId = clientData;
      } else if (typeof clientData === 'object' && clientData !== null) {
        const clientObj = clientData as { _id?: string; id?: string };
        clienteId = clientObj._id || clientObj.id || String(clientData);
      } else {
        clienteId = String(clientData);
      }

      const response = await trainingService.crearSesion({
        ...sesionData,
        clienteId,
        planId
      });

      const nuevaSesion = response.sesion;
      setSesiones([...sesiones, nuevaSesion]);

      const fechaSesion = new Date(nuevaSesion.fecha);
      const fechaInicio = plan.fechaInicio ? new Date(plan.fechaInicio) : new Date();
      const diferenciaDias = Math.floor((fechaSesion.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
      const semanaSesion = Math.floor(diferenciaDias / 7) + 1;

      setSuccessMessage('Sesión creada correctamente');
      refreshSesiones();
      
      return { nuevaSesion, semanaSesion };
    } catch (error) {
      setError('Error al crear sesión: ' + (error as Error).message);
      throw error;
    }
  };

  const handleEditarSesion = async (sesionId: string, sesionData: any) => {
    try {
      const response = await trainingService.actualizarSesion(sesionId, sesionData);
      const sesionActualizada = response;
      
      setSesiones(sesiones.map(s => s._id === sesionId ? sesionActualizada : s));
      setSuccessMessage('Sesión editada correctamente');
      refreshSesiones();
    } catch (error) {
      setError('Error al editar sesión: ' + (error as Error).message);
      throw error;
    }
  };

  const handleEliminarSesion = async (sesionId: string) => {
    try {
      await trainingService.eliminarSesion(sesionId);
      setSesiones(sesiones.filter(s => s._id !== sesionId));
      setActiveTab("0");
      setCurrentSesionLocal(null);
      setSuccessMessage('Sesión eliminada correctamente');
      refreshSesiones();
    } catch (error) {
      setError('Error al eliminar sesión: ' + (error as Error).message);
      throw error;
    }
  };

  const handlePublicarPlan = async () => {
    try {
      if (!plan) return;
      
      if (plan._id) {
        await trainingService.publicarPlan(plan._id);
      }
      setSuccessMessage('Plan publicado correctamente');
      
      setTimeout(() => {
        navigate(`/training/planes/${plan._id}`);
      }, 1000);
    } catch (error) {
      setError('Error al publicar plan: ' + (error as Error).message);
      throw error;
    }
  };

  return {
    handleCrearEjercicio,
    handleAddEjercicio,
    handleEliminarEjercicio,
    handleEditarEjercicio,
    handleCrearSesion,
    handleEditarSesion,
    handleEliminarSesion,
    handlePublicarPlan
  };
};
