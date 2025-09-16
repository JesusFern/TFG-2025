import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Title, 
  Alert, 
  Group,
  Avatar,
  Paper,
  Box,
  Grid,
  Card,
  Text,
  Badge,
  Button,
  Stack,
  Center,
  Loader,
  Image,
  ActionIcon,
  List,
  ThemeIcon,
  Modal
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerReceta, eliminarReceta, RecetaResponse } from '../services/recetaService';
import FormularioCrearReceta from '../components/forms/recetas/FormularioCrearReceta';
import { 
  IconAlertCircle, 
  IconChefHat, 
  IconArrowLeft, 
  IconClock, 
  IconUsers, 
  IconEdit,
  IconPhoto,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconX as IconCancel
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useDisclosure } from '@mantine/hooks';

const VerRecetaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receta, setReceta] = useState<RecetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deleting, setDeleting] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success', texto: string } | null>(null);

  const cargarReceta = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const recetaData = await obtenerReceta(id);
      setReceta(recetaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la receta');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      cargarReceta();
    }
  }, [id, cargarReceta]);

  const handleVolver = () => {
    navigate('/mis-recetas');
  };

  const handleEditar = () => {
    setModoEdicion(true);
  };

  const handleCancelarEdicion = () => {
    setModoEdicion(false);
    setMensaje(null);
  };

  const handleRecetaActualizada = () => {
    setMensaje({
      tipo: 'success',
      texto: 'Receta actualizada correctamente'
    });
    setModoEdicion(false);
    // Recargar la receta para mostrar los cambios
    cargarReceta();
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMensaje(null), 3000);
  };

  const handleErrorEdicion = (error: Error) => {
    setMensaje({
      tipo: 'error',
      texto: error.message || 'Error al actualizar la receta'
    });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleEliminar = async () => {
    if (!receta?._id) return;
    
    try {
      setDeleting(true);
      await eliminarReceta(receta._id);
      closeDeleteModal();
      navigate('/mis-recetas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la receta');
    } finally {
      setDeleting(false);
    }
  };

  const handleVerImagen = (index: number) => {
    setCurrentImageIndex(index);
    open();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (imagePath: string) => {
    return `${import.meta.env.VITE_BACKEND_HOST || 'http://localhost:5000'}${imagePath}`;
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center style={{ height: '50vh' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" color="nutroos-green" />
            <Text>Cargando receta...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error || !receta) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
          mb="md"
        >
          {error || 'Receta no encontrada'}
          <Button variant="white" color="red" size="sm" onClick={handleVolver} mt="sm">
            Volver
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Header con navegación */}
      <Paper 
        p="lg" 
        mb="xl" 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderColor: 'var(--app-border-color)' 
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Group gap="md">
            <ActionIcon
              variant="light"
              color="nutroos-green"
              size="lg"
              onClick={handleVolver}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            
            <Avatar 
              size="lg" 
              color="nutroos-green" 
              radius="xl"
            >
              <IconChefHat size="1.5rem" />
            </Avatar>
            
            <Box>
              <Title order={2} mb={5} c="nutroos-green.6">{receta.nombreReceta}</Title>
              <Group gap="md">
                <Badge 
                  color={receta.publica ? "green" : "orange"} 
                  variant="light"
                  leftSection={<IconUsers size={12} />}
                >
                  {receta.publica ? "Pública" : "Privada"}
                </Badge>
                {receta.tiempoPreparacion && (
                  <Badge 
                    color="blue" 
                    variant="light"
                    leftSection={<IconClock size={12} />}
                  >
                    {receta.tiempoPreparacion}
                  </Badge>
                )}
                {receta.createdAt && (
                  <Text size="sm" c="dimmed">
                    Creada: {formatDate(receta.createdAt)}
                  </Text>
                )}
              </Group>
            </Box>
          </Group>

          <Group gap="sm">
            {!modoEdicion ? (
              <>
                <Button
                  leftSection={<IconEdit size={16} />}
                  onClick={handleEditar}
                  color="nutroos-green"
                  variant="light"
                  size="md"
                >
                  Editar Receta
                </Button>
                
                <Button
                  leftSection={<IconTrash size={16} />}
                  onClick={openDeleteModal}
                  color="red"
                  variant="light"
                  size="md"
                >
                  Eliminar Receta
                </Button>
              </>
            ) : (
              <Button
                leftSection={<IconCancel size={16} />}
                onClick={handleCancelarEdicion}
                color="gray"
                variant="light"
                size="md"
              >
                Cancelar Edición
              </Button>
            )}
          </Group>
        </Group>
      </Paper>

      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            icon={<IconAlertCircle size={16} />}
            title={mensaje.tipo === 'error' ? 'Error' : 'Éxito'}
            color={mensaje.tipo === 'error' ? 'red' : 'green'}
            variant="filled"
            mb="md"
            withCloseButton
            onClose={() => setMensaje(null)}
          >
            {mensaje.texto}
          </Alert>
        </motion.div>
      )}

      {modoEdicion ? (
        <FormularioCrearReceta 
          onSuccess={handleRecetaActualizada}
          onError={handleErrorEdicion}
          modoEdicion={true}
          recetaInicial={receta}
        />
      ) : (
        <Grid>
        {/* Columna izquierda - Imágenes */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper 
            p="lg" 
            withBorder 
            radius="md"
            style={{ 
              backgroundColor: 'var(--app-paper-bg)', 
              borderColor: 'var(--app-border-color)' 
            }}
          >
            <Title order={3} mb="md" c="nutroos-green.6">
              <Group gap="xs">
                <IconPhoto size={20} />
                Imágenes de la Receta
              </Group>
            </Title>

            {receta.imagenes && receta.imagenes.length > 0 ? (
              <Grid>
                {receta.imagenes.map((imagen, index) => (
                  <Grid.Col key={index} span={6}>
                    <Card
                      shadow="sm"
                      padding="xs"
                      radius="md"
                      withBorder
                      style={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onClick={() => handleVerImagen(index)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Card.Section>
                        <Image
                          src={getImageUrl(imagen)}
                          height={120}
                          alt={`Imagen ${index + 1} de ${receta.nombreReceta}`}
                          style={{ borderRadius: 'var(--mantine-radius-md)' }}
                        />
                      </Card.Section>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Center style={{ height: 200 }}>
                <Stack align="center" gap="md">
                  <IconPhoto size={48} color="var(--mantine-color-dimmed)" />
                  <Text c="dimmed">No hay imágenes disponibles</Text>
                </Stack>
              </Center>
            )}
          </Paper>
        </Grid.Col>

        {/* Columna derecha - Información */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            {/* Ingredientes */}
            <Paper 
              p="lg" 
              withBorder 
              radius="md"
              style={{ 
                backgroundColor: 'var(--app-paper-bg)', 
                borderColor: 'var(--app-border-color)' 
              }}
            >
              <Title order={3} mb="md" c="nutroos-green.6">
                <Group gap="xs">
                  <IconChefHat size={20} />
                  Ingredientes ({receta.ingredientes.length})
                </Group>
              </Title>
              
              <List spacing="xs" size="sm">
                {receta.ingredientes.map((ingrediente, index) => (
                  <List.Item
                    key={index}
                    icon={
                      <ThemeIcon color="nutroos-green" size={20} radius="xl">
                        {index + 1}
                      </ThemeIcon>
                    }
                  >
                    {ingrediente}
                  </List.Item>
                ))}
              </List>
            </Paper>

            {/* Pasos de preparación */}
            {receta.pasosPreparacion && receta.pasosPreparacion.length > 0 && (
              <Paper 
                p="lg" 
                withBorder 
                radius="md"
                style={{ 
                  backgroundColor: 'var(--app-paper-bg)', 
                  borderColor: 'var(--app-border-color)' 
                }}
              >
                <Title order={3} mb="md" c="nutroos-green.6">
                  Pasos de Preparación
                </Title>
                
                <List spacing="md" size="sm">
                  {receta.pasosPreparacion.map((paso, index) => (
                    <List.Item
                      key={index}
                      icon={
                        <ThemeIcon color="nutroos-green" size={24} radius="xl">
                          {index + 1}
                        </ThemeIcon>
                      }
                    >
                      <Text>{paso}</Text>
                    </List.Item>
                  ))}
                </List>
              </Paper>
            )}

            {/* Información nutricional */}
            {receta.informacionNutricional && (
              <Paper 
                p="lg" 
                withBorder 
                radius="md"
                style={{ 
                  backgroundColor: 'var(--app-paper-bg)', 
                  borderColor: 'var(--app-border-color)' 
                }}
              >
                <Title order={3} mb="md" c="nutroos-green.6">
                  Información Nutricional
                </Title>
                <Text>{receta.informacionNutricional}</Text>
              </Paper>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
      )}

      {/* Modal para ver imágenes en grande */}
      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        centered
        title={
          <Group gap="xs">
            <IconPhoto size={20} />
            <Text>{receta.nombreReceta}</Text>
          </Group>
        }
      >
        {receta.imagenes && receta.imagenes.length > 0 && (
          <Box>
            <Box style={{ position: 'relative' }}>
              <Image
                src={getImageUrl(receta.imagenes[currentImageIndex])}
                height={400}
                alt={`Imagen ${currentImageIndex + 1} de ${receta.nombreReceta}`}
                fit="contain"
              />
              
              {/* Botones de navegación */}
              {receta.imagenes.length > 1 && (
                <>
                  <ActionIcon
                    variant="filled"
                    color="nutroos-green"
                    size="lg"
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10
                    }}
                    onClick={() => setCurrentImageIndex(
                      currentImageIndex === 0 
                        ? receta.imagenes.length - 1 
                        : currentImageIndex - 1
                    )}
                  >
                    <IconChevronLeft size={20} />
                  </ActionIcon>
                  
                  <ActionIcon
                    variant="filled"
                    color="nutroos-green"
                    size="lg"
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10
                    }}
                    onClick={() => setCurrentImageIndex(
                      currentImageIndex === receta.imagenes.length - 1 
                        ? 0 
                        : currentImageIndex + 1
                    )}
                  >
                    <IconChevronRight size={20} />
                  </ActionIcon>
                </>
              )}
            </Box>
            
            {/* Indicadores */}
            {receta.imagenes.length > 1 && (
              <Group justify="center" mt="md" gap="xs">
                {receta.imagenes.map((_, index) => (
                  <ActionIcon
                    key={index}
                    variant={index === currentImageIndex ? "filled" : "light"}
                    color="nutroos-green"
                    size="sm"
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    {index + 1}
                  </ActionIcon>
                ))}
              </Group>
            )}
            
            <Group justify="center" mt="md">
              <Text size="sm" c="dimmed">
                Imagen {currentImageIndex + 1} de {receta.imagenes.length}
              </Text>
            </Group>
          </Box>
        )}
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirmar eliminación"
        centered
      >
        <Stack gap="md">
          <Text>
            ¿Estás seguro de que quieres eliminar la receta "{receta?.nombreReceta}"?
          </Text>
          <Text size="sm" c="dimmed">
            Esta acción no se puede deshacer. Se eliminarán todos los datos de la receta, incluyendo las imágenes.
          </Text>
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleEliminar}
              loading={deleting}
              leftSection={<IconTrash size={16} />}
            >
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default VerRecetaPage;
