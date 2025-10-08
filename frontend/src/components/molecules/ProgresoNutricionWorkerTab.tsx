import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Text, 
  Group, 
  Badge, 
  Select,
  Button,
  Alert,
  Loader,
  Center,
  Stack, 
  Divider,
  Paper,
  Card,
  Title,
  Table
} from '@mantine/core';
import {
  IconRefresh,
  IconUsers,
  IconAlertCircle,
  IconCalendarOff
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { 
  getClientesAsignados, 
  getEstadisticasNutricionalesCliente, 
  getClientesInactivos,
  ClienteAsignado,
  ClienteInactivo
} from '../../services/workerService';
import { 
  EstadisticasNutricionalesGenerales, 
  EstadisticasNutricionalesSemanal, 
  ProgresoComida
} from '../../types/estadisticasNutricionales';
import EstadisticasGeneralesGrid from './shared/EstadisticasGeneralesGrid';
import EstadisticasSemanalesGrid from './shared/EstadisticasSemanalesGrid';
import PlatosFavoritosGrid from './shared/PlatosFavoritosGrid';

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
    satisfaccion: 'mejorando' | 'empeorando' | 'estable';
    cumplimiento: 'mejorando' | 'empeorando' | 'estable';
  };
}

interface ClienteNutricional extends ClienteAsignado {
  estadisticas?: EstadisticasNutricionalesGenerales;
  estadisticasSemanal?: EstadisticasSemanalBackend;
  progresoComidas?: ProgresoComida[];
}

const ProgresoNutricionWorkerTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteNutricional[]>([]);
  const [clientesInactivos, setClientesInactivos] = useState<ClienteInactivo[]>([]);
  const [loadingInactivos, setLoadingInactivos] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(getCurrentWeekNumber());
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());

  // Función para obtener el número de semana actual (ISO 8601)
  function getCurrentWeekNumber(): number {
    const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  }

  // Cargar clientes del trabajador
  const cargarClientes = useCallback(async () => {
    if (!user || user.role !== 'worker') return;

    try {
      setLoading(true);
      setError(null);

      // Obtener clientes asignados del trabajador
      const clientesAsignados = await getClientesAsignados();
      
      // Filtrar solo los clientes asignados como nutricionista
      const clientesNutricion = clientesAsignados
        .filter(cliente => cliente.tipoAsignacion === 'Nutricionista')
        .map(cliente => ({
          ...cliente,
          estadisticas: undefined,
          estadisticasSemanal: undefined,
          progresoComidas: undefined
        }));

      setClientes(clientesNutricion);
      
      // Seleccionar el primer cliente por defecto
      if (clientesNutricion.length > 0) {
        setClienteSeleccionado(clientesNutricion[0].clienteId);
      }
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar clientes inactivos
  const cargarClientesInactivos = useCallback(async () => {
    if (!user || user.role !== 'worker') return;

    try {
      setLoadingInactivos(true);
      const inactivos = await getClientesInactivos();
      setClientesInactivos(inactivos);
    } catch (err) {
      console.error('Error cargando clientes inactivos:', err);
    } finally {
      setLoadingInactivos(false);
    }
  }, [user]);

  // Cargar estadísticas del cliente seleccionado
  const cargarEstadisticasCliente = useCallback(async (clienteId: string) => {
    try {
      // Obtener estadísticas nutricionales del cliente
      const response = await getEstadisticasNutricionalesCliente(clienteId, semanaSeleccionada, añoSeleccionado);
      
      if (response.success) {
        // Actualizar el cliente con las estadísticas
        setClientes(prev => prev.map(c => 
          c.clienteId === clienteId 
            ? { 
                ...c, 
                estadisticas: response.estadisticas,
                estadisticasSemanal: response.estadisticasSemanal,
                progresoComidas: response.progresoComidas
              }
            : c
        ));
      }
    } catch (err) {
      console.error('Error cargando estadísticas del cliente:', err);
    }
  }, [semanaSeleccionada, añoSeleccionado]); // Removemos 'clientes' de las dependencias

  useEffect(() => {
    cargarClientes();
    cargarClientesInactivos();
  }, [cargarClientes, cargarClientesInactivos]);

  useEffect(() => {
    if (clienteSeleccionado) {
      cargarEstadisticasCliente(clienteSeleccionado);
    }
  }, [clienteSeleccionado, cargarEstadisticasCliente]);

  const clienteActual = clientes.find(c => c.clienteId === clienteSeleccionado);

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error" icon={<IconRefresh size={16} />}>
        {error}
        <Button 
          variant="light" 
          size="sm" 
          mt="sm" 
          onClick={cargarClientes}
        >
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (clientes.length === 0) {
    return (
      <Alert color="blue" title="Sin clientes" icon={<IconUsers size={16} />}>
        No tienes clientes asignados para seguimiento nutricional.
      </Alert>
    );
  }

  // Función para formatear la fecha
  const formatearFecha = (fecha: Date | null) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <Stack gap="xl">
      {/* Sección de Clientes Inactivos */}
      {clientesInactivos.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Group>
              <IconAlertCircle size={24} color="orange" />
              <Title order={4}>Clientes Inactivos</Title>
              <Badge color="orange" variant="filled">
                {clientesInactivos.length}
              </Badge>
            </Group>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconRefresh size={16} />}
              onClick={cargarClientesInactivos}
              loading={loadingInactivos}
            >
              Actualizar
            </Button>
          </Group>
          
          <Text size="sm" c="dimmed" mb="md">
            Estos clientes llevan 3 o más días sin registrar sus comidas
          </Text>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Días sin registro</Table.Th>
                <Table.Th>Último registro</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {clientesInactivos.map((cliente) => (
                <Table.Tr key={cliente.clienteId}>
                  <Table.Td>
                    <Text fw={500}>{cliente.nombreCliente}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{cliente.emailCliente}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={cliente.diasSinRegistro >= 7 ? 'red' : 'orange'} 
                      variant="light"
                      leftSection={<IconCalendarOff size={14} />}
                    >
                      {cliente.diasSinRegistro} días
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatearFecha(cliente.ultimoDiaRegistrado)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* Selector de cliente y semana */}
      <Paper p="md" radius="md" withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Cliente"
              placeholder="Seleccionar cliente"
              data={clientes.map(cliente => ({
                value: cliente.clienteId,
                label: cliente.cliente.fullName
              }))}
              value={clienteSeleccionado}
              onChange={(value) => setClienteSeleccionado(value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              label="Semana"
              placeholder="Seleccionar semana"
              data={Array.from({ length: 52 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Semana ${i + 1}`
              }))}
              value={semanaSeleccionada.toString()}
              onChange={(value) => setSemanaSeleccionada(parseInt(value || '1'))}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              label="Año"
              placeholder="Seleccionar año"
              data={Array.from({ length: 3 }, (_, i) => {
                const año = new Date().getFullYear() - i;
                return {
                  value: año.toString(),
                  label: año.toString()
                };
              })}
              value={añoSeleccionado.toString()}
              onChange={(value) => setAñoSeleccionado(parseInt(value || new Date().getFullYear().toString()))}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {clienteActual && (
        <>
          {/* Información del cliente */}
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" align="center">
              <div>
                <Text size="lg" fw={600}>{clienteActual.cliente.fullName}</Text>
                <Text size="sm" c="dimmed">{clienteActual.cliente.email}</Text>
              </div>
              {/* Solo mostrar "Cliente Activo" si NO está en la lista de inactivos */}
              {!clientesInactivos.some(inactivo => inactivo.clienteId === clienteActual.clienteId) && (
                <Badge color="nutroos-green" variant="light">
                  Cliente Activo
                </Badge>
              )}
            </Group>
          </Paper>

          {/* Estadísticas Generales del Cliente */}
          {clienteActual.estadisticas && (
            <EstadisticasGeneralesGrid 
              estadisticas={clienteActual.estadisticas} 
            />
          )}

          {/* Estadísticas Semanales */}
          {clienteActual.estadisticasSemanal && (
            <>
              <Divider my="md" />
              <EstadisticasSemanalesGrid 
                estadisticasSemanal={clienteActual.estadisticasSemanal}
                title={`🍎 Resumen de la Semana ${clienteActual.estadisticasSemanal.semana?.numero}`}
              />

              {/* Platos Favoritos del Cliente */}
              {clienteActual.progresoComidas && clienteActual.progresoComidas.length > 0 && (
                <>
                  <Divider my="md" />
                  <PlatosFavoritosGrid 
                    progresoComidas={clienteActual.progresoComidas}
                    title={`🏆 Platos Favoritos de ${clienteActual.cliente.fullName}`}
                    subtitle="Mejor satisfacción registrada"
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </Stack>
  );
};

export default ProgresoNutricionWorkerTab;
