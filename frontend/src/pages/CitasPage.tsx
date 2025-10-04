import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Stack,
  Group,
  Button,
  SimpleGrid,
  Alert,
  LoadingOverlay,
  Text,
  Tabs,
  Paper,
  Loader
} from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { useAppointmentCalendarSync } from '../hooks/useAppointmentCalendarSync';
import { CitaService } from '../services/citaService';
import { Cita, FiltrosCitas as FiltrosCitasType, EstadisticasCitas as EstadisticasCitasType, ReagendarCitaDTO } from '../types/citas';
import CitaCard from '../components/molecules/CitaCard';
import FiltrosCitas from '../components/molecules/FiltrosCitas';
import EstadisticasCitas from '../components/molecules/EstadisticasCitas';
import ModalCancelarCita from '../components/molecules/ModalCancelarCita';
import ModalReagendarCita from '../components/molecules/ModalReagendarCita';
import ModalConfirmarAccionCita from '../components/molecules/ModalConfirmarAccionCita';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { VideoCallModalCitas } from '../components/organisms/VideoCallModalCitas';
import { VideoCallRoom } from '../components/organisms/VideoCallRoom';
import { useVideoCallCitas } from '../hooks/useVideoCallCitas';
import {
  IconPlus,
  IconCalendar,
  IconChartBar,
  IconList,
  IconAlertCircle,
  IconRefresh,
  IconArrowLeft
} from '@tabler/icons-react';

