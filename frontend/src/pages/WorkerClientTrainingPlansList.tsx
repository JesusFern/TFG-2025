import React from 'react';
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
import { IconAlertCircle, IconCheck, IconClock, IconCalendar, IconTarget, IconBarbell } from '@tabler/icons-react';
import { usePermissions } from '../hooks/usePermissions';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { useTrainingPlans } from '../hooks/useTrainingPlans';
import { formatDate } from '../utils/trainingUtils';

const WorkerClientTrainingPlansList: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { hasPermission, workerId } = usePermissions();
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  // Usar el hook refactorizado para cargar datos
  const {
    planes,
    clientInfo,
    loading,
    loadingClient,
    error
  } = useTrainingPlans({ 
    workerId: workerId || null, 
    clientId: clientId || null, 
    hasPermission: hasPermission || false
  });


  if (loading) {
    return <Container py="xl"><Loader color="nutroos-green" size="lg" /></Container>;
  }
  if (error) {
    return <Container py="xl"><Alert icon={<IconAlertCircle size={16} />} color="red">{error}</Alert></Container>;
  }

  const handleVerPlan = (planId: string, isDraft: boolean | undefined) => {
    if (isDraft) {
      navigate(`/training/planes/${planId}/editar`);
    } else {
      navigate(`/training/planes/${planId}`);
    }
  };

  // formatDate ya está importado desde trainingUtils

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
          Planes de Entrenamiento de{' '}
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
          Listado de planes de entrenamiento creados para{' '}
          {loadingClient ? (
            <Text span inherit>este usuario <Loader size="xs" ml="sm" display="inline" /></Text>
          ) : (
            <Text span fw={500} inherit>
              {clientInfo ? clientInfo.fullName : "este usuario"}
            </Text>
          )}
        </Text>
      </Paper>
      
      {planes.length === 0 ? (
        <Alert 
          color={isDark ? "yellow.6" : "yellow"} 
          icon={<IconClock size={20} stroke={1.5} />} 
          title="Sin planes de entrenamiento" 
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
          No hay planes de entrenamiento creados para este cliente todavía.
        </Alert>
      ) : (
        <Stack gap="lg">
          {planes.map((plan) => (
            <Card
              key={plan._id}
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
                borderLeftColor: plan.draftMode === false ? 
                  (isDark ? theme.colors["nutroos-green"][5] : theme.colors["nutroos-green"][6]) : 
                  (isDark ? theme.colors.dark[3] : theme.colors.gray[4]),
                overflow: 'hidden',
                boxShadow: isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              onClick={() => handleVerPlan(plan._id!, plan.draftMode)}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = isDark ? '0 8px 16px rgba(0, 0, 0, 0.6)' : theme.shadows.xl;
                e.currentTarget.style.transform = 'translateY(-2px)';
                if (plan.draftMode === false) {
                  e.currentTarget.style.borderLeftColor = isDark 
                    ? theme.colors["nutroos-green"][4]
                    : theme.colors["nutroos-green"][5];
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : theme.shadows.md;
                e.currentTarget.style.transform = 'translateY(0)';
                if (plan.draftMode === false) {
                  e.currentTarget.style.borderLeftColor = isDark 
                    ? theme.colors["nutroos-green"][5]
                    : theme.colors["nutroos-green"][6];
                }
              }}
            >
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={4} mb={4} fw={600} c={isDark ? "gray.0" : "gray.9"}>
                    {plan.nombre}
                  </Title>
                  {plan.descripcion && (
                    <Text 
                      size="sm" 
                      c={isDark ? "gray.2" : "gray.7"} 
                      mb={6} 
                      lineClamp={2}
                      fw={400}
                      style={{ transition: 'color 0.3s ease' }}
                    >
                      {plan.descripcion}
                    </Text>
                  )}
                  <Group gap="xs" mb={6}>
                    <IconTarget 
                      size={14}
                      stroke={1.5}
                      style={{ transition: 'color 0.3s ease' }}
                      color={isDark ? theme.colors.blue[3] : theme.colors.blue[6]}
                    />
                    <Badge 
                      color={isDark ? "blue.5" : "blue.6"}
                      variant="light"
                      size="sm"
                      radius="sm"
                      style={{ 
                        transition: 'all 0.3s ease',
                        fontWeight: 500
                      }}
                    >
                      {plan.objetivo}
                    </Badge>
                  </Group>
                  <Group gap="xs" mt={8}>
                    <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={600} style={{ transition: 'color 0.3s ease' }}>
                      <IconCalendar 
                        size={14} 
                        style={{ verticalAlign: 'text-top', marginRight: 4, transition: 'color 0.3s ease' }}
                        stroke={1.5}
                        color={isDark ? theme.colors.blue[3] : theme.colors.blue[6]} 
                      />
                      Inicio: {formatDate(plan.fechaInicio)}
                    </Text>
                    <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={600} style={{ transition: 'color 0.3s ease' }}>
                      <IconClock 
                        size={14} 
                        style={{ verticalAlign: 'text-top', marginRight: 4, transition: 'color 0.3s ease' }}
                        stroke={1.5}
                        color={isDark ? theme.colors.cyan[3] : theme.colors.cyan[6]} 
                      />
                      {plan.duracionDias} días
                    </Text>
                    <Text size="xs" c={isDark ? "gray.2" : "gray.7"} fw={600} style={{ transition: 'color 0.3s ease' }}>
                      <IconBarbell 
                        size={14} 
                        style={{ verticalAlign: 'text-top', marginRight: 4, transition: 'color 0.3s ease' }}
                        stroke={1.5}
                        color={isDark ? theme.colors.teal[3] : theme.colors.teal[6]} 
                      />
                      {plan.sesionesPorSemana} sesiones/semana
                    </Text>
                  </Group>
                </div>
                <Badge
                  size="lg"
                  color={plan.draftMode === false ? 'nutroos-green' : (isDark ? 'gray.6' : 'gray')}
                  variant={plan.draftMode === false ? 'filled' : (isDark ? 'light' : 'outline')}
                  leftSection={
                    plan.draftMode === false 
                      ? <IconCheck size={16} stroke={1.5} /> 
                      : <IconClock size={16} stroke={1.5} />
                  }
                  fw={700}
                  tt="uppercase"
                  c={isDark && plan.draftMode ? theme.white : undefined}
                  style={{
                    letterSpacing: 0.5,
                    minWidth: 120,
                    justifyContent: 'center',
                    boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.25)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {plan.draftMode === false ? 'Publicado' : 'Borrador'}
                </Badge>
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
                  {plan.draftMode ? 'editar' : 'ver'}
                </Text> este plan
              </Text>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default WorkerClientTrainingPlansList;
