import React, { useState, useEffect, useCallback } from 'react';
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
  Paper
} from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { CitaService } from '../services/citaService';
import { Cita, FiltrosCitas as FiltrosCitasType, EstadisticasCitas as EstadisticasCitasType, ReagendarCitaDTO } from '../types/citas';
import CitaCard from '../components/molecules/CitaCard';
import FiltrosCitas from '../components/molecules/FiltrosCitas';
import EstadisticasCitas from '../components/molecules/EstadisticasCitas';
import ModalCancelarCita from '../components/molecules/ModalCancelarCita';
import ModalReagendarCita from '../components/molecules/ModalReagendarCita';
import ModalConfirmarAccionCita from '../components/molecules/ModalConfirmarAccionCita';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import {
  IconPlus,
  IconCalendar,
  IconChartBar,
  IconList,
  IconAlertCircle,
  IconRefresh
} from '@tabler/icons-react';

const CitasPage: React.FC = () => {
  const { user } = useAuth();
  const isDark = useThemeDetection();
  
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

  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosCitasType>({
    limit: 20,
    offset: 0
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

  // Tab activo
  const [activeTab, setActiveTab] = useState<string | null>('lista');

  // Determinar si es profesional
  const esProfesional = user?.role === 'worker';

  // Cargar citas
  const cargarCitas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Aplicar filtros basados en el rol del usuario
      const filtrosAplicados = { ...filtros };
      
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

  // Handlers de filtros
  const handleFiltrosChange = (nuevosFiltros: FiltrosCitasType) => {
    setFiltros({ ...nuevosFiltros, offset: 0 });
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      limit: 20,
      offset: 0
    });
  };

  // Handlers de acciones
  const handleCancelarCita = async (cita: Cita) => {
    try {
      setLoadingAccion(true);
      await CitaService.cancelarCita(cita._id, { motivo: 'Cancelada por el usuario' });
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
    // Aquí se implementaría la lógica para unirse a la videollamada
    setNotification({
      type: 'info',
      message: 'Funcionalidad de videollamada en desarrollo'
    });
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
              leftSection={<IconPlus size={16} />}
              onClick={() => window.location.href = '/citas/crear'}
            >
              Nueva Cita
            </Button>
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
                        onJoin={(cita) => abrirModalConfirmar(cita, 'unirse')}
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
      </Stack>
    </Container>
  );
};

export default CitasPage;
