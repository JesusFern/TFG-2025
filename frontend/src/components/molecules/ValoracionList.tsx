import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Button,
  TextInput,
  Select,
  Grid,
  Pagination,
  Loader,
  Alert,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { 
  IconSearch, 
  IconFilter, 
  IconPlus, 
  IconRefresh,
  IconStar
} from '@tabler/icons-react';
import { Valoracion, FiltrosValoraciones, TipoTrabajador } from '../../types/valoraciones';
import { ValoracionService } from '../../services/valoracionService';
import ValoracionCard from './ValoracionCard';

interface ValoracionListProps {
  trabajadorId?: string;
  clienteId?: string;
  showFilters?: boolean;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  onEditClick?: (valoracion: Valoracion) => void;
  onDeleteClick?: (valoracion: Valoracion) => void;
  compact?: boolean;
}

const ValoracionList: React.FC<ValoracionListProps> = ({
  trabajadorId,
  clienteId,
  showFilters = true,
  showCreateButton = false,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  compact = false
}) => {

  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [filtros, setFiltros] = useState<FiltrosValoraciones>({
    trabajadorId,
    clienteId,
    page: 1,
    limit,
    sortBy: 'fechaValoracion',
    sortOrder: 'desc'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCalificacion, setFiltroCalificacion] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');

  const cargarValoraciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ValoracionService.obtenerValoraciones(filtros);
      setValoraciones(response.data);
      setTotal(response.total);
      setPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las valoraciones');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarValoraciones();
  }, [filtros, cargarValoraciones]);

  const handleSearch = () => {
    setFiltros(prev => ({
      ...prev,
      page: 1,
      calificacion: filtroCalificacion ? parseInt(filtroCalificacion) : undefined,
      tipoTrabajador: filtroTipo as TipoTrabajador || undefined
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFiltros(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleRefresh = () => {
    cargarValoraciones();
  };


  if (loading && valoraciones.length === 0) {
    return (
      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Group justify="center">
          <Loader size="md" />
          <Text>Cargando valoraciones...</Text>
        </Group>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* Filtros */}
      {showFilters && (
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text size="md" fw={600}>
                Filtros
              </Text>
              <Group gap="xs">
                <Tooltip label="Actualizar">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={handleRefresh}
                    loading={loading}
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Tooltip>
                {showCreateButton && onCreateClick && (
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={onCreateClick}
                    size="sm"
                  >
                    Nueva Valoración
                  </Button>
                )}
              </Group>
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  placeholder="Buscar en descripciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftSection={<IconSearch size={16} />}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 3 }}>
                <Select
                  placeholder="Calificación"
                  data={[
                    { value: '', label: 'Todas las calificaciones' },
                    { value: '5', label: '5 estrellas' },
                    { value: '4', label: '4 estrellas' },
                    { value: '3', label: '3 estrellas' },
                    { value: '2', label: '2 estrellas' },
                    { value: '1', label: '1 estrella' }
                  ]}
                  value={filtroCalificacion}
                  onChange={(value) => setFiltroCalificacion(value || '')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 3 }}>
                <Select
                  placeholder="Tipo de trabajador"
                  data={[
                    { value: '', label: 'Todos los tipos' },
                    { value: 'Nutricionista', label: 'Nutricionista' },
                    { value: 'Entrenador personal', label: 'Entrenador personal' }
                  ]}
                  value={filtroTipo}
                  onChange={(value) => setFiltroTipo(value || '')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 2 }}>
                <Button
                  fullWidth
                  leftSection={<IconFilter size={16} />}
                  onClick={handleSearch}
                  loading={loading}
                >
                  Filtrar
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert
          icon={<IconSearch size={16} />}
          title="Error"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      )}

      {/* Lista de valoraciones */}
      {valoraciones.length === 0 && !loading ? (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconStar size={48} color="dimmed" />
            <Text size="lg" fw={500} c="dimmed">
              No hay valoraciones disponibles
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              {showCreateButton 
                ? 'Crea la primera valoración para este profesional'
                : 'No se encontraron valoraciones con los filtros aplicados'
              }
            </Text>
            {showCreateButton && onCreateClick && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={onCreateClick}
              >
                Crear Valoración
              </Button>
            )}
          </Stack>
        </Card>
      ) : (
        <Stack gap="md">
          {valoraciones.map((valoracion) => (
            <ValoracionCard
              key={valoracion._id}
              valoracion={valoracion}
              onEdit={onEditClick}
              onDelete={onDeleteClick}
              showActions={!!(onEditClick || onDeleteClick)}
              compact={compact}
            />
          ))}

          {/* Paginación */}
          {total > limit && (
            <Group justify="center" mt="md">
              <Pagination
                value={page}
                onChange={handlePageChange}
                total={Math.ceil(total / limit)}
                size="sm"
              />
            </Group>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default ValoracionList;
