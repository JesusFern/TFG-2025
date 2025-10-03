import React from 'react';
import {
  Paper,
  Group,
  Select,
  Button,
  TextInput,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Grid
} from '@mantine/core';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import DatePickerInput from '../atoms/DatePickerInput';
import { FiltrosCitas as FiltrosCitasType, TipoCita, EstadoCita } from '../../types/citas';
import {
  IconSearch,
  IconFilter,
  IconX,
  IconCalendar,
  IconUser,
  IconStethoscope,
  IconFileText,
  IconClock
} from '@tabler/icons-react';

interface FiltrosCitasProps {
  filtros: FiltrosCitasType;
  onFiltrosChange: (filtros: FiltrosCitasType) => void;
  onLimpiarFiltros: () => void;
  totalResultados: number;
  loading?: boolean;
  showProfessionalFilter?: boolean;
  showClientFilter?: boolean;
}

const FiltrosCitas: React.FC<FiltrosCitasProps> = ({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros,
  totalResultados,
  loading = false,
  showProfessionalFilter = false,
  showClientFilter = false
}) => {
  const isDark = useThemeDetection();

  const tiposCita: { value: TipoCita; label: string }[] = [
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'consulta_nutricion', label: 'Consulta Nutricional' },
    { value: 'consulta_entrenamiento', label: 'Consulta de Entrenamiento' },
    { value: 'evaluacion', label: 'Evaluación' },
    { value: 'revision', label: 'Revisión' }
  ];

  const estadosCita: { value: EstadoCita; label: string }[] = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'reagendada', label: 'Reagendada' }
  ];

  const handleFiltroChange = (key: keyof FiltrosCitasType, value: string | null) => {
    onFiltrosChange({
      ...filtros,
      [key]: value || undefined
    });
  };

  const handleFechaChange = (key: 'fechaDesde' | 'fechaHasta', value: Date | null): void => {
    onFiltrosChange({
      ...filtros,
      [key]: value ? value.toISOString().split('T')[0] : undefined
    });
  };

  const tieneFiltrosActivos = () => {
    // Excluir filtros internos del conteo (estadosActivos, limit, offset)
    const filtrosVisibles = { ...filtros };
    delete filtrosVisibles.estadosActivos;
    delete filtrosVisibles.limit;
    delete filtrosVisibles.offset;
    
    return Object.values(filtrosVisibles).some(value => value !== undefined && value !== '');
  };

  const contarFiltrosActivos = () => {
    // Excluir filtros internos del conteo (estadosActivos, limit, offset)
    const filtrosVisibles = { ...filtros };
    delete filtrosVisibles.estadosActivos;
    delete filtrosVisibles.limit;
    delete filtrosVisibles.offset;
    
    return Object.values(filtrosVisibles).filter(value => value !== undefined && value !== '').length;
  };

  return (
    <Paper p="md" radius="md" withBorder bg={isDark ? 'dark.6' : 'white'}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconFilter size={20} color="var(--mantine-color-blue-6)" />
            <Text size="lg" fw={600} c={isDark ? 'white' : 'dark'}>
              Filtros
            </Text>
            {tieneFiltrosActivos() && (
              <Badge color="blue" variant="light" size="sm">
                {contarFiltrosActivos()} activos
              </Badge>
            )}
          </Group>
          
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {totalResultados} resultado{totalResultados !== 1 ? 's' : ''}
            </Text>
            {tieneFiltrosActivos() && (
              <Tooltip label="Limpiar filtros">
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={onLimpiarFiltros}
                  disabled={loading}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        <Grid>
          {/* Filtro por tipo */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <div>
              <Text size="sm" fw={500} mb="xs">
                Tipo de Cita
              </Text>
              <Select
                placeholder="Todos los tipos"
                data={tiposCita}
                leftSection={<IconFileText size={16} />}
                clearable
                value={filtros.tipo || null}
                onChange={(value) => handleFiltroChange('tipo', value)}
                disabled={loading}
              />
            </div>
          </Grid.Col>

          {/* Filtro por estado */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <div>
              <Text size="sm" fw={500} mb="xs">
                Estado
              </Text>
              <Select
                placeholder="Todos los estados"
                data={estadosCita}
                leftSection={<IconClock size={16} />}
                clearable
                value={filtros.estado || null}
                onChange={(value) => handleFiltroChange('estado', value)}
                disabled={loading}
              />
            </div>
          </Grid.Col>

          {/* Filtro por profesional */}
          {showProfessionalFilter && (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Profesional
                </Text>
                <TextInput
                  placeholder="Buscar por nombre..."
                  leftSection={<IconStethoscope size={16} />}
                  value={filtros.profesional || ''}
                  onChange={(event) => handleFiltroChange('profesional', event.currentTarget.value)}
                  disabled={loading}
                />
              </div>
            </Grid.Col>
          )}

          {/* Filtro por cliente */}
          {showClientFilter && (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Cliente
                </Text>
                <TextInput
                  placeholder="Buscar por nombre..."
                  leftSection={<IconUser size={16} />}
                  value={filtros.cliente || ''}
                  onChange={(event) => handleFiltroChange('cliente', event.currentTarget.value)}
                  disabled={loading}
                />
              </div>
            </Grid.Col>
          )}

          {/* Filtro por fecha desde */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <div>
              <Text size="sm" fw={500} mb="xs">
                Fecha Desde
              </Text>
              <DatePickerInput
                placeholder="Seleccionar fecha"
                leftSection={<IconCalendar size={16} />}
                value={filtros.fechaDesde ? new Date(filtros.fechaDesde) : null}
                onChange={(value: Date | null) => handleFechaChange('fechaDesde', value)}
                disabled={loading}
                clearable
              />
            </div>
          </Grid.Col>

          {/* Filtro por fecha hasta */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <div>
              <Text size="sm" fw={500} mb="xs">
                Fecha Hasta
              </Text>
              <DatePickerInput
                placeholder="Seleccionar fecha"
                leftSection={<IconCalendar size={16} />}
                value={filtros.fechaHasta ? new Date(filtros.fechaHasta) : null}
                onChange={(value: Date | null) => handleFechaChange('fechaHasta', value)}
                disabled={loading}
                clearable
                minDate={filtros.fechaDesde ? new Date(filtros.fechaDesde) : undefined}
              />
            </div>
          </Grid.Col>

          {/* Botón de búsqueda */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <div style={{ display: 'flex', alignItems: 'end', height: '100%' }}>
              <Button
                fullWidth
                leftSection={<IconSearch size={16} />}
                onClick={() => {}} // Los filtros se aplican automáticamente
                disabled={loading}
                variant="light"
              >
                Buscar
              </Button>
            </div>
          </Grid.Col>
        </Grid>

        {/* Filtros activos */}
        {tieneFiltrosActivos() && (
          <Group gap="xs" wrap="wrap">
            <Text size="sm" c="dimmed">
              Filtros activos:
            </Text>
            {filtros.tipo && (
              <Badge color="blue" variant="light" size="sm">
                Tipo: {tiposCita.find(t => t.value === filtros.tipo)?.label}
              </Badge>
            )}
            {filtros.estado && (
              <Badge color="green" variant="light" size="sm">
                Estado: {estadosCita.find(e => e.value === filtros.estado)?.label}
              </Badge>
            )}
            {filtros.profesional && (
              <Badge color="orange" variant="light" size="sm">
                Profesional: {filtros.profesional}
              </Badge>
            )}
            {filtros.cliente && (
              <Badge color="purple" variant="light" size="sm">
                Cliente: {filtros.cliente}
              </Badge>
            )}
            {filtros.fechaDesde && (
              <Badge color="teal" variant="light" size="sm">
                Desde: {new Date(filtros.fechaDesde).toLocaleDateString('es-ES')}
              </Badge>
            )}
            {filtros.fechaHasta && (
              <Badge color="cyan" variant="light" size="sm">
                Hasta: {new Date(filtros.fechaHasta).toLocaleDateString('es-ES')}
              </Badge>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
};

export default FiltrosCitas;
