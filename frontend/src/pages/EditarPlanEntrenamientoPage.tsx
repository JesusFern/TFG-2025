import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Paper, 
  Tabs, 
  Button, 
  Group, 
  Text, 
  Alert, 
  Box,
  Loader,
  Pagination,
  Select,
  Modal,
  ActionIcon,
  Stack,
  Divider,
  Badge,
  Title
} from '@mantine/core';
import { useParams, useLocation } from 'react-router-dom';
import { 
  IconBarbell,
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
// format y es ya no se usan directamente, se usan a través de las utilidades
import trainingService from '../services/trainingService';
import { SesionPlan } from '../types/training';
import { useTrainingData } from '../hooks/useTrainingData';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { useNavigation } from '../hooks/useNavigation';
import { DIAS_SEMANA } from '../constants/training';
import { formatDateWithLocale, formatDateLong, getWeekStartDate, getWeekEndDate } from '../utils/trainingUtils';
import type { SesionInfo, EjercicioSesion } from '../types/trainingCommon';
import ModalGestionarEjercicios from '../components/molecules/ModalGestionarEjercicios';
import ModalEditarEjercicioSesion from '../components/molecules/ModalEditarEjercicioSesion';
import ModalEditarSesion from '../components/molecules/ModalEditarSesion';
import ModalEliminarSesion from '../components/molecules/ModalEliminarSesion';
import ModalCrearSesion from '../components/molecules/ModalCrearSesion';
import EditarPlanHeader from '../components/molecules/EditarPlanHeader';
import PlanInfo from '../components/molecules/PlanInfo';

// SesionInfo ya está importado desde trainingCommon

interface SesionUpdateResponse {
  message: string;
  sesion: SesionPlan;
}


const EditarPlanEntrenamientoPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const location = useLocation();
  const isDark = useThemeDetection();
  const { navigateToPlansList, navigateToPlanView } = useNavigation();
  
  // Usar el hook refactorizado para cargar datos
  const {
    plan,
    sesiones,
    ejercicios,
    loading,
    error,
    fechaInicio,
    setError,
    refetch
  } = useTrainingData({ 
    planId, 
    options: { redirectToView: true, loadExercises: true } 
  });
  
  const [activeTab, setActiveTab] = useState<string | null>("0");
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  
  
  const [showEjerciciosModal, setShowEjerciciosModal] = useState<boolean>(false);
  const [ejerciciosSesion, setEjerciciosSesion] = useState<EjercicioSesion[]>([]);
  
  const [forceUpdate, setForceUpdate] = useState(0);
  const [currentSesionLocal, setCurrentSesionLocal] = useState<SesionInfo | null>(null);
  const [ejerciciosSesionActual, setEjerciciosSesionActual] = useState<EjercicioSesion[]>([]);
  
  const [ejercicioAEliminar, setEjercicioAEliminar] = useState<number | null>(null);
  const [ejercicioAEditar, setEjercicioAEditar] = useState<number | null>(null);
  const [ejercicioEditando, setEjercicioEditando] = useState<EjercicioSesion | null>(null);

  const [sesionAEditar, setSesionAEditar] = useState<string | null>(null);
  const [sesionEditando, setSesionEditando] = useState<{
    fecha: string;
    hora?: string;
    tipoEntrenamiento: string;
    duracion: number;
    notas?: string;
  } | null>(null);

  const [sesionAEliminar, setSesionAEliminar] = useState<string | null>(null);
  const [showCrearSesionModal, setShowCrearSesionModal] = useState(false);
  const [fechaSesionACrear, setFechaSesionACrear] = useState<string>('');

  const sesionesRange = useMemo(() => {
    if (!plan || !fechaInicio) return { sesiones: [], totalWeeks: 0 };
    
    const sesionesFiltradas = sesiones.filter(sesion => {
      const sesionFecha = new Date(sesion.fecha);
      const diaSemana = sesionFecha.getDay();
      return plan.diasSemana.includes(diaSemana);
    });

    sesionesFiltradas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    const totalWeeks = Math.ceil(plan.duracionDias / 7);
    
    const weekStartDate = getWeekStartDate(fechaInicio, currentWeek);
    const weekEndDate = getWeekEndDate(weekStartDate);
    
    const sesionesDeLaSemana = sesionesFiltradas.filter(sesion => {
      const sesionFecha = new Date(sesion.fecha);
      return sesionFecha >= weekStartDate && sesionFecha <= weekEndDate;
    });
    
    const sesionesInfo: SesionInfo[] = [];
    
    for (let i = 0; i < 7; i++) {
      const fechaDelDia = new Date(weekStartDate);
      fechaDelDia.setDate(fechaDelDia.getDate() + i);
      
      // Buscar sesión para este día
      const sesionDelDia = sesionesDeLaSemana.find(sesion => {
        const sesionFecha = new Date(sesion.fecha);
        return sesionFecha.toDateString() === fechaDelDia.toDateString();
      });
      
      sesionesInfo.push({
        weekDayIndex: i,
        sesionIndex: i,
        weekDayName: DIAS_SEMANA[i],
        fecha: fechaDelDia,
        fechaFormateada: formatDateWithLocale(fechaDelDia),
        nombreCompleto: `${DIAS_SEMANA[i]} ${formatDateWithLocale(fechaDelDia)}`,
        data: sesionDelDia || null
      });
    }
    
    return { sesiones: sesionesInfo, totalWeeks };
  }, [plan, currentWeek, sesiones, fechaInicio]);

  // Procesar parámetros de URL (sesión seleccionada) cuando los datos estén cargados
  useEffect(() => {
    if (plan && sesiones.length > 0) {
      const sesionParam = new URLSearchParams(location.search).get('sesion');
      if (sesionParam) {
        const sesionIndex = parseInt(sesionParam) - 1;
        if (sesionIndex >= 0 && sesionIndex < sesiones.length) {
          const targetWeek = Math.ceil((sesionIndex + 1) / 7);
          setCurrentWeek(targetWeek);
          setActiveTab(sesionIndex.toString());
        }
      }
    }
  }, [plan, sesiones.length, location.search]);

  useEffect(() => {
    if (sesionesRange.sesiones.length > 0 && (activeTab === null || !sesionesRange.sesiones.some(sesion => sesion.weekDayIndex.toString() === activeTab))) {
      const primeraSesionConDatos = sesionesRange.sesiones.find(sesion => sesion.data !== null);
      if (primeraSesionConDatos) {
        setActiveTab(primeraSesionConDatos.weekDayIndex.toString());
      } else {
        setActiveTab(sesionesRange.sesiones[0].weekDayIndex.toString());
      }
    }
  }, [sesionesRange.sesiones, activeTab]);


  
  const handleTabChange = (newTabValue: string | null) => {
    if (newTabValue === activeTab) return;
    setActiveTab(newTabValue);
    setCurrentSesionLocal(null);
    setEjerciciosSesionActual([]);
  };

  const handleWeekChange = (newWeek: number) => {
    setCurrentWeek(newWeek);
    
    setActiveTab(null);
    setCurrentSesionLocal(null);
    setEjerciciosSesionActual([]);
  };

  const currentSesionInfo = useMemo(() => {
    if (!activeTab || !sesionesRange.sesiones.length) return null;
    
    const currentSesionIndex = parseInt(activeTab);
    const sesionFromRange = sesionesRange.sesiones.find(sesion => sesion.weekDayIndex === currentSesionIndex) || null;
    
    if (currentSesionLocal && currentSesionLocal.weekDayIndex === currentSesionIndex) {
      return currentSesionLocal;
    }
    
    if (sesionFromRange && ejerciciosSesionActual.length > 0) {
      const sesionConEjerciciosLocales = {
        ...sesionFromRange,
        data: {
          ...sesionFromRange.data,
          ejercicios: ejerciciosSesionActual
        }
      };
      return sesionConEjerciciosLocales;
    }
    
    return sesionFromRange;
  }, [activeTab, sesionesRange.sesiones, currentSesionLocal, ejerciciosSesionActual]);

  const fechaInicioFormateada = useMemo(() => {
    if (!plan?.fechaInicio) return "";
    return formatDateLong(new Date(plan.fechaInicio));
  }, [plan?.fechaInicio]);

  // Inicializar ejercicios locales cuando cambie la sesión activa
  useEffect(() => {
    if (currentSesionInfo && currentSesionInfo.data?.ejercicios) {
      setEjerciciosSesionActual(currentSesionInfo.data.ejercicios);
    }
  }, [currentSesionInfo]);

  // Funciones para manejar ejercicios
  const handleAddEjercicio = async (ejercicioData: EjercicioSesion) => {
    if (!currentSesionInfo || !activeTab || !currentSesionInfo.data?._id) return;
    
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
      
      // Crear la nueva lista de ejercicios
      const ejerciciosActualizados = [...(currentSesionInfo.data?.ejercicios || []), nuevoEjercicio];
      
      // Preparar los datos de actualización incluyendo todos los campos requeridos
      const datosActualizacion = {
        fecha: currentSesionInfo.data.fecha,
        tipoEntrenamiento: currentSesionInfo.data.tipoEntrenamiento,
        duracion: currentSesionInfo.data.duracion,
        ejercicios: ejerciciosActualizados
      };
      
      
      const response = await trainingService.actualizarSesion(currentSesionInfo.data._id, datosActualizacion);
      
      const sesionActualizada = (response as unknown as SesionUpdateResponse).sesion || response;
      
      if (currentSesionInfo) {
        const sesionActualizadaLocal = {
          ...currentSesionInfo,
          data: {
            ...currentSesionInfo.data,
            ...sesionActualizada
          }
        };
        setCurrentSesionLocal(sesionActualizadaLocal);
        
        setEjerciciosSesionActual(sesionActualizada.ejercicios || currentSesionInfo.data?.ejercicios || []);
      }
      
      // Recargar datos después de actualizar sesión
      await refetch();
      
      setForceUpdate(prev => prev + 1);
      
      setSuccessMessage("Ejercicio agregado y guardado en la sesión");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar el ejercicio');
    } finally {
      setPublishLoading(false);
    }
  };


  const handleOpenEjerciciosModal = () => {
    if (currentSesionInfo?.data?.ejercicios) {
      setEjerciciosSesion(currentSesionInfo.data.ejercicios);
    } else {
      setEjerciciosSesion([]);
    }
    setShowEjerciciosModal(true);
  };

  const handleEjercicioCreado = async () => {
    // Recargar datos después de crear ejercicio
    await refetch();
  };

  const handleConfirmarEliminarEjercicio = () => {
    if (ejercicioAEliminar === null) return;
    eliminarEjercicio(ejercicioAEliminar);
    setEjercicioAEliminar(null);
  };

  const handleEditarEjercicio = (ejercicioIndex: number) => {
    if (!currentSesionInfo?.data?.ejercicios) return;
    
    const ejercicio = currentSesionInfo.data.ejercicios[ejercicioIndex];
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
  };

  const handleGuardarEjercicioEditado = async (ejercicioEditado: typeof ejercicioEditando) => {
    if (!currentSesionInfo?.data || !currentSesionInfo.data._id || ejercicioAEditar === null || !ejercicioEditado) return;

    try {
      setPublishLoading(true);
      
      const ejerciciosActualizados = [...(currentSesionInfo.data.ejercicios || [])];
      
      ejerciciosActualizados[ejercicioAEditar] = {
        ...ejerciciosActualizados[ejercicioAEditar],
        ...ejercicioEditado
      };

      const datosActualizacion = {
        fecha: currentSesionInfo.data.fecha,
        tipoEntrenamiento: currentSesionInfo.data.tipoEntrenamiento,
        duracion: currentSesionInfo.data.duracion,
        ejercicios: ejerciciosActualizados
      };
      
      const response = await trainingService.actualizarSesion(currentSesionInfo.data._id, datosActualizacion);
      
      const sesionActualizada = (response as unknown as SesionUpdateResponse).sesion || response;
      
      if (currentSesionInfo) {
        const sesionActualizadaLocal = {
          ...currentSesionInfo,
          data: {
            ...currentSesionInfo.data,
            ...sesionActualizada
          }
        };
        setCurrentSesionLocal(sesionActualizadaLocal);
        
        setEjerciciosSesionActual(sesionActualizada.ejercicios || currentSesionInfo.data?.ejercicios || []);
      }
      
      // Recargar datos después de actualizar sesión
      await refetch();
      
      setForceUpdate(prev => prev + 1);
      
      setSuccessMessage("Ejercicio actualizado correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      setEjercicioAEditar(null);
      setEjercicioEditando(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el ejercicio');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleCancelarEdicion = () => {
    setEjercicioAEditar(null);
    setEjercicioEditando(null);
  };

  const eliminarEjercicio = async (ejercicioIndex: number) => {
    if (!currentSesionInfo || !currentSesionInfo.data?._id) return;
    
    try {
      setPublishLoading(true);
      
      const ejerciciosActualizados = currentSesionInfo.data.ejercicios.filter((_: EjercicioSesion, index: number) => index !== ejercicioIndex);
      
      const ejerciciosReordenados = ejerciciosActualizados.map((ejercicio: EjercicioSesion, index: number) => ({
        ...ejercicio,
        orden: index + 1
      }));
      
      const datosActualizacion = {
        fecha: currentSesionInfo.data.fecha,
        tipoEntrenamiento: currentSesionInfo.data.tipoEntrenamiento,
        duracion: currentSesionInfo.data.duracion,
        ejercicios: ejerciciosReordenados
      };
      
      const response = await trainingService.actualizarSesion(currentSesionInfo.data._id, datosActualizacion);
      
      const sesionActualizada = (response as unknown as SesionUpdateResponse).sesion || response;
      
      if (currentSesionInfo) {
        const sesionActualizadaLocal = {
          ...currentSesionInfo,
          data: {
            ...currentSesionInfo.data,
            ...sesionActualizada
          }
        };
        setCurrentSesionLocal(sesionActualizadaLocal);
        
        setEjerciciosSesionActual(sesionActualizada.ejercicios || currentSesionInfo.data?.ejercicios || []);
      }
      
      // Recargar datos después de actualizar sesión
      await refetch();
      
      setForceUpdate(prev => prev + 1);
      
      setSuccessMessage("Ejercicio eliminado de la sesión");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el ejercicio');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleEditarSesion = (sesionId: string) => {
    const sesion = sesiones.find(s => s._id === sesionId);
    if (!sesion) return;
    
    setSesionEditando({
      fecha: sesion.fecha,
      hora: sesion.hora || '',
      tipoEntrenamiento: sesion.tipoEntrenamiento,
      duracion: sesion.duracion,
      notas: sesion.notas || ''
    });
    setSesionAEditar(sesionId);
  };

  const handleGuardarSesionEditada = async (sesionEditada: typeof sesionEditando) => {
    if (!sesionAEditar || !sesionEditada) return;

    try {
      setPublishLoading(true);
      
      const datosActualizacion = {
        fecha: sesionEditada.fecha,
        hora: sesionEditada.hora,
        tipoEntrenamiento: sesionEditada.tipoEntrenamiento,
        duracion: sesionEditada.duracion,
        notas: sesionEditada.notas
      };

      await trainingService.actualizarSesion(sesionAEditar, datosActualizacion);
      
      // Recargar datos después de actualizar sesión
      await refetch();

      if (currentSesionInfo?.data?._id === sesionAEditar) {
        setCurrentSesionLocal(prev => prev && prev.data ? {
          ...prev,
          data: {
            ...prev.data,
            fecha: datosActualizacion.fecha,
            hora: datosActualizacion.hora,
            tipoEntrenamiento: datosActualizacion.tipoEntrenamiento,
            duracion: datosActualizacion.duracion,
            notas: datosActualizacion.notas
          }
        } : null);
      }

      setSuccessMessage("Sesión actualizada correctamente");
      setError(null);
      
      setSesionAEditar(null);
      setSesionEditando(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la sesión');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleCancelarEdicionSesion = () => {
    setSesionAEditar(null);
    setSesionEditando(null);
  };

  const handleEliminarSesion = (sesionId: string) => {
    setSesionAEliminar(sesionId);
  };

  const handleConfirmarEliminarSesion = async () => {
    if (!sesionAEliminar) return;

    try {
      setPublishLoading(true);
      
      await trainingService.eliminarSesion(sesionAEliminar);
      
      // Recargar datos después de eliminar sesión
      await refetch();

      if (currentSesionInfo?.data?._id === sesionAEliminar) {
        setCurrentSesionLocal(null);
        setEjerciciosSesionActual([]);
      }

      setSuccessMessage("Sesión eliminada correctamente");
      setError(null);
      
      setSesionAEliminar(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la sesión');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleConfigurarSesion = (fecha: string) => {
    setFechaSesionACrear(fecha);
    setShowCrearSesionModal(true);
  };

  const handleCrearSesion = async (sesionData: {
    fecha: string;
    hora?: string;
    tipoEntrenamiento: string;
    duracion: number;
    notas?: string;
  }) => {
    if (!plan?._id) return;

    try {
      setPublishLoading(true);
      
      const datosSesion = {
        clienteId: typeof plan.clientes[0] === 'object' && plan.clientes[0] !== null && '_id' in plan.clientes[0] 
          ? (plan.clientes[0] as { _id: string })._id 
          : plan.clientes[0] as string,
        planId: plan._id,
        fecha: sesionData.fecha,
        hora: sesionData.hora,
        tipoEntrenamiento: sesionData.tipoEntrenamiento,
        duracion: sesionData.duracion,
        ejercicios: [],
        notas: sesionData.notas
      };

      const response = await trainingService.crearSesion(datosSesion);
      const nuevaSesion = response.sesion;
      
      // Recargar datos después de crear sesión
      await refetch();
      if (plan && fechaInicio) {
        const sesionFecha = new Date(nuevaSesion.fecha);
        const inicioDate = new Date(fechaInicio);
        
        const diffTime = sesionFecha.getTime() - inicioDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const semanaSesion = Math.ceil(diffDays / 7);
        
        if (semanaSesion !== currentWeek && semanaSesion > 0) {
          setCurrentWeek(semanaSesion);
        }

        setTimeout(() => {
          const sesionFecha = new Date(nuevaSesion.fecha);
          const diaSemana = sesionFecha.getDay();
          const weekDayIndex = diaSemana === 0 ? 6 : diaSemana - 1;
          setActiveTab(weekDayIndex.toString());
        }, 100);
      }

      setSuccessMessage("Sesión creada correctamente");
      setError(null);
      
      setShowCrearSesionModal(false);
      setFechaSesionACrear('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la sesión');
    } finally {
      setPublishLoading(false);
    }
  };

  // Función para publicar el plan de entrenamiento
  const handlePublicarPlan = async () => {
    if (!plan || !planId) return;
    
    try {
      setPublishLoading(true);
      await trainingService.publicarPlan(planId);
      
      // Redirigir a la vista de ver el plan publicado
      navigateToPlanView(planId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al publicar el plan de entrenamiento');
    } finally {
      setPublishLoading(false);
    }
  };


  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader color="nutroos-green" size="lg" />
        </Box>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          withCloseButton
        >
          No se encontró el plan solicitado o no tienes permisos para verlo.
        </Alert>
        <Button 
          mt="lg" 
          color="nutroos-green"
          onClick={navigateToPlansList}
        >
          Volver a planes
        </Button>
      </Container>
    );
  }


  return (
    <Container size="xl" py="xl">

      <Paper 
        p="lg" 
        mb="md" 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)',
          borderColor: 'var(--app-border-color)'
        }}
      >
        <EditarPlanHeader 
          plan={plan} 
          publishLoading={publishLoading}
          onPublish={handlePublicarPlan}
        />
        
        <PlanInfo 
          plan={plan}
          fechaInicioFormateada={fechaInicioFormateada}
          isDark={isDark}
        />
        
        <Divider my="sm" />
        
        {(error || successMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error && (
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Error" 
                color="red" 
                mb="md"
                withCloseButton
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            {successMessage && (
              <Alert 
                icon={<IconCheck size={16} />}
                title="¡Operación exitosa!" 
                color="nutroos-green" 
                mb="md"
                withCloseButton
                onClose={() => setSuccessMessage(null)}
              >
                {successMessage}
              </Alert>
            )}
            
            {!plan?.draftMode && (
              <Alert 
                icon={<IconCheck size={16} />}
                title="Plan publicado" 
                color="green" 
                mb="md"
              >
                Este plan de entrenamiento ha sido publicado y no se puede editar.
              </Alert>
            )}
          </motion.div>
        )}
      </Paper>
      
      <Paper 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)',
          borderColor: 'var(--app-border-color)'
        }}
      >
        {sesionesRange.totalWeeks > 1 && (
          <Box p="md" style={{ borderBottom: '1px solid var(--app-border-color)' }}>
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Semana {currentWeek} de {sesionesRange.totalWeeks}
              </Text>
              <Group>
                <Select
                  value={currentWeek.toString()}
                  onChange={(value) => handleWeekChange(Number(value))}
                  data={Array.from({ length: sesionesRange.totalWeeks }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `Semana ${i + 1}`
                  }))}
                  size="sm"
                  style={{ width: 120 }}
                />
                <Pagination
                  value={currentWeek}
                  onChange={handleWeekChange}
                  total={sesionesRange.totalWeeks}
                  color="nutroos-green"
                  withEdges
                  size="sm"
                />
              </Group>
            </Group>
          </Box>
        )}
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          color="nutroos-green"
          variant="pills"
          p="md"
          radius="md"
          style={{ backgroundColor: isDark ? 'var(--app-paper-bg)' : 'var(--mantine-color-gray-0)' }}
        >
          <Tabs.List 
            style={{ 
              flexWrap: 'wrap',
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            {sesionesRange.sesiones.map((sesionInfo) => (
              <Tabs.Tab 
                key={sesionInfo.weekDayIndex} 
                value={sesionInfo.weekDayIndex.toString()}
              >
                {sesionInfo.weekDayName} {sesionInfo.fecha.getDate()}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          
          {activeTab !== null && (
            <Tabs.Panel value={activeTab} pt="lg">
              {currentSesionInfo?.data ? (
                <Box>
                  <Group justify="space-between" mb="md">
                    <Title order={4} c="nutroos-green.6">
                      {currentSesionInfo.nombreCompleto}
                    </Title>
                    <Group gap="xs">
                      <ActionIcon 
                        color="nutroos-green" 
                        variant="light"
                        onClick={() => handleEditarSesion(currentSesionInfo.data?._id || '')}
                        disabled={!plan?.draftMode}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        color="red" 
                        variant="light"
                        onClick={() => handleEliminarSesion(currentSesionInfo.data?._id || '')}
                        disabled={!plan?.draftMode}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Paper p="md" withBorder radius="md" mb="md">
                    <Group justify="space-between" mb="md">
                      <Text fw={500}>Ejercicios de la sesión</Text>
                      <Button 
                        size="sm" 
                        color="nutroos-green"
                        leftSection={<IconPlus size={16} />}
                        onClick={handleOpenEjerciciosModal}
                        loading={loading}
                        disabled={!plan?.draftMode}
                      >
                        Añadir ejercicio
                      </Button>
                    </Group>

                    {currentSesionInfo.data.ejercicios && currentSesionInfo.data.ejercicios.length > 0 ? (
                      <Stack key={`ejercicios-${forceUpdate}-${currentSesionInfo.data._id}`} gap="md">
                        {currentSesionInfo.data.ejercicios.map((ejercicio: {
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
                        }, ejercicioIndex: number) => {
                          const ejercicioData = ejercicios.find(e => e._id === ejercicio.ejercicio);
                          return (
                            <Paper key={ejercicioIndex} p="md" withBorder radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                              <Group justify="space-between" mb="xs">
                                <Text fw={500}>
                                  {ejercicioIndex + 1}. {ejercicioData?.nombre || 'Ejercicio no encontrado'}
                                </Text>
                                <Group gap="xs">
                                  <ActionIcon 
                                    size="sm" 
                                    color="nutroos-green" 
                                    variant="light"
                                    onClick={() => handleEditarEjercicio(ejercicioIndex)}
                                    disabled={!plan?.draftMode}
                                  >
                                    <IconEdit size={14} />
                                  </ActionIcon>
                                  <ActionIcon 
                                    size="sm" 
                                    color="red" 
                                    variant="light"
                                    onClick={() => setEjercicioAEliminar(ejercicioIndex)}
                                    loading={loading}
                                    disabled={!plan?.draftMode}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Group>
                              </Group>
                              
                              {/* Descripción del ejercicio */}
                              {ejercicioData?.descripcion && (
                                <Text size="sm" c="dimmed" mb="xs">
                                  {ejercicioData.descripcion}
                                </Text>
                              )}
                              
                              {/* Etiquetas informativas del ejercicio */}
                              {ejercicioData && (
                                <Group gap="xs" mb="md">
                                  <Badge size="sm" color="blue" variant="light">
                                    {ejercicioData.grupoMuscular}
                                  </Badge>
                                  <Badge size="sm" color="green" variant="light">
                                    {ejercicioData.equipamiento}
                                  </Badge>
                                  <Badge size="sm" color="orange" variant="light">
                                    {ejercicioData.nivelDificultad}
                                  </Badge>
                                  <Badge size="sm" color="purple" variant="light">
                                    {ejercicioData.nivelIntensidad}
                                  </Badge>
                                </Group>
                              )}
                              
                              {/* Configuración de la sesión */}
                              <Group gap="md">
                                <Text size="sm">
                                  <strong>Series:</strong> {ejercicio.series}
                                </Text>
                                <Text size="sm">
                                  <strong>Repeticiones:</strong> {ejercicio.repeticiones}
                                </Text>
                                <Text size="sm">
                                  <strong>Descanso:</strong> {ejercicio.tiempoDescanso}s
                                </Text>
                                {ejercicio.peso && (
                                  <Text size="sm">
                                    <strong>Peso:</strong> {ejercicio.peso}kg
                                  </Text>
                                )}
                              </Group>
                            </Paper>
                          );
                        })}
      </Stack>
                    ) : (
                      <Box p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
                        <Text size="sm" c="dimmed" ta="center" mb="md">
                          No hay ejercicios asignados a esta sesión.
                        </Text>
                        <Group justify="center">
                          <Button 
                            size="sm" 
                            color="nutroos-green"
                            leftSection={<IconPlus size={16} />}
                            onClick={handleOpenEjerciciosModal}
                            disabled={!plan?.draftMode}
                          >
                            Añadir primer ejercicio
                          </Button>
                        </Group>
                      </Box>
                    )}
                  </Paper>
                  
                  {currentSesionInfo.data.notas && (
                    <Paper p="md" withBorder radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                      <Text fw={500} size="sm" mb="xs">Notas de la sesión:</Text>
                      <Text size="sm">{currentSesionInfo.data.notas}</Text>
                    </Paper>
                  )}
                </Box>
              ) : (
                <Paper p="md" withBorder radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                  <Text size="sm" c="dimmed" mb="md">
                    Esta sesión aún no ha sido configurada.
                  </Text>
                  {/* Solo mostrar el botón si el día actual está en los días de la semana del plan */}
                  {currentSesionInfo?.fecha && plan && (() => {
                    const diaSemana = currentSesionInfo.fecha.getDay();
                    const esDiaValido = plan.diasSemana.includes(diaSemana);
                    return esDiaValido ? (
                  <Button 
                    size="sm" 
                    color="nutroos-green"
                    leftSection={<IconBarbell size={16} />}
                        disabled={!plan?.draftMode}
                    onClick={() => {
                          handleConfigurarSesion(currentSesionInfo.fecha.toISOString());
                    }}
                  >
                    Configurar sesión
                  </Button>
                    ) : (
                      <Text size="sm" c="dimmed">
                        Este día no está incluido en el plan de entrenamiento.
                      </Text>
                    );
                  })()}
                </Paper>
              )}
            </Tabs.Panel>
          )}
        </Tabs>
        
        {sesionesRange.totalWeeks > 1 && (
          <Box p="md" style={{ borderTop: '1px solid var(--app-border-color)' }}>
            <Group justify="center">
              <Pagination
                value={currentWeek}
                onChange={handleWeekChange}
                total={sesionesRange.totalWeeks}
                color="nutroos-green"
                withEdges
              />
            </Group>
          </Box>
        )}
      </Paper>
      

      <ModalGestionarEjercicios
        opened={showEjerciciosModal}
        onClose={() => setShowEjerciciosModal(false)}
        onAddEjercicio={handleAddEjercicio}
        onEjercicioCreado={handleEjercicioCreado}
        ejerciciosExistentes={ejercicios}
        siguienteOrden={ejerciciosSesion.length + 1}
      />

      
      {/* Modal de edición de ejercicio */}
      <ModalEditarEjercicioSesion
        opened={ejercicioAEditar !== null}
        onClose={handleCancelarEdicion}
        ejercicioData={ejercicioEditando}
        onGuardar={handleGuardarEjercicioEditado}
        loading={loading}
      />

      {/* Modal de confirmación para eliminar ejercicio */}
      <Modal
        opened={ejercicioAEliminar !== null}
        onClose={() => setEjercicioAEliminar(null)}
        title="Confirmar eliminación"
        centered
      >
        <Text size="sm" mb="md">
          ¿Estás seguro de que quieres eliminar este ejercicio de la sesión?
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button
            variant="outline"
            onClick={() => setEjercicioAEliminar(null)}
          >
            Cancelar
          </Button>
          <Button
            color="red"
            onClick={handleConfirmarEliminarEjercicio}
            loading={loading}
          >
            Eliminar
          </Button>
        </Group>
      </Modal>

      {/* Modal de edición de sesión */}
      <ModalEditarSesion
        opened={sesionAEditar !== null}
        onClose={handleCancelarEdicionSesion}
        sesionData={sesionEditando}
        onGuardar={handleGuardarSesionEditada}
        loading={loading}
      />

      {/* Modal de eliminación de sesión */}
      <ModalEliminarSesion
        opened={sesionAEliminar !== null}
        onClose={() => setSesionAEliminar(null)}
        sesionInfo={sesionAEliminar ? (() => {
          const sesion = sesiones.find(s => s._id === sesionAEliminar);
          return sesion ? {
            fecha: sesion.fecha,
            tipoEntrenamiento: sesion.tipoEntrenamiento,
            duracion: sesion.duracion,
            ejerciciosCount: sesion.ejercicios?.length || 0
          } : null;
        })() : null}
        onConfirmar={handleConfirmarEliminarSesion}
        loading={loading}
      />

      {/* Modal de crear sesión */}
      <ModalCrearSesion
        opened={showCrearSesionModal}
        onClose={() => setShowCrearSesionModal(false)}
        fechaInicial={fechaSesionACrear}
        onCrear={handleCrearSesion}
        loading={loading}
      />
    </Container>
  );
};

export default EditarPlanEntrenamientoPage;