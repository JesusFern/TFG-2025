import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Alert, 
  Group,
  Paper,
  Box,
  Grid,
  Card,
  Text,
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
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { eliminarReceta } from '../services/recetaService';
import { Ingrediente, IngredientePoblado } from '../types/diets';
import FormularioCrearReceta from '../components/forms/recetas/FormularioCrearReceta';
import { useReceta } from '../hooks/useReceta';
import { useAuth } from '../hooks/useAuth';
import RecetaHeader from '../components/molecules/RecetaHeader';
import StatusMessage from '../components/molecules/StatusMessage';
import { 
  IconAlertCircle, 
  IconChefHat, 
  IconEdit,
  IconPhoto,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconX as IconCancel,
  IconArrowLeft
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

const VerRecetaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { receta, loading, error, cargarReceta } = useReceta(id);
  const [opened, { open, close }] = useDisclosure(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deleting, setDeleting] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success', texto: string } | null>(null);

  // Determinar si se viene de una dieta y el texto apropiado
  const fromDieta = location.state?.fromDieta;
  const dietaId = location.state?.dietaId;

  // Verificar permisos de edición/eliminación
  const canEdit = user && (
    user.role === 'admin' || 
    (user.role === 'worker' && receta?.creador === user._id)
  );
  const canDelete = canEdit; // Mismos permisos para editar y eliminar

  const handleVolver = () => {
    if (fromDieta && dietaId) {
      // Si se viene de una dieta, volver a esa dieta
      navigate(`/ver-dieta/${dietaId}`);
    } else {
      // Si no, volver a mis recetas como comportamiento por defecto
      navigate('/mis-recetas');
    }
  };

  const handleEditar = () => {
    if (canEdit) {
      setModoEdicion(true);
    }
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
      setMensaje({
        tipo: 'error',
        texto: err instanceof Error ? err.message : 'Error al eliminar la receta'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleVerImagen = (index: number) => {
    setCurrentImageIndex(index);
    open();
  };


  const getImageUrl = (imagePath: string) => {
    // Si la imagen ya es una URL completa, usarla tal cual
    // Si es una ruta relativa, usarla directamente (será servida por el mismo servidor)
    return imagePath;
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
      <RecetaHeader 
        receta={receta} 
        onVolver={handleVolver}
        showBackButton={false}
      >
        {/* Botón de volver personalizado */}
        <Button
          variant="light"
          color="nutroos-green"
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleVolver}
          size="md"
        >
          {fromDieta ? 'Volver a la dieta' : 'Volver a mis recetas'}
        </Button>
        {!modoEdicion ? (
          <>
            {canEdit && (
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={handleEditar}
                color="nutroos-green"
                variant="light"
                size="md"
              >
                Editar Receta
              </Button>
            )}
            
            {canDelete && (
              <Button
                leftSection={<IconTrash size={16} />}
                onClick={openDeleteModal}
                color="red"
                variant="light"
                size="md"
              >
                Eliminar Receta
              </Button>
            )}
          </>
        ) : (
          canEdit && (
            <Button
              leftSection={<IconCancel size={16} />}
              onClick={handleCancelarEdicion}
              color="gray"
              variant="light"
              size="md"
            >
              Cancelar Edición
            </Button>
          )
        )}
      </RecetaHeader>

      <StatusMessage 
        mensaje={mensaje} 
        onClose={() => setMensaje(null)}
        showSpace={false}
      />

      {modoEdicion ? (
        <FormularioCrearReceta 
          onSuccess={handleRecetaActualizada}
          onError={handleErrorEdicion}
          modoEdicion={true}
          recetaInicial={receta}
        />
      ) : (
        <Grid>
        {/* Columna izquierda - Imágenes, Pasos e Información Nutricional */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            {/* Imágenes */}
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
                            height={250}
                            alt={`Imagen ${index + 1} de ${receta.nombreReceta}`}
                            style={{ borderRadius: 'var(--mantine-radius-md)' }}
                            fit="contain"
                          />
                        </Card.Section>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              ) : (
                <Center style={{ height: 300 }}>
                  <Stack align="center" gap="md">
                    <IconPhoto size={48} color="var(--mantine-color-dimmed)" />
                    <Text c="dimmed">No hay imágenes disponibles</Text>
                  </Stack>
                </Center>
              )}
            </Paper>

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
                  Información Nutricional Total
                </Title>
                <Text size="sm" c="dimmed" mb="sm">
                  Valores calculados para todos los ingredientes
                </Text>
                <Text>{receta.informacionNutricional}</Text>
              </Paper>
            )}

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
          </Stack>
        </Grid.Col>

        {/* Columna derecha - Solo Ingredientes */}
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
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text fw={500}>
                        {typeof ingrediente === 'string' 
                          ? ingrediente 
                          : 'ingrediente' in ingrediente 
                            ? (ingrediente as unknown as IngredientePoblado).ingrediente?.nombre || 'Ingrediente'
                            : (ingrediente as Ingrediente).nombre || 'Ingrediente'
                        }
                      </Text>
                      <Text size="xs" c="dimmed">
                        {typeof ingrediente === 'object' && 'peso' in ingrediente 
                          ? `${(ingrediente as unknown as IngredientePoblado).peso}g`
                          : typeof ingrediente === 'object' && 'peso' in ingrediente
                            ? `${(ingrediente as Ingrediente).peso}g`
                            : '100g'
                        }
                      </Text>
                      {/* Mostrar información nutricional si está disponible */}
                      {typeof ingrediente === 'object' && 'ingrediente' in ingrediente && (ingrediente as unknown as IngredientePoblado).ingrediente && (
                        <Text size="xs" c="dimmed" mt="xs">
                          📊 Calorías: {Math.round(((ingrediente as unknown as IngredientePoblado).ingrediente.calorias * (ingrediente as unknown as IngredientePoblado).peso) / 100)} kcal | 
                          💪 Proteínas: {(((ingrediente as unknown as IngredientePoblado).ingrediente.proteinas * (ingrediente as unknown as IngredientePoblado).peso) / 100).toFixed(1)}g | 
                          🍞 Carbohidratos: {(((ingrediente as unknown as IngredientePoblado).ingrediente.hidratosCarbono * (ingrediente as unknown as IngredientePoblado).peso) / 100).toFixed(1)}g | 
                          🧈 Grasas: {(((ingrediente as unknown as IngredientePoblado).ingrediente.grasas * (ingrediente as unknown as IngredientePoblado).peso) / 100).toFixed(1)}g
                        </Text>
                      )}
                    </Box>
                    {typeof ingrediente === 'object' && 'ingrediente' in ingrediente && (ingrediente as unknown as IngredientePoblado).ingrediente?.imagenIngrediente && (
                      <Image
                        src={(ingrediente as unknown as IngredientePoblado).ingrediente.imagenIngrediente}
                        alt={(ingrediente as unknown as IngredientePoblado).ingrediente.nombre}
                        w={30}
                        h={30}
                        radius="sm"
                        fallbackSrc="/api/placeholder/30/30"
                      />
                    )}
                  </Group>
                </List.Item>
              ))}
            </List>
          </Paper>
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
