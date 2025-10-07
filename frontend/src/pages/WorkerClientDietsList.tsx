import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Loader, 
  Alert, 
  Card, 
  Group, 
  Badge, 
  Stack, 
  Text, 
  useMantineTheme,
  Paper,
  Button,
  Modal
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconClock, IconCalendar, IconList, IconApple, IconTrash } from '@tabler/icons-react';
import { getDietsByWorkerAndClient, eliminarDieta } from '../services/dietService';
import { DietaResponse } from '../types/diets';
import { getUserData, getClientById } from '../services/authService';
import { notifications } from '@mantine/notifications';

const WorkerClientDietsList: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const user = getUserData();
  const workerId = user?._id;
  const [dietas, setDietas] = useState<DietaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Actualizar el tipo para que coincida con la estructura de UserData
  const [clientInfo, setClientInfo] = useState<{id: string; fullName: string; email: string; role: string} | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dietaToDelete, setDietaToDelete] = useState<{ id: string; nombre: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Hooks de Mantine deben ir aquí, dentro del componente
  const theme = useMantineTheme();
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark'
  );
  
  useEffect(() => {
    const checkTheme = () => {
      const darkMode = document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark';
      setIsDark(darkMode);
    };
    
    checkTheme();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-mantine-color-scheme') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  useEffect(() => {
    const fetchDietas = async () => {
      if (typeof workerId !== 'string' || typeof clientId !== 'string') {
        setError('No se pudo identificar el usuario o cliente.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getDietsByWorkerAndClient(workerId, clientId);
        setDietas(data.dietas);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener las dietas');
      } finally {
        setLoading(false);
      }
    };
    fetchDietas();
  }, [workerId, clientId]);

  useEffect(() => {
    const fetchClientInfo = async () => {
      if (!clientId) return;
      
      try {
        setLoadingClient(true);
        console.log('Intentando obtener información para el cliente:', clientId);
        const clientData = await getClientById(clientId);
        console.log('Información de cliente obtenida:', clientData);
        if (clientData.id) {
          setClientInfo({
            id: clientData.id,
            fullName: clientData.fullName,
            email: clientData.email,
            role: clientData.role
          });
        }
      } catch (err) {
        console.error("Error al obtener información del cliente:", err);
      } finally {
        setLoadingClient(false);
      }
    };
    
    fetchClientInfo();
  }, [clientId]);

  if (loading) {
    return <Container py="xl"><Loader color="nutroos-green" size="lg" /></Container>;
  }
  if (error) {
    return <Container py="xl"><Alert icon={<IconAlertCircle size={16} />} color="red">{error}</Alert></Container>;
  }

  const handleVerDieta = (dietaId: string, isDraft: boolean | undefined) => {
    if (isDraft) {
      navigate(`/editar-dieta/${dietaId}`);
    } else {
      navigate(`/ver-dieta/${dietaId}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, dietaId: string, dietaNombre: string) => {
    e.stopPropagation(); // Evitar que se dispare el onClick del Card
    setDietaToDelete({ id: dietaId, nombre: dietaNombre });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!dietaToDelete) return;

    try {
      setDeleting(true);
      await eliminarDieta(dietaToDelete.id);
      
      // Actualizar la lista de dietas
      setDietas(dietas.filter(d => d._id !== dietaToDelete.id));
      
      notifications.show({
        title: 'Dieta eliminada',
        message: `La dieta "${dietaToDelete.nombre}" ha sido eliminada correctamente`,
        color: 'green',
        position: 'top-right'
      });

      setShowDeleteModal(false);
      setDietaToDelete(null);
    } catch (error) {
      notifications.show({
        title: 'Error al eliminar',
        message: error instanceof Error ? error.message : 'No se pudo eliminar la dieta',
        color: 'red',
        position: 'top-right'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDietaToDelete(null);
  };
  
  return (
    <Container size="lg" py="xl">
      <Paper 
        p="md" 
        shadow="xs" 
        radius="md" 
        mb="xl" 
        withBorder
        bg={isDark ? "dark.6" : "gray.0"}
        c={isDark ? "gray.0" : "dark.9"}
        style={{ 
          borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
          transition: 'all 0.3s ease',
          boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.4)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Title order={2} mb="xs">
          Dietas de{' '}
          {loadingClient ? (
            <>
              <Text span inherit>este cliente</Text>
              <Loader size="xs" ml="sm" display="inline" />
            </>
          ) : (
            <Text span c="nutroos-green" fw={700} inherit>
              {clientInfo ? clientInfo.fullName : "este cliente"}
            </Text>
          )}
        </Title>
        <Text c="dimmed">
          Listado de dietas creadas para{' '}
          {loadingClient ? (
            <Text span inherit>este usuario <Loader size="xs" ml="sm" display="inline" /></Text>
          ) : (
            <Text span fw={500} inherit>
              {clientInfo ? clientInfo.fullName : "este usuario"}
            </Text>
          )}
        </Text>
      </Paper>
      
      {dietas.length === 0 ? (
        <Alert 
          color={isDark ? "yellow.6" : "yellow"} 
          icon={<IconClock size={20} stroke={1.5} />} 
          title="Sin dietas" 
          variant={isDark ? "filled" : "light"}
          radius="md"
          styles={{
            title: {
              color: isDark ? theme.colors.yellow[1] : theme.colors.yellow[8],
              fontWeight: 700
            },
            message: {
              color: isDark ? theme.colors.gray[2] : theme.colors.gray[7],
              marginTop: 5,
              fontWeight: 500
            },
            root: {
              border: isDark ? `1px solid ${theme.colors.dark[4]}` : undefined
            }
          }}
        >
          No hay dietas creadas para este cliente todavía.
        </Alert>
      ) : (
        <Stack gap="lg">
          {dietas.map((dieta) => (
            <Card
              key={dieta._id}
              withBorder
              shadow="md"
              p="md"
              radius="md"
              bg={isDark ? theme.colors.dark[7] : 'white'}
              c={isDark ? theme.colors.gray[0] : theme.colors.gray[9]}
              style={{
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                borderLeftWidth: 4,
                borderLeftStyle: 'solid',
                borderLeftColor: dieta.draftMode === false ? 
                  (isDark ? theme.colors["nutroos-green"][5] : theme.colors["nutroos-green"][6]) : 
                  (isDark ? theme.colors.dark[3] : theme.colors.gray[4]),
                overflow: 'hidden',
                boxShadow: isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              onClick={() => handleVerDieta(dieta._id, dieta.draftMode)}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = isDark ? '0 8px 16px rgba(0, 0, 0, 0.6)' : theme.shadows.xl;
                e.currentTarget.style.transform = 'translateY(-2px)';
                if (dieta.draftMode === false) {
                  e.currentTarget.style.borderLeftColor = isDark 
                    ? theme.colors["nutroos-green"][4]
                    : theme.colors["nutroos-green"][5];
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : theme.shadows.md;
                e.currentTarget.style.transform = 'translateY(0)';
                if (dieta.draftMode === false) {
                  e.currentTarget.style.borderLeftColor = isDark 
                    ? theme.colors["nutroos-green"][5]
                    : theme.colors["nutroos-green"][6];
                }
              }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <div style={{ flex: 1 }}>
                  <Title order={4} mb={4} fw={600} c={isDark ? "gray.0" : "gray.9"}>
                    {dieta.nombre}
                  </Title>
                  {dieta.descripcion && (
                    <Text 
                      size="sm" 
                      c={isDark ? "gray.2" : "gray.7"} 
                      mb={6} 
                      lineClamp={2}
                      fw={400}
                      style={{ transition: 'color 0.3s ease' }}
                    >
                      {dieta.descripcion}
                    </Text>
                  )}
                  {dieta.tipo && dieta.tipo.length > 0 && (
                    <Group gap="xs" mb={6}>
                      <IconApple 
                        size={14}
                        stroke={1.5}
                        style={{ transition: 'color 0.3s ease' }}
                        color={isDark ? theme.colors.blue[3] : theme.colors.blue[6]}
                      />
                      {dieta.tipo.map((tipo, index) => {
                        const badgeColors = isDark 
                          ? ["blue.5", "cyan.5", "teal.5"] 
                          : ["blue.6", "cyan.6", "teal.6"];
                        
                        return (
                          <Badge 
                            key={index} 
                            color={badgeColors[index % 3]}
                            variant="light"
                            size="sm"
                            radius="sm"
                            style={{ 
                              transition: 'all 0.3s ease',
                              fontWeight: 500
                            }}
                          >
                            {tipo}
                          </Badge>
                        );
                      })}
                    </Group>
                  )}
                  <Group gap="xs" mt={8}>
                    <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={600} style={{ transition: 'color 0.3s ease' }}>
                      <IconCalendar 
                        size={14} 
                        style={{ verticalAlign: 'text-top', marginRight: 4, transition: 'color 0.3s ease' }}
                        stroke={1.5}
                        color={isDark ? theme.colors.blue[3] : theme.colors.blue[6]} 
                      />
                      Inicio: {formatDate(dieta.fechaInicio)}
                    </Text>
                    <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={600} style={{ transition: 'color 0.3s ease' }}>
                      <IconClock 
                        size={14} 
                        style={{ verticalAlign: 'text-top', marginRight: 4, transition: 'color 0.3s ease' }}
                        stroke={1.5}
                        color={isDark ? theme.colors.cyan[3] : theme.colors.cyan[6]} 
                      />
                      {dieta.duracion} días
                    </Text>
                    <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={600} style={{ transition: 'color 0.3s ease' }}>
                      <IconList 
                        size={14} 
                        style={{ verticalAlign: 'text-top', marginRight: 4, transition: 'color 0.3s ease' }}
                        stroke={1.5}
                        color={isDark ? theme.colors.teal[3] : theme.colors.teal[6]} 
                      />
                      {dieta.comidasDiarias} comidas diarias
                    </Text>
                  </Group>
                </div>
                <Stack gap="xs" align="flex-end">
                  <Badge
                    size="lg"
                    color={dieta.draftMode === false ? 'nutroos-green' : (isDark ? 'gray.6' : 'gray')}
                    variant={dieta.draftMode === false ? 'filled' : (isDark ? 'light' : 'outline')}
                    leftSection={
                      dieta.draftMode === false 
                        ? <IconCheck size={16} stroke={1.5} /> 
                        : <IconClock size={16} stroke={1.5} />
                    }
                    fw={700}
                    tt="uppercase"
                    c={isDark && dieta.draftMode ? theme.white : undefined}
                    style={{
                      letterSpacing: 0.5,
                      minWidth: 120,
                      justifyContent: 'center',
                      boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.25)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {dieta.draftMode === false ? 'Publicada' : 'No publicada'}
                  </Badge>
                  
                  {/* Botón de eliminar solo para dietas en draft mode */}
                  {dieta.draftMode && (
                    <Button
                      size="xs"
                      color="red"
                      variant="light"
                      leftSection={<IconTrash size={14} />}
                      onClick={(e) => handleDeleteClick(e, dieta._id, dieta.nombre)}
                      style={{
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Eliminar
                    </Button>
                  )}
                </Stack>
              </Group>
              <Text 
                c={isDark ? "gray.2" : "gray.6"} 
                size="xs" 
                ta="right" 
                mt="md" 
                fs="italic"
                fw={500}
                style={{ 
                  transition: 'color 0.3s ease',
                  opacity: 0.9
                }}
              >
                Haz clic para <Text span fw={700} c={isDark ? "nutroos-green.3" : "nutroos-green.6"} inherit>
                  {dieta.draftMode ? 'editar' : 'ver'}
                </Text> esta dieta
              </Text>
            </Card>
          ))}
        </Stack>
      )}

      {/* Modal de confirmación para eliminar */}
      <Modal
        opened={showDeleteModal}
        onClose={handleCancelDelete}
        title="Confirmar eliminación"
        centered
        size="md"
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            ¿Estás seguro de que deseas eliminar la dieta{' '}
            <Text span fw={700}>
              "{dietaToDelete?.nombre}"
            </Text>
            ?
          </Alert>
          
          <Text size="sm" c="dimmed">
            Esta acción no se puede deshacer. La dieta será eliminada permanentemente.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleCancelDelete}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleConfirmDelete}
              loading={deleting}
            >
              Eliminar dieta
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default WorkerClientDietsList;
