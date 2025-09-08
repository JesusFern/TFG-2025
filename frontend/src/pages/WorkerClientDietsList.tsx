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
  Paper
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconClock, IconCalendar, IconList, IconApple } from '@tabler/icons-react';
import { getDietsByWorkerAndClient } from '../services/dietService';
import { DietaResponse } from '../types/diets';
import { getUserData, getClientById } from '../services/authService';

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

  // Hooks de Mantine deben ir aquí, dentro del componente
  const theme = useMantineTheme();
  // Detectar modo oscuro basado en CSS
  const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark';
  
  // Formatear fecha
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
        setClientInfo(clientData);
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
  
  return (
    <Container size="lg" py="xl">
      <Paper 
        p="md" 
        shadow="xs" 
        radius="md" 
        mb="xl" 
        withBorder
        style={{ 
          backgroundColor: isDark ? theme.colors.dark[6] : 'var(--mantine-color-gray-0)',
          borderColor: isDark ? theme.colors.dark[4] : 'var(--mantine-color-gray-3)'
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
        <Alert color="yellow" icon={<IconClock size={20} />} title="Sin dietas" variant="filled">
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
              style={{
                backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                borderLeftWidth: 4,
                borderLeftStyle: 'solid',
                borderLeftColor: dieta.draftMode === false ? 
                  `var(--mantine-color-nutroos-green-${isDark ? '6' : '6'})` : 
                  `var(--mantine-color-gray-${isDark ? '6' : '5'})`,
                overflow: 'hidden',
              }}
              onClick={() => handleVerDieta(dieta._id, dieta.draftMode)}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = theme.shadows.xl;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = theme.shadows.md;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={4} mb={4} style={{ color: isDark ? theme.white : theme.colors.gray[8] }}>
                    {dieta.nombre}
                  </Title>
                  {dieta.descripcion && (
                    <Text size="sm" c="dimmed" mb={6} lineClamp={2}>
                      {dieta.descripcion}
                    </Text>
                  )}
                  {dieta.tipo && dieta.tipo.length > 0 && (
                    <Group gap="xs" mb={6}>
                      <IconApple size={14} style={{ color: 'var(--mantine-color-blue-6)' }} />
                      {dieta.tipo.map((tipo, index) => (
                        <Badge 
                          key={index} 
                          color={index % 3 === 0 ? "blue" : index % 3 === 1 ? "cyan" : "teal"}
                          variant="light"
                          size="sm"
                          radius="sm"
                        >
                          {tipo}
                        </Badge>
                      ))}
                    </Group>
                  )}
                  <Group gap="xs" mt={8}>
                    <Text size="xs" c="dimmed" fw={500}>
                      <IconCalendar size={14} style={{ verticalAlign: 'text-top', marginRight: 4 }} />
                      Inicio: {formatDate(dieta.fechaInicio)}
                    </Text>
                    <Text size="xs" c="dimmed" fw={500}>
                      <IconClock size={14} style={{ verticalAlign: 'text-top', marginRight: 4 }} />
                      {dieta.duracion} días
                    </Text>
                    <Text size="xs" c="dimmed" fw={500}>
                      <IconList size={14} style={{ verticalAlign: 'text-top', marginRight: 4 }} />
                      {dieta.comidasDiarias} comidas diarias
                    </Text>
                  </Group>
                </div>
                <Badge
                  size="lg"
                  color={dieta.draftMode === false ? 'nutroos-green' : 'gray'}
                  variant={dieta.draftMode === false ? 'filled' : 'light'}
                  leftSection={dieta.draftMode === false ? <IconCheck size={16}/> : <IconClock size={16}/> }
                  style={{
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    minWidth: 120,
                    justifyContent: 'center',
                  }}
                >
                  {dieta.draftMode === false ? 'PUBLICADA' : 'NO PUBLICADA'}
                </Badge>
              </Group>
              <Text c="dimmed" size="xs" ta="right" mt="md" style={{ fontStyle: 'italic' }}>
                Haz clic para {dieta.draftMode ? 'editar' : 'ver'} esta dieta
              </Text>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default WorkerClientDietsList;
