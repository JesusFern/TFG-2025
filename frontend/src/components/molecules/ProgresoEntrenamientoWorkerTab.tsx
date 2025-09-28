import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Card, 
  Text, 
  Group, 
  Badge, 
  Progress, 
  Select,
  Button,
  Alert,
  Loader,
  Center,
  Stack,
  ThemeIcon,
  Paper,
  SimpleGrid,
  Box,
  Tabs,
  Table,
  ScrollArea,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { 
  IconCalendar, 
  IconTarget, 
  IconClock,
  IconRefresh,
  IconActivity,
  IconTrophy,
  IconUsers,
  IconAlertTriangle,
  IconX,
  IconEye,
  IconNotes,
  IconUser,
  IconBarbell
} from '@tabler/icons-react';
import BarChartComponent from './shared/BarChartComponent';
import { estadisticasService } from '../../services/estadisticasService';
import { EstadisticasCliente, EstadisticasSemanal, RachasEntrenamiento, ClienteDetalleCompleto, PlanEntrenamientoDetalle, SesionDetalle, RegistroEjercicioDetalle } from '../../types/estadisticas';
import { ModalNotas } from './ModalNotas';
import { ModalDetallesPlan } from './ModalDetallesPlan';
import { ModalDetallesSesion } from './ModalDetallesSesion';
import { ModalDetallesRegistro } from './ModalDetallesRegistro';
import { ModalSesionDesdePlan } from './ModalSesionDesdePlan';
import { ModalRegistroDesdeSesion } from './ModalRegistroDesdeSesion';

// Tipos específicos para la vista del trabajador
interface ClienteProgreso {
  id: string;
  nombre: string;
  email: string;
  estadisticas: EstadisticasCliente;
  estadisticasSemanal: EstadisticasSemanal;
  rachas: RachasEntrenamiento;
  ultimaSesion?: Date;
  notas?: string;
  alertas: string[];
}

interface ResumenClientes {
  totalClientes: number;
  clientesActivos: number;
  clientesInactivos: number;
  cumplimientoPromedio: number;
  sesionesPromedio: number;
  distribucionTipos: Record<string, number>;
}

// Función para obtener el número de semana actual (ISO 8601)
const getCurrentWeekNumber = (): number => {
  const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
};

const ProgresoEntrenamientoWorkerTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteProgreso[]>([]);
  const [resumen, setResumen] = useState<ResumenClientes | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(getCurrentWeekNumber());
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mostrarHistorial, setMostrarHistorial] = useState<boolean>(false);
  const [tabActiva, setTabActiva] = useState<string>('overview');
  const [modalNotasAbierto, setModalNotasAbierto] = useState<boolean>(false);
  const [clienteNotas, setClienteNotas] = useState<ClienteProgreso | null>(null);
  const [clienteDetalle, setClienteDetalle] = useState<ClienteDetalleCompleto | null>(null);
  const [modalPlanAbierto, setModalPlanAbierto] = useState<boolean>(false);
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanEntrenamientoDetalle | null>(null);
  const [modalSesionAbierto, setModalSesionAbierto] = useState<boolean>(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionDetalle | null>(null);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState<boolean>(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroEjercicioDetalle | null>(null);
  
  // Estados para modales anidados
  const [modalSesionDesdePlan, setModalSesionDesdePlan] = useState<boolean>(false);
  const [sesionDesdePlan, setSesionDesdePlan] = useState<SesionDetalle | null>(null);
  const [modalRegistroDesdeSesion, setModalRegistroDesdeSesion] = useState<boolean>(false);
  const [registroDesdeSesion, setRegistroDesdeSesion] = useState<RegistroEjercicioDetalle | null>(null);

  // Función para cargar datos de todos los clientes
  const cargarDatosClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos reales del backend
      const response = await estadisticasService.getClientesTrabajador(semanaSeleccionada, añoSeleccionado);
      
      if (response.success && response.clientes && response.resumen) {
        setClientes(response.clientes);
        setResumen(response.resumen);
      } else {
        throw new Error(response.message || 'Error al obtener datos de clientes');
      }

    } catch (err) {
      setError('Error al cargar los datos de los clientes');
      console.error('Error cargando datos de clientes:', err);
    } finally {
      setLoading(false);
    }
  }, [semanaSeleccionada, añoSeleccionado]);

  // Función para cargar detalles de un cliente específico
  const cargarDetallesCliente = useCallback(async (clienteId: string) => {
    try {
      const response = await estadisticasService.getDetallesCliente(clienteId);
      
      if (response.success && response.cliente) {
        setClienteDetalle(response.cliente);
      } else {
        throw new Error(response.message || 'Error al obtener detalles del cliente');
      }
    } catch (err) {
      console.error('Error cargando detalles del cliente:', err);
      setError('Error al cargar los detalles del cliente');
    }
  }, []);

  useEffect(() => {
    cargarDatosClientes();
  }, [cargarDatosClientes]);

  // Cargar detalles cuando se selecciona un cliente
  useEffect(() => {
    if (clienteSeleccionado) {
      cargarDetallesCliente(clienteSeleccionado);
    }
  }, [clienteSeleccionado, cargarDetallesCliente]);

  // Componente para mostrar KPIs del dashboard
  const DashboardKPIs = ({ resumen }: { resumen: ResumenClientes }) => (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
      <Card p="md" radius="md" withBorder>
        <Group mb="xs">
          <ThemeIcon color="blue" variant="light">
            <IconUsers size={20} />
          </ThemeIcon>
          <Text size="sm" fw={500}>Total Clientes</Text>
        </Group>
        <Text size="xl" fw={700} c="blue">
          {resumen.totalClientes}
        </Text>
        <Text size="xs" c="dimmed">
          {resumen.clientesActivos} activos, {resumen.clientesInactivos} inactivos
        </Text>
      </Card>

      <Card p="md" radius="md" withBorder>
        <Group mb="xs">
          <ThemeIcon color="green" variant="light">
            <IconTarget size={20} />
          </ThemeIcon>
          <Text size="sm" fw={500}>Cumplimiento Promedio</Text>
        </Group>
        <Text size="xl" fw={700} c="green">
          {Math.round(resumen.cumplimientoPromedio)}%
        </Text>
        <Progress 
          value={resumen.cumplimientoPromedio} 
          size="sm" 
          mt="xs" 
          color="green"
        />
      </Card>

      <Card p="md" radius="md" withBorder>
        <Group mb="xs">
          <ThemeIcon color="orange" variant="light">
            <IconClock size={20} />
          </ThemeIcon>
          <Text size="sm" fw={500}>Sesiones Promedio</Text>
        </Group>
        <Text size="xl" fw={700} c="orange">
          {resumen.sesionesPromedio.toFixed(1)}
        </Text>
        <Text size="xs" c="dimmed">por cliente esta semana</Text>
      </Card>

      <Card p="md" radius="md" withBorder>
        <Group mb="xs">
          <ThemeIcon color="red" variant="light">
            <IconAlertTriangle size={20} />
          </ThemeIcon>
          <Text size="sm" fw={500}>Clientes Inactivos</Text>
        </Group>
        <Text size="xl" fw={700} c="red">
          {resumen.clientesInactivos}
        </Text>
        <Text size="xs" c="dimmed">requieren atención</Text>
      </Card>
    </SimpleGrid>
  );

  // Componente para mostrar ranking de clientes
  const RankingClientes = ({ clientes, onClienteClick }: { clientes: ClienteProgreso[], onClienteClick?: (clienteId: string) => void }) => {
    const clientesOrdenados = [...clientes].sort((a, b) => 
      b.estadisticas.rendimiento.porcentajeCompletitud - a.estadisticas.rendimiento.porcentajeCompletitud
    );

    return (
      <Card p="md" radius="md" withBorder>
        <Group mb="md">
          <ThemeIcon size="lg" radius="md" color="blue">
            <IconTrophy size={20} />
          </ThemeIcon>
          <Text size="lg" fw={600}>Ranking de Cumplimiento</Text>
        </Group>
        
        <ScrollArea h={400}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Posición</Table.Th>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Cumplimiento</Table.Th>
                <Table.Th>Sesiones</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {clientesOrdenados.map((cliente, index) => (
                <Table.Tr key={cliente.id}>
                  <Table.Td>
                    <Group gap="xs">
                      {index < 3 && (
                        <ThemeIcon size="sm" color={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}>
                          <IconTrophy size={12} />
                        </ThemeIcon>
                      )}
                      <Text fw={600}>#{index + 1}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Box>
                      <Text fw={500}>{cliente.nombre}</Text>
                      <Text size="xs" c="dimmed">{cliente.email}</Text>
                    </Box>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text fw={600}>{Math.round(cliente.estadisticas.rendimiento.porcentajeCompletitud)}%</Text>
                      <Progress 
                        value={cliente.estadisticas.rendimiento.porcentajeCompletitud} 
                        size="sm" 
                        w={60}
                        color={cliente.estadisticas.rendimiento.porcentajeCompletitud > 80 ? 'green' : 
                               cliente.estadisticas.rendimiento.porcentajeCompletitud > 60 ? 'yellow' : 'red'}
                      />
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text>
                      {cliente.estadisticas.asistencia.sesionesCompletadas}/{cliente.estadisticas.asistencia.sesionesProgramadas}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={cliente.rachas.diasSinEntrenar <= 3 ? 'green' : 'red'}
                      variant="light"
                    >
                      {cliente.rachas.diasSinEntrenar <= 3 ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Ver análisis detallado">
                        <ActionIcon 
                          variant="light" 
                          color="blue"
                          onClick={() => {
                            setClienteSeleccionado(cliente.id);
                            if (onClienteClick) {
                              onClienteClick(cliente.id);
                            }
                          }}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Ver notas">
                        <ActionIcon 
                          variant="light" 
                          color="gray"
                          onClick={() => {
                            setClienteNotas(cliente);
                            setModalNotasAbierto(true);
                          }}
                        >
                          <IconNotes size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    );
  };

  // Componente para mostrar detalles de un cliente específico
  const DetallesCliente = ({ cliente }: { cliente: ClienteDetalleCompleto | null }) => {
    if (!cliente) {
      return (
        <Card p="md" radius="md" withBorder>
          <Center>
            <Loader size="lg" />
          </Center>
        </Card>
      );
    }

    return (
      <Stack gap="md">
        {/* Información básica del cliente */}
        <Card p="md" radius="md" withBorder>
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="blue">
              <IconUser size={20} />
            </ThemeIcon>
            <Text size="lg" fw={600}>Información del Cliente</Text>
          </Group>
          
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <Box>
              <Text size="sm" c="dimmed" mb="xs">Nombre</Text>
              <Text fw={500}>{cliente.nombre}</Text>
            </Box>
            
            <Box>
              <Text size="sm" c="dimmed" mb="xs">Email</Text>
              <Text fw={500}>{cliente.email}</Text>
            </Box>
            
            <Box>
              <Text size="sm" c="dimmed" mb="xs">Cumplimiento</Text>
              <Group gap="xs">
                <Text fw={600}>{Math.round(cliente.estadisticas.rendimiento.porcentajeCompletitud)}%</Text>
                <Progress 
                  value={cliente.estadisticas.rendimiento.porcentajeCompletitud} 
                  size="sm" 
                  w={100}
                />
              </Group>
            </Box>
            
            <Box>
              <Text size="sm" c="dimmed" mb="xs">Estado</Text>
              <Badge 
                color={cliente.rachas.diasSinEntrenar <= 3 ? 'green' : 'red'}
                variant="light"
              >
                {cliente.rachas.diasSinEntrenar <= 3 ? 'Activo' : 'Inactivo'}
              </Badge>
            </Box>
          </SimpleGrid>
        </Card>

        {/* Alertas */}
        {cliente.alertas.length > 0 && (
          <Card p="md" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon size="lg" radius="md" color="red">
                <IconAlertTriangle size={20} />
              </ThemeIcon>
              <Text size="lg" fw={600}>Alertas</Text>
            </Group>
            
            <Stack gap="xs">
              {cliente.alertas.map((alerta, index) => (
                <Alert key={index} color="orange" variant="light">
                  {alerta}
                </Alert>
              ))}
            </Stack>
          </Card>
        )}

        {/* Planes de entrenamiento */}
        <Card p="md" radius="md" withBorder>
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="green">
              <IconTarget size={20} />
            </ThemeIcon>
            <Text size="lg" fw={600}>Planes de Entrenamiento</Text>
          </Group>
          
          {cliente.planes.length > 0 ? (
            <Stack gap="md">
              {cliente.planes.map((plan) => (
                <Paper key={plan.id} p="md" withBorder>
                  <Group justify="space-between" mb="sm">
                    <Text fw={600}>{plan.nombre}</Text>
                    <Badge color="blue" variant="light">
                      {plan.objetivo}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed" mb="sm">
                    {plan.sesionesPorSemana} sesiones/semana • {plan.duracionDias} días
                  </Text>
                  <Text size="sm" c="dimmed" mb="sm">
                    Inicio: {new Date(plan.fechaInicio).toLocaleDateString()}
                  </Text>
                  <Group justify="flex-end">
                    <Button 
                      variant="light" 
                      size="xs"
                      onClick={() => {
                        setPlanSeleccionado(plan);
                        setModalPlanAbierto(true);
                      }}
                    >
                      Ver Detalles
                    </Button>
                  </Group>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" ta="center">
              No hay planes de entrenamiento asignados
            </Text>
          )}
        </Card>

        {/* Sesiones recientes */}
        <Card p="md" radius="md" withBorder>
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="orange">
              <IconClock size={20} />
            </ThemeIcon>
            <Text size="lg" fw={600}>Sesiones Recientes</Text>
          </Group>
          
          {cliente.sesiones.length > 0 ? (
            <ScrollArea h={300}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Sesión</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Ejercicios</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cliente.sesiones.slice(0, 10).map((sesion) => (
                    <Table.Tr key={sesion.id}>
                      <Table.Td>
                        <Badge color="blue" variant="light">
                          {sesion.tipoEntrenamiento || 'Fuerza'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {new Date(sesion.fecha).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={sesion.completada ? 'green' : 'red'}
                          variant="light"
                        >
                          {sesion.completada ? 'Completada' : 'Pendiente'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{sesion.ejercicios.length} ejercicios</Text>
                      </Table.Td>
                      <Table.Td>
                        <Button 
                          variant="light" 
                          size="xs"
                          onClick={() => {
                            setSesionSeleccionada(sesion);
                            setModalSesionAbierto(true);
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            <Text size="sm" c="dimmed" ta="center">
              No hay sesiones registradas
            </Text>
          )}
        </Card>

        {/* Registros de ejercicios recientes */}
        <Card p="md" radius="md" withBorder>
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="purple">
              <IconBarbell size={20} />
            </ThemeIcon>
            <Text size="lg" fw={600}>Registros de Ejercicios</Text>
          </Group>
          
          {cliente.registros.length > 0 ? (
            <ScrollArea h={300}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ejercicio</Table.Th>
                    <Table.Th>Sesión</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Completado</Table.Th>
                    <Table.Th>Notas</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cliente.registros.slice(0, 15).map((registro) => (
                    <Table.Tr key={registro.id}>
                      <Table.Td>
                        <Text fw={500}>{registro.ejercicio.nombre}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="blue" variant="light" size="sm">
                          {registro.sesion.tipoEntrenamiento || 'Fuerza'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {new Date(registro.fecha).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={registro.completado ? 'green' : 'red'}
                          variant="light"
                        >
                          {registro.completado ? 'Sí' : 'No'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {registro.notas || 'Sin notas'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Button 
                          variant="light" 
                          size="xs"
                          onClick={() => {
                            setRegistroSeleccionado(registro);
                            setModalRegistroAbierto(true);
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            <Text size="sm" c="dimmed" ta="center">
              No hay registros de ejercicios
            </Text>
          )}
        </Card>
      </Stack>
    );
  };

  // Componente para mostrar distribución de tipos de entrenamiento
  const DistribucionTipos = ({ distribucion }: { distribucion: Record<string, number> }) => {
    const data = Object.entries(distribucion).map(([tipo, cantidad]) => ({
      tipo,
      cantidad
    }));

    return (
      <BarChartComponent
        title="Distribución de Tipos de Entrenamiento"
        data={data}
        tooltipLabel="ejercicios"
        color="blue.6"
      />
    );
  };

  if (loading) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Cargando datos de clientes...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error" icon={<IconX size={16} />}>
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      {/* Panel de información de la semana */}
      <Paper p="md" radius="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ThemeIcon color="blue" variant="light" size="lg">
              <IconCalendar size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={600}>
                Seguimiento de Clientes
              </Text>
              <Text size="sm" c="dimmed">
                Semana {semanaSeleccionada} de {añoSeleccionado}
              </Text>
            </div>
          </Group>
          <Group gap="sm">
            <Button 
              variant="light" 
              leftSection={<IconRefresh size={16} />} 
              onClick={cargarDatosClientes}
            >
              Actualizar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
            >
              {mostrarHistorial ? 'Ocultar Historial' : 'Ver Historial'}
            </Button>
          </Group>
        </Group>

        {/* Selectores de historial */}
        {mostrarHistorial && (
          <Paper p="md" withBorder mt="md" style={{ backgroundColor: 'white' }}>
            <Text size="sm" fw={500} mb="md">Seleccionar Período Histórico</Text>
            <Group>
              <Select
                placeholder="Seleccionar semana"
                data={Array.from({ length: 52 }, (_, i) => ({ value: (i + 1).toString(), label: `Semana ${i + 1}` }))}
                value={semanaSeleccionada.toString()}
                onChange={(value) => setSemanaSeleccionada(parseInt(value || '1'))}
                w={150}
              />
              <Select
                placeholder="Año"
                data={Array.from({ length: 5 }, (_, i) => ({ 
                  value: (new Date().getFullYear() - 2 + i).toString(), 
                  label: (new Date().getFullYear() - 2 + i).toString() 
                }))}
                value={añoSeleccionado.toString()}
                onChange={(value) => setAñoSeleccionado(parseInt(value || new Date().getFullYear().toString()))}
                w={100}
              />
              <Button 
                variant="light" 
                onClick={() => {
                  setSemanaSeleccionada(getCurrentWeekNumber());
                  setAñoSeleccionado(new Date().getFullYear());
                }}
              >
                Volver a Actual
              </Button>
            </Group>
          </Paper>
        )}
      </Paper>

      {/* Dashboard KPIs */}
      {resumen && <DashboardKPIs resumen={resumen} />}

      {/* Contenido principal con tabs */}
      <Tabs value={tabActiva} onChange={(value) => setTabActiva(value || 'overview')} variant="outline">
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconTarget size={16} />}>
            Vista General
          </Tabs.Tab>
          <Tabs.Tab value="ranking" leftSection={<IconTrophy size={16} />}>
            Ranking
          </Tabs.Tab>
          <Tabs.Tab value="analisis" leftSection={<IconActivity size={16} />}>
            Análisis
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <RankingClientes 
                clientes={clientes} 
                onClienteClick={(clienteId) => {
                  setClienteSeleccionado(clienteId);
                  setTabActiva('analisis');
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              {resumen && <DistribucionTipos distribucion={resumen.distribucionTipos} />}
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="ranking" pt="md">
          <Stack gap="md">
            <Text size="lg" fw={600} mb="md">
              Ranking de Clientes por Rendimiento
            </Text>
            <RankingClientes 
              clientes={clientes} 
              onClienteClick={(clienteId) => {
                setClienteSeleccionado(clienteId);
                setTabActiva('analisis');
              }}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="analisis" pt="md">
          {clienteSeleccionado ? (
            <Box>
              <Group mb="md" justify="space-between">
                <Text size="lg" fw={600}>
                  Análisis Detallado del Cliente
                </Text>
                <Button 
                  variant="light" 
                  leftSection={<IconX size={16} />}
                  onClick={() => setClienteSeleccionado(null)}
                >
                  Volver al listado
                </Button>
              </Group>
              <DetallesCliente cliente={clienteDetalle} />
            </Box>
          ) : (
            <Stack gap="md">
              <Text size="lg" fw={600} mb="md">
                Selecciona un Cliente para Análisis Detallado
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Haz clic en cualquier cliente del ranking para ver su análisis detallado
              </Text>
              <RankingClientes 
                clientes={clientes} 
                onClienteClick={(clienteId) => setClienteSeleccionado(clienteId)}
              />
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Modal de Notas */}
      <ModalNotas
        opened={modalNotasAbierto}
        onClose={() => setModalNotasAbierto(false)}
        cliente={clienteNotas}
        registros={clienteDetalle?.registros || []}
      />

      {/* Modal de Detalles del Plan */}
      <ModalDetallesPlan
        opened={modalPlanAbierto}
        onClose={() => setModalPlanAbierto(false)}
        plan={planSeleccionado}
        onSesionClick={(sesion) => {
          setSesionDesdePlan(sesion);
          setModalSesionDesdePlan(true);
        }}
      />

      {/* Modal de Detalles de la Sesión */}
      <ModalDetallesSesion
        opened={modalSesionAbierto}
        onClose={() => setModalSesionAbierto(false)}
        sesion={sesionSeleccionada}
      />

      {/* Modal de Detalles del Registro */}
      <ModalDetallesRegistro
        opened={modalRegistroAbierto}
        onClose={() => setModalRegistroAbierto(false)}
        registro={registroSeleccionado}
      />

      {/* Modal de Sesión desde Plan (Modal Anidado) */}
      <ModalSesionDesdePlan
        opened={modalSesionDesdePlan}
        onClose={() => setModalSesionDesdePlan(false)}
        sesion={sesionDesdePlan}
        onRegistroClick={(registro) => {
          setRegistroDesdeSesion(registro);
          setModalRegistroDesdeSesion(true);
        }}
        registros={clienteDetalle?.registros || []}
      />

      {/* Modal de Registro desde Sesión (Modal Anidado de Segundo Nivel) */}
      <ModalRegistroDesdeSesion
        opened={modalRegistroDesdeSesion}
        onClose={() => setModalRegistroDesdeSesion(false)}
        registro={registroDesdeSesion}
      />
    </Stack>
  );
};

export default ProgresoEntrenamientoWorkerTab;
