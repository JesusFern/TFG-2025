import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  Loader,
  Center,
  Grid,
  Image,
  Modal,
  Alert,
  Divider,
  Box,
  Select,
  TextInput,
  Pagination,
  Card,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { 
  IconPlus, 
  IconEye,
  IconAlertCircle, 
  IconTrash,
  IconSearch,
  IconFilter,
  IconCheck,
  IconClock,
  IconArrowLeft
} from '@tabler/icons-react';
import { IncidentService, IncidenciaResponse } from '../services/incidentService';
import { useAuth } from '../hooks/useAuth';

const ListadoIncidenciasPage: React.FC = () => {
  const [incidencias, setIncidencias] = useState<IncidenciaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncidencia, setSelectedIncidencia] = useState<IncidenciaResponse | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [imageModalOpened, setImageModalOpened] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const loadIncidencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar incidencias según el rol
      const data = isAdmin 
        ? await IncidentService.obtenerTodasLasIncidencias()
        : await IncidentService.obtenerMisIncidencias();
      
      // Aplicar filtros
      let incidenciasFiltradas = data;
      
      if (filtroEstado) {
        incidenciasFiltradas = incidenciasFiltradas.filter(inc => inc.estado === filtroEstado);
      }
      
      if (busqueda.trim()) {
        const terminoBusqueda = busqueda.toLowerCase();
        incidenciasFiltradas = incidenciasFiltradas.filter(inc => 
          inc.descripcion.toLowerCase().includes(terminoBusqueda)
        );
      }
      
      // Calcular paginación
      const totalItems = incidenciasFiltradas.length;
      const totalPagesCalculadas = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(totalPagesCalculadas);
      
      // Aplicar paginación
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const incidenciasPaginadas = incidenciasFiltradas.slice(startIndex, endIndex);
      
      setIncidencias(incidenciasPaginadas);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las incidencias');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, currentPage, filtroEstado, busqueda, itemsPerPage]);

  useEffect(() => {
    loadIncidencias();
  }, [loadIncidencias]);


  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Resuelta':
        return 'green';
      case 'En proceso de resolución':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Resuelta':
        return <IconCheck size={16} />;
      case 'En proceso de resolución':
        return <IconClock size={16} />;
      default:
        return <IconAlertCircle size={16} />;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerDetalle = (incidencia: IncidenciaResponse) => {
    console.log('Ver detalle de incidencia:', incidencia);
    console.log('Imágenes de la incidencia:', incidencia.imagenes);
    setSelectedIncidencia(incidencia);
    setModalOpened(true);
  };

  const handleCrearIncidencia = () => {
    navigate('/incidencias/crear');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleEliminarIncidencia = async (incidenciaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta incidencia?')) {
      return;
    }

    try {
      setDeletingId(incidenciaId);
      await IncidentService.eliminarIncidencia(incidenciaId);
      await loadIncidencias();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la incidencia');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarcarComoResuelta = async (incidenciaId: string) => {
    if (!confirm('¿Estás seguro de que quieres marcar esta incidencia como resuelta?')) {
      return;
    }

    try {
      setResolvingId(incidenciaId);
      await IncidentService.marcarComoResuelta(incidenciaId);
      await loadIncidencias();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al marcar la incidencia como resuelta');
    } finally {
      setResolvingId(null);
    }
  };

  const handleAsignarIncidencia = async (incidenciaId: string) => {
    try {
      setResolvingId(incidenciaId);
      await IncidentService.asignarIncidencia(incidenciaId);
      await loadIncidencias();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al asignar la incidencia');
    } finally {
      setResolvingId(null);
    }
  };

  const canDeleteIncidencia = (incidencia: IncidenciaResponse) => {
    if (isAdmin) return false; // Los admins no pueden eliminar incidencias
    return incidencia.estado !== 'Resuelta';
  };

  const handleImageClick = (imageUrl: string) => {
    console.log('Click en imagen, URL:', imageUrl);
    console.log('VITE_BACKEND_HOST:', import.meta.env.VITE_BACKEND_HOST);
    setSelectedImage(imageUrl);
    setImageModalOpened(true);
  };

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setBusqueda('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Cargando incidencias...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Paper p="xl" radius="lg" withBorder>
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Title order={2}>
                {isAdmin ? 'Gestión de Incidencias' : 'Mis Incidencias'}
              </Title>
              <Text c="dimmed">
                {isAdmin 
                  ? 'Administra y resuelve las incidencias reportadas por usuarios'
                  : 'Gestiona y revisa el estado de tus incidencias reportadas'
                }
              </Text>
            </Stack>
            <Group>
              {!isAdmin && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  color="nutroos-green"
                  onClick={handleCrearIncidencia}
                >
                  Crear Incidencia
                </Button>
              )}
              <Button
                leftSection={<IconArrowLeft size={16} />}
                variant="light"
                onClick={handleBackToDashboard}
              >
                Volver al Dashboard
              </Button>
              <Badge color="blue" variant="light" size="lg">
                {incidencias.length} incidencias
              </Badge>
            </Group>
          </Group>
        </Paper>

        {/* Filtros - Solo para admin */}
        {isAdmin && (
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={4}>Filtros</Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Select
                    label="Estado"
                    placeholder="Todos los estados"
                    value={filtroEstado}
                    onChange={(value) => {
                      setFiltroEstado(value || '');
                      setCurrentPage(1);
                    }}
                    data={[
                      { value: '', label: 'Todos los estados' },
                      { value: 'Por resolver', label: 'Por resolver' },
                      { value: 'En proceso de resolución', label: 'En proceso de resolución' },
                      { value: 'Resuelta', label: 'Resuelta' }
                    ]}
                    leftSection={<IconFilter size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <TextInput
                    label="Buscar"
                    placeholder="Buscar por descripción..."
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.currentTarget.value);
                      setCurrentPage(1);
                    }}
                    leftSection={<IconSearch size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Button
                    variant="light"
                    color="gray"
                    onClick={limpiarFiltros}
                    fullWidth
                    style={{ marginTop: '1.5rem' }}
                  >
                    Limpiar Filtros
                  </Button>
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>
        )}

        {/* Error */}
        {error && (
          <Alert color="red" variant="light" icon={<IconAlertCircle size={16} />}>
            {error}
          </Alert>
        )}

        {/* Lista de Incidencias */}
        {incidencias.length === 0 ? (
          <Paper p="xl" radius="lg" withBorder>
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconAlertCircle size={48} color="var(--mantine-color-gray-5)" />
                <Text size="lg" fw={500} c="dimmed">
                  {isAdmin 
                    ? (filtroEstado || busqueda 
                        ? 'No se encontraron incidencias con los filtros aplicados'
                        : 'No hay incidencias registradas'
                      )
                    : 'No tienes incidencias reportadas'
                  }
                </Text>
                <Text c="dimmed" ta="center">
                  {isAdmin 
                    ? 'Las incidencias reportadas por usuarios aparecerán aquí'
                    : 'Cuando reportes un problema, aparecerá aquí con su estado actual'
                  }
                </Text>
                {!isAdmin && (
                  <Button
                    leftSection={<IconPlus size={16} />}
                    color="nutroos-green"
                    onClick={handleCrearIncidencia}
                  >
                    Crear una incidencia
                  </Button>
                )}
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Grid gutter="md">
            {incidencias.map((incidencia) => (
              <Grid.Col key={incidencia.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Stack justify="space-between" h="100%">
                    <div>
                      <Group justify="space-between" align="flex-start" mb="md">
                        <Badge 
                          color={getEstadoColor(incidencia.estado)} 
                          variant="light"
                          leftSection={getEstadoIcon(incidencia.estado)}
                        >
                          {incidencia.estado}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {formatDate(incidencia.createdAt)}
                        </Text>
                      </Group>
                      
                      <Text size="sm" lineClamp={3} mb="md">
                        {incidencia.descripcion}
                      </Text>
                      
                      {/* Información del creador (solo para admin) */}
                      {isAdmin && incidencia.creador && (
                        <Text size="xs" c="dimmed" mb="sm">
                          👤 Creado por: <strong>{incidencia.creador.fullName}</strong> ({incidencia.creador.email})
                          {incidencia.creador.workerType && ` - ${incidencia.creador.workerType}`}
                        </Text>
                      )}
                      
                      {incidencia.imagenes && incidencia.imagenes.length > 0 && (
                        <Text size="xs" c="dimmed" mb="md">
                          📷 {incidencia.imagenes.length} imagen(es) adjunta(s)
                        </Text>
                      )}
                    </div>
                    
                    <div>
                      <Group justify="space-between">
                        <Button
                          variant="light"
                          size="sm"
                          leftSection={<IconEye size={16} />}
                          onClick={() => handleVerDetalle(incidencia)}
                        >
                          Ver Detalle
                        </Button>
                        
                        {/* Botones de acción para admin */}
                        {isAdmin && incidencia.estado === 'Por resolver' && (
                          <Button
                            color="yellow"
                            size="sm"
                            loading={resolvingId === incidencia.id}
                            onClick={() => handleAsignarIncidencia(incidencia.id)}
                          >
                            Asignar
                          </Button>
                        )}
                        
                        {isAdmin && incidencia.estado === 'En proceso de resolución' && (
                          <Button
                            color="green"
                            size="sm"
                            loading={resolvingId === incidencia.id}
                            onClick={() => handleMarcarComoResuelta(incidencia.id)}
                          >
                            Marcar como Resuelta
                          </Button>
                        )}
                        
                        {/* Botón eliminar para usuarios */}
                        {!isAdmin && canDeleteIncidencia(incidencia) && (
                          <Button
                            variant="light"
                            color="red"
                            size="sm"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => handleEliminarIncidencia(incidencia.id)}
                            loading={deletingId === incidencia.id}
                          >
                            Eliminar
                          </Button>
                        )}
                      </Group>
                    </div>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <Center>
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="sm"
            />
          </Center>
        )}

        {/* Modal de Detalle */}
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title="Detalle de la Incidencia"
          size="xl"
          centered
          yOffset="5vh"
          zIndex={1000}
          styles={{ 
            content: { 
              maxHeight: '80vh', 
              overflow: 'auto',
              zIndex: 1000,
              width: '95vw',
              maxWidth: '1400px'
            },
            overlay: {
              zIndex: 999
            }
          }}
        >
          {selectedIncidencia && (
            <Stack gap="sm">
              <Group justify="space-between">
                <Badge 
                  color={getEstadoColor(selectedIncidencia.estado)} 
                  variant="light"
                  leftSection={getEstadoIcon(selectedIncidencia.estado)}
                  size="md"
                >
                  {selectedIncidencia.estado}
                </Badge>
                <Text size="sm" c="dimmed">
                  {formatDate(selectedIncidencia.createdAt)}
                </Text>
              </Group>
              
              <Divider />
              
              <div>
                <Text fw={500} mb="xs" size="sm">Descripción:</Text>
                <Text size="sm">{selectedIncidencia.descripcion}</Text>
              </div>
              
              {selectedIncidencia.imagenes && selectedIncidencia.imagenes.length > 0 && (
                <div>
                  <Text fw={500} mb="sm" size="sm">Imágenes adjuntas:</Text>
                  <Grid gutter="md">
                    {selectedIncidencia.imagenes.map((imagen, index) => (
                      <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                        <Box
                          style={{
                            cursor: 'pointer',
                            position: 'relative',
                            borderRadius: 8,
                            overflow: 'hidden',
                            border: '2px solid transparent',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--mantine-color-blue-4)';
                            e.currentTarget.style.transform = 'scale(1.02)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          onClick={() => handleImageClick(`${import.meta.env.VITE_BACKEND_HOST}/uploads/incidencias/${selectedIncidencia.id}/${imagen}`)}
                        >
                          <Image
                            src={`${import.meta.env.VITE_BACKEND_HOST}/uploads/incidencias/${selectedIncidencia.id}/${imagen}`}
                            alt={`Imagen ${index + 1}`}
                            height={220}
                            fit="cover"
                            fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=="
                            onError={() => {
                              console.error('Error cargando imagen:', imagen);
                              console.error('URL intentada:', `${import.meta.env.VITE_BACKEND_HOST}/uploads/incidencias/${selectedIncidencia.id}/${imagen}`);
                            }}
                          />
                          <Box
                            pos="absolute"
                            top={4}
                            right={4}
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: '10px'
                            }}
                          >
                            Click para ampliar
                          </Box>
                        </Box>
                      </Grid.Col>
                    ))}
                  </Grid>
                </div>
              )}
              
              <Divider />
              
              <Group justify="flex-end">
                {/* Botones de acción para admin */}
                {isAdmin && selectedIncidencia.estado === 'Por resolver' && (
                  <Button
                    color="yellow"
                    loading={resolvingId === selectedIncidencia.id}
                    onClick={() => handleAsignarIncidencia(selectedIncidencia.id)}
                  >
                    Asignar a Mí
                  </Button>
                )}
                
                {isAdmin && selectedIncidencia.estado === 'En proceso de resolución' && (
                  <Button
                    color="green"
                    loading={resolvingId === selectedIncidencia.id}
                    onClick={() => handleMarcarComoResuelta(selectedIncidencia.id)}
                  >
                    Marcar como Resuelta
                  </Button>
                )}
                
                <Button variant="light" onClick={() => setModalOpened(false)}>
                  Cerrar
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Modal de Imagen Ampliada */}
        <Modal
          opened={imageModalOpened}
          onClose={() => setImageModalOpened(false)}
          title="Imagen Ampliada"
          size="xl"
          centered
          yOffset="3vh"
          zIndex={1001}
          styles={{ 
            content: { 
              maxHeight: '90vh', 
              overflow: 'auto',
              zIndex: 1001,
              width: '90vw',
              maxWidth: '1200px'
            },
            overlay: {
              zIndex: 1000
            }
          }}
        >
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Imagen ampliada"
              fit="contain"
              style={{ maxHeight: '80vh' }}
              fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=="
              onError={() => {
                console.error('Error cargando imagen ampliada:', selectedImage);
              }}
            />
          )}
        </Modal>
      </Stack>
    </Container>
  );
};

export default ListadoIncidenciasPage;