const CitasPage: React.FC = () => {
  const { user } = useAuth();
  const isDark = useThemeDetection();
  const navigate = useNavigate();
  
  // Hook para sincronización con Google Calendar
  const { syncAppointmentOnConfirm, syncAppointmentOnReschedule, syncAppointmentOnCancel } = useAppointmentCalendarSync();
  
  // Estados principales
  const [citas, setCitas] = useState<Cita[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCitasType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Estados de filtros - Por defecto solo mostrar citas activas
  const [filtros, setFiltros] = useState<FiltrosCitasType>({
    limit: 20,
    offset: 0,
    estadosActivos: true // Por defecto solo mostrar citas activas (pendientes, confirmadas, en_progreso)
  });
  const [totalCitas, setTotalCitas] = useState(0);

  // Estados de modales
  const [modalCancelar, setModalCancelar] = useState<{
    opened: boolean;
    cita: Cita | null;
  }>({ opened: false, cita: null });
  
  const [modalReagendar, setModalReagendar] = useState<{
    opened: boolean;
    cita: Cita | null;
  }>({ opened: false, cita: null });
  
  const [modalConfirmar, setModalConfirmar] = useState<{
    opened: boolean;
    cita: Cita | null;
    accion: 'confirmar' | 'completar' | 'unirse';
  }>({ opened: false, cita: null, accion: 'confirmar' });

  // Estados de loading para acciones
  const [loadingAccion, setLoadingAccion] = useState(false);

  // Estados para videollamadas
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVideoRoom, setShowVideoRoom] = useState(false);
  const [videoCallCita, setVideoCallCita] = useState<Cita | null>(null);
  const [cameraSettings, setCameraSettings] = useState<{ videoEnabled: boolean; audioEnabled: boolean }>({
    videoEnabled: true,
    audioEnabled: true
  });

  // Estado para controlar si estamos recuperando una videollamada
  const [isRecoveringVideoCall, setIsRecoveringVideoCall] = useState(false);

  // Tab activo
  const [activeTab, setActiveTab] = useState<string | null>('lista');

  // Determinar si es profesional
  const esProfesional = user?.role === 'worker';

  // Función para volver al dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Hook para videollamadas
  const {
    call: videoCall,
    startCallWithSettings,
    endCall,
    participants,
    localParticipant,
  } = useVideoCallCitas({
    cita: videoCallCita || undefined,
    onCallEnded: () => {
      setShowVideoRoom(false);
      setShowVideoCall(false);
      setVideoCallCita(null);
      // Limpiar videollamada guardada cuando termine
      localStorage.removeItem('activeVideoCall');
    },
    onCallStarted: () => {
      // Guardar videollamada activa en localStorage
      if (videoCallCita) {
        localStorage.setItem('activeVideoCall', JSON.stringify({
          citaId: videoCallCita._id,
          timestamp: Date.now()
        }));
      }
      
      // Pequeño delay para asegurar que el estado se establezca correctamente
      setTimeout(() => {
        setShowVideoRoom(true);
        setShowVideoCall(false);
      }, 100);
    },
  });

  // Debug: Log cuando cambien los estados de videollamada
  useEffect(() => {
  }, [showVideoRoom, showVideoCall, videoCallCita, videoCall]);

  // Cargar citas
  const cargarCitas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Aplicar filtros basados en el rol del usuario
      const filtrosAplicados = { ...filtros };
      
      // Si hay un filtro de estado específico, desactivar el filtro de estados activos
      if (filtrosAplicados.estado) {
        delete filtrosAplicados.estadosActivos;
      }
      
      if (!esProfesional && user?.role !== 'admin') {
        // Los clientes solo ven sus propias citas
        filtrosAplicados.cliente = user?._id;
      } else if (esProfesional && user?.role !== 'admin') {
        // Los profesionales solo ven las citas donde son el profesional
        filtrosAplicados.profesional = user?._id;
      }

      const respuesta = await CitaService.obtenerCitas(filtrosAplicados);
      setCitas(respuesta.citas);
      setTotalCitas(respuesta.total);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      setError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, [filtros, esProfesional, user]);

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      setLoadingEstadisticas(true);
      const stats = await CitaService.obtenerEstadisticasCitas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  // Efectos
  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  useEffect(() => {
    if (activeTab === 'estadisticas') {
      cargarEstadisticas();
    }
  }, [activeTab]);

  // Efecto para recuperar videollamada después de recargar la página
  useEffect(() => {
    const recoverVideoCall = async () => {
      try {
        // Verificar si hay una videollamada guardada en localStorage
        const savedVideoCall = localStorage.getItem('activeVideoCall');
        if (savedVideoCall) {
          const { citaId, timestamp } = JSON.parse(savedVideoCall);
          
          // Verificar que no sea muy antiguo (máximo 1 hora)
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          if (timestamp > oneHourAgo) {
            setIsRecoveringVideoCall(true);
            
            // Buscar la cita por ID
            const citaEncontrada = await CitaService.obtenerCitaPorId(citaId);
            if (citaEncontrada) {
              // Solo establecer la cita, pero no mostrar la sala automáticamente
              // El usuario debe hacer clic en "Unirse" para conectarse
              setVideoCallCita(citaEncontrada);
              // NO establecer showVideoRoom = true aquí para evitar el bucle
            } else {
              // Si no se encuentra la cita, limpiar localStorage
              localStorage.removeItem('activeVideoCall');
            }
          } else {
            // Videollamada muy antigua, limpiar
            localStorage.removeItem('activeVideoCall');
          }
        }
      } catch (error) {
        console.error('❌ Error al recuperar videollamada:', error);
        localStorage.removeItem('activeVideoCall');
      } finally {
        setIsRecoveringVideoCall(false);
      }
    };

    recoverVideoCall();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Handlers de filtros
  const handleFiltrosChange = (nuevosFiltros: FiltrosCitasType) => {
    setFiltros({ ...nuevosFiltros, offset: 0 });
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      limit: 20,
      offset: 0,
      estadosActivos: true // Mantener el filtro por defecto de estados activos
    });
  };

  // Handlers de acciones
  const handleCancelarCita = async (cita: Cita) => {
    try {
      setLoadingAccion(true);
      await CitaService.cancelarCita(cita._id, { motivo: 'Cancelada por el usuario' });
      
      // Sincronizar con Google Calendar
      try {
        await syncAppointmentOnCancel(cita._id);
      } catch (calendarError) {
        console.error('Error sincronizando cancelación con Google Calendar:', calendarError);
        // No fallar la cancelación si hay error en el calendario
      }
      
      setNotification({
        type: 'success',
        message: 'Cita cancelada exitosamente'
      });
      cargarCitas();
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      setNotification({
        type: 'error',
        message: 'Error al cancelar la cita'
      });
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleReagendarCita = async (cita: Cita, datos: ReagendarCitaDTO) => {
    try {
      setLoadingAccion(true);
      await CitaService.reagendarCita(cita._id, datos);
      
      // Sincronizar con Google Calendar - eliminar evento anterior
      try {
        await syncAppointmentOnReschedule(cita._id);
      } catch (calendarError) {
        console.error('Error eliminando evento anterior del Google Calendar:', calendarError);
        // No fallar el reagendamiento si hay error en el calendario
      }
      
      setNotification({
        type: 'success',
        message: 'Cita reagendada exitosamente'
      });
      cargarCitas();
    } catch (error) {
      console.error('Error al reagendar cita:', error);
      setNotification({
        type: 'error',
        message: 'Error al reagendar la cita'
      });
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleConfirmarCita = async (cita: Cita) => {
    try {
      setLoadingAccion(true);
      await CitaService.confirmarCita(cita._id);
      
      // Sincronizar con Google Calendar
      try {
        // Obtener emails del cliente y profesional
        const clientEmail = typeof cita.cliente === 'string' ? cita.cliente : cita.cliente.email;
        const professionalEmail = typeof cita.profesional === 'string' ? cita.profesional : cita.profesional.email;
        await syncAppointmentOnConfirm(cita._id, clientEmail, professionalEmail);
      } catch (calendarError) {
        console.error('Error sincronizando confirmación con Google Calendar:', calendarError);
        // No fallar la confirmación si hay error en el calendario
      }
      
      setNotification({
        type: 'success',
        message: 'Cita confirmada exitosamente'
      });
      cargarCitas();
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      setNotification({
        type: 'error',
        message: 'Error al confirmar la cita'
      });
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleCompletarCita = async (cita: Cita) => {
    try {
      setLoadingAccion(true);
      await CitaService.completarCita(cita._id);
      setNotification({
        type: 'success',
        message: 'Cita completada exitosamente'
      });
      cargarCitas();
    } catch (error) {
      console.error('Error al completar cita:', error);
      setNotification({
        type: 'error',
        message: 'Error al completar la cita'
      });
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleUnirseVideollamada = async () => {
    if (!modalConfirmar.cita) return;
    
    // Configurar la cita para la videollamada
    setVideoCallCita(modalConfirmar.cita);
    setShowVideoCall(true);
    
    // Cerrar el modal de confirmación
    setModalConfirmar({ opened: false, cita: null, accion: 'confirmar' });
  };

  // Handlers de modales
  const abrirModalCancelar = (cita: Cita) => {
    setModalCancelar({ opened: true, cita });
  };

  const abrirModalReagendar = (cita: Cita) => {
    setModalReagendar({ opened: true, cita });
  };

  const abrirModalConfirmar = (cita: Cita, accion: 'confirmar' | 'completar' | 'unirse') => {
    setModalConfirmar({ opened: true, cita, accion });
  };

  const cerrarModales = () => {
    setModalCancelar({ opened: false, cita: null });
    setModalReagendar({ opened: false, cita: null });
    setModalConfirmar({ opened: false, cita: null, accion: 'confirmar' });
  };

  // Handlers para videollamadas
  const handleJoinVideoCall = (cita: Cita) => {
    setVideoCallCita(cita);
    setShowVideoCall(true);
  };

  const handleCloseVideoCall = () => {
    setShowVideoCall(false);
    setVideoCallCita(null);
  };

  const handleCloseVideoRoom = async () => {
    if (videoCall) {
      await endCall();
    }
    setShowVideoRoom(false);
    setVideoCallCita(null);
    // Limpiar videollamada guardada cuando se cierre manualmente
    localStorage.removeItem('activeVideoCall');
  };

  const handleJoinCallWithSettings = async (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    
    setCameraSettings(settings);
    try {
      await startCallWithSettings(settings);
      
      // El onCallStarted callback se encargará de cambiar el estado
      // No necesitamos hacer nada más aquí
    } catch (error) {
      console.error('Error al unirse a la videollamada:', error);
      setNotification({
        type: 'error',
        message: 'Error al unirse a la videollamada'
      });
    }
  };

  // Si se está recuperando una videollamada, mostrar loading
  if (isRecoveringVideoCall) {
    return (
      <Container size="xl" py="md">
        <Stack gap="lg" align="center" justify="center" style={{ minHeight: '400px' }}>
          <Loader size="lg" />
          <Text size="lg" c="dimmed">
            Recuperando videollamada...
          </Text>
        </Stack>
      </Container>
    );
  }

  // Si hay una videollamada activa, mostrar la sala de video
  if (showVideoRoom && videoCall) {
    return (
      <VideoCallRoom
        call={videoCall}
        onEndCall={handleCloseVideoRoom}
        cameraSettings={cameraSettings}
        participants={participants}
        localParticipant={localParticipant}
      />
    );
  }

  return (
    <Container size="xl" py="md">
        <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={1} c={isDark ? 'white' : 'dark'}>
              Mis Citas
            </Title>
            <Text size="sm" c="dimmed">
              {esProfesional ? 'Gestiona las citas con tus clientes' : 'Gestiona tus citas programadas'}
            </Text>
          </div>
          
          <Group>
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="light"
              onClick={handleBackToDashboard}
            >
              Volver al Dashboard
            </Button>
            {/* Solo mostrar botón "Nueva Cita" para clientes, no para profesionales */}
            {!esProfesional && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate('/citas/crear')}
              >
                Nueva Cita
              </Button>
            )}
            <Button
              variant="outline"
              leftSection={<IconRefresh size={16} />}
              onClick={cargarCitas}
              loading={loading}
            >
              Actualizar
            </Button>
          </Group>
        </Group>

        {/* Notificaciones */}
        {notification && (
          <GlobalNotificationOverlay
            message={notification.message}
            type={notification.type}
            withCloseButton
            onClose={() => setNotification(null)}
          />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="lista" leftSection={<IconList size={16} />}>
              Lista de Citas
            </Tabs.Tab>
            <Tabs.Tab value="estadisticas" leftSection={<IconChartBar size={16} />}>
              Estadísticas
            </Tabs.Tab>
          </Tabs.List>

          {/* Tab de lista */}
          <Tabs.Panel value="lista" pt="md">
            <Stack gap="md">
              {/* Filtros */}
              <FiltrosCitas
                filtros={filtros}
                onFiltrosChange={handleFiltrosChange}
                onLimpiarFiltros={handleLimpiarFiltros}
                totalResultados={totalCitas}
                loading={loading}
                showProfessionalFilter={user?.role === 'admin'}
                showClientFilter={user?.role === 'admin'}
              />

              {/* Lista de citas */}
              <Paper p="md" radius="md" withBorder bg={isDark ? 'dark.6' : 'white'} style={{ position: 'relative' }}>
                <LoadingOverlay visible={loading} />
                
                {error && (
                  <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
                    {error}
                  </Alert>
                )}

                {citas.length === 0 && !loading ? (
                  <Stack align="center" py="xl">
                    <IconCalendar size={48} color="var(--mantine-color-dimmed)" />
                    <Text size="lg" c="dimmed" ta="center">
                      No se encontraron citas
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                      {Object.values(filtros).some(value => value !== undefined && value !== '') 
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'Crea tu primera cita para comenzar'
                      }
                    </Text>
                  </Stack>
                ) : (
                  <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                    {citas.map((cita) => (
                      <CitaCard
                        key={cita._id}
                        cita={cita}
                        onEdit={(cita) => window.location.href = `/citas/editar/${cita._id}`}
                        onCancel={abrirModalCancelar}
                        onReschedule={abrirModalReagendar}
                        onJoin={handleJoinVideoCall}
                        onConfirm={(cita) => abrirModalConfirmar(cita, 'confirmar')}
                        onComplete={(cita) => abrirModalConfirmar(cita, 'completar')}
                        isProfessional={esProfesional}
                      />
                    ))}
                  </SimpleGrid>
                )}
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* Tab de estadísticas */}
          <Tabs.Panel value="estadisticas" pt="md">
            <Paper p="md" radius="md" withBorder bg={isDark ? 'dark.6' : 'white'} style={{ position: 'relative' }}>
              <LoadingOverlay visible={loadingEstadisticas} />
              
              {estadisticas ? (
                <EstadisticasCitas estadisticas={estadisticas || { totalCitas: 0, citasPendientes: 0, citasConfirmadas: 0, citasCompletadas: 0, citasCanceladas: 0, citasPorTipo: {}, citasPorMes: [] }} />
              ) : (
                <Stack align="center" py="xl">
                  <IconChartBar size={48} color="var(--mantine-color-dimmed)" />
                  <Text size="lg" c="dimmed" ta="center">
                    Cargando estadísticas...
                  </Text>
                </Stack>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>

        {/* Modales */}
        <ModalCancelarCita
          opened={modalCancelar.opened}
          onClose={cerrarModales}
          cita={modalCancelar.cita}
          onConfirm={handleCancelarCita}
          loading={loadingAccion}
        />

        <ModalReagendarCita
          opened={modalReagendar.opened}
          onClose={cerrarModales}
          cita={modalReagendar.cita}
          onConfirm={handleReagendarCita}
          loading={loadingAccion}
        />

        <ModalConfirmarAccionCita
          opened={modalConfirmar.opened}
          onClose={cerrarModales}
          cita={modalConfirmar.cita}
          accion={modalConfirmar.accion}
          onConfirm={
            modalConfirmar.accion === 'confirmar' ? handleConfirmarCita :
            modalConfirmar.accion === 'completar' ? handleCompletarCita :
            handleUnirseVideollamada
          }
          loading={loadingAccion}
        />

        {/* Modal de videollamada */}
        <VideoCallModalCitas
          isOpen={showVideoCall}
          onClose={handleCloseVideoCall}
          cita={videoCallCita}
          onJoinCall={handleJoinCallWithSettings}
        />
      </Stack>
    </Container>
  );
};

export default CitasPage;
