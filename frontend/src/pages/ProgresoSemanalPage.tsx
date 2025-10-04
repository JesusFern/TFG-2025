import React, { useState } from 'react';
import { Container, Title, Tabs, Paper, Loader, Center, Alert, Button, Stack, Text, Group } from '@mantine/core';
import { IconBarbell, IconApple, IconAlertCircle, IconCreditCard, IconArrowLeft } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useSuscription } from '../hooks/useSuscription';
import { useNavigate } from 'react-router-dom';
import ProgresoEntrenamientoTab from '../components/molecules/ProgresoEntrenamientoTab';
import ProgresoNutricionTab from '../components/molecules/ProgresoNutricionTab';
import ProgresoEntrenamientoWorkerTab from '../components/molecules/ProgresoEntrenamientoWorkerTab';
import ProgresoNutricionWorkerTab from '../components/molecules/ProgresoNutricionWorkerTab';

const ProgresoSemanalPage: React.FC = () => {
  const { user } = useAuth();
  const { suscriptionStatus, loading: suscriptionLoading } = useSuscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('entrenamiento');

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!user || suscriptionLoading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  // Si es trabajador, mostrar vista de seguimiento de clientes según su tipo
  if (user.role === 'worker') {
    // Determinar qué tabs mostrar según el tipo de trabajador
    const canAccessTraining = user.workerType === 'Entrenador personal' || user.workerType === 'Nutricionista y Entrenador personal';
    const canAccessNutrition = user.workerType === 'Nutricionista' || user.workerType === 'Nutricionista y Entrenador personal';

    // Si no puede acceder a ninguno, mostrar mensaje
    if (!canAccessTraining && !canAccessNutrition) {
      return (
        <Container size="xl" py="xl">
          <Group justify="space-between" align="center" mb="xl">
            <Title order={1} c="nutroos-green">
              Seguimiento de Clientes
            </Title>
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="light"
              onClick={handleBackToDashboard}
            >
              Volver al Dashboard
            </Button>
          </Group>
          
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Sin Acceso"
            color="orange"
            variant="light"
          >
            <Text>
              Tu tipo de trabajador no tiene acceso al seguimiento de clientes.
            </Text>
          </Alert>
        </Container>
      );
    }

    // Si solo puede acceder a uno, mostrar solo ese tab
    if (canAccessTraining && !canAccessNutrition) {
      return (
        <Container size="xl" py="xl">
          <Group justify="space-between" align="center" mb="xl">
            <Title order={1} c="nutroos-green">
              Seguimiento de Clientes
            </Title>
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="light"
              onClick={handleBackToDashboard}
            >
              Volver al Dashboard
            </Button>
          </Group>
          <ProgresoEntrenamientoWorkerTab />
        </Container>
      );
    }

    if (canAccessNutrition && !canAccessTraining) {
      return (
        <Container size="xl" py="xl">
          <Group justify="space-between" align="center" mb="xl">
            <Title order={1} c="nutroos-green">
              Seguimiento de Clientes
            </Title>
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="light"
              onClick={handleBackToDashboard}
            >
              Volver al Dashboard
            </Button>
          </Group>
          <ProgresoNutricionWorkerTab />
        </Container>
      );
    }

    // Si puede acceder a ambos, mostrar tabs
    return (
      <Container size="xl" py="xl">
        <Group justify="space-between" align="center" mb="xl">
          <Title order={1} c="nutroos-green">
            Seguimiento de Clientes
          </Title>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
            onClick={handleBackToDashboard}
          >
            Volver al Dashboard
          </Button>
        </Group>

        <Paper shadow="sm" p="md" radius="md">
          <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'entrenamiento')}>
            <Tabs.List>
              {canAccessTraining && (
                <Tabs.Tab 
                  value="entrenamiento" 
                  leftSection={<IconBarbell size={16} />}
                >
                  Entrenamiento Personal
                </Tabs.Tab>
              )}
              {canAccessNutrition && (
                <Tabs.Tab 
                  value="nutricion" 
                  leftSection={<IconApple size={16} />}
                >
                  Nutrición
                </Tabs.Tab>
              )}
            </Tabs.List>

            {canAccessTraining && (
              <Tabs.Panel value="entrenamiento" pt="md">
                <ProgresoEntrenamientoWorkerTab />
              </Tabs.Panel>
            )}

            {canAccessNutrition && (
              <Tabs.Panel value="nutricion" pt="md">
                <ProgresoNutricionWorkerTab />
              </Tabs.Panel>
            )}
          </Tabs>
        </Paper>
      </Container>
    );
  }

  // Si es usuario, verificar suscripción antes de mostrar vista personal
  if (!suscriptionStatus) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  // Si no tiene suscripción, mostrar mensaje
  if (!suscriptionStatus.hasSuscription) {
    return (
      <Container size="xl" py="xl">
        <Group justify="space-between" align="center" mb="xl">
          <Title order={1} c="nutroos-green">
            Progreso Semanal
          </Title>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
            onClick={handleBackToDashboard}
          >
            Volver al Dashboard
          </Button>
        </Group>
        
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Acceso Restringido"
          color="orange"
          variant="light"
        >
          <Stack gap="md">
            <Text>
              {suscriptionStatus.message}
            </Text>
            <Button
              leftSection={<IconCreditCard size={16} />}
              color="nutroos-green"
              onClick={() => {
                // Navegar a la página de suscripciones
                window.location.href = '/planes-suscripcion';
              }}
            >
              Ver Planes de Suscripción
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  // Determinar qué tabs mostrar según la suscripción
  const canAccessTraining = suscriptionStatus.canAccessTraining;
  const canAccessNutrition = suscriptionStatus.canAccessNutrition;

  // Si no puede acceder a ninguno, mostrar mensaje
  if (!canAccessTraining && !canAccessNutrition) {
    return (
      <Container size="xl" py="xl">
        <Group justify="space-between" align="center" mb="xl">
          <Title order={1} c="nutroos-green">
            Progreso Semanal
          </Title>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
            onClick={handleBackToDashboard}
          >
            Volver al Dashboard
          </Button>
        </Group>
        
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Acceso Restringido"
          color="red"
          variant="light"
        >
          <Stack gap="md">
            <Text>
              {suscriptionStatus.message}
            </Text>
            <Button
              leftSection={<IconCreditCard size={16} />}
              color="nutroos-green"
              onClick={() => {
                window.location.href = '/planes-suscripcion';
              }}
            >
              Actualizar Suscripción
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  // Si solo puede acceder a uno, mostrar solo ese tab
  if (canAccessTraining && !canAccessNutrition) {
    return (
      <Container size="xl" py="xl">
        <Group justify="space-between" align="center" mb="xl">
          <Title order={1} c="nutroos-green">
            Progreso Semanal
          </Title>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
            onClick={handleBackToDashboard}
          >
            Volver al Dashboard
          </Button>
        </Group>
        <ProgresoEntrenamientoTab />
      </Container>
    );
  }

  if (canAccessNutrition && !canAccessTraining) {
    return (
      <Container size="xl" py="xl">
        <Group justify="space-between" align="center" mb="xl">
          <Title order={1} c="nutroos-green">
            Progreso Semanal
          </Title>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
            onClick={handleBackToDashboard}
          >
            Volver al Dashboard
          </Button>
        </Group>
        <ProgresoNutricionTab />
      </Container>
    );
  }

  // Si puede acceder a ambos, mostrar tabs
  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" align="center" mb="xl">
        <Title order={1} c="nutroos-green">
          Progreso Semanal
        </Title>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          variant="light"
          onClick={handleBackToDashboard}
        >
          Volver al Dashboard
        </Button>
      </Group>

      <Paper shadow="sm" p="md" radius="md">
        <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'entrenamiento')}>
          <Tabs.List>
            {canAccessTraining && (
              <Tabs.Tab 
                value="entrenamiento" 
                leftSection={<IconBarbell size={16} />}
              >
                Entrenamiento Personal
              </Tabs.Tab>
            )}
            {canAccessNutrition && (
              <Tabs.Tab 
                value="nutricion" 
                leftSection={<IconApple size={16} />}
              >
                Nutrición
              </Tabs.Tab>
            )}
          </Tabs.List>

          {canAccessTraining && (
            <Tabs.Panel value="entrenamiento" pt="md">
              <ProgresoEntrenamientoTab />
            </Tabs.Panel>
          )}

          {canAccessNutrition && (
            <Tabs.Panel value="nutricion" pt="md">
              <ProgresoNutricionTab />
            </Tabs.Panel>
          )}
        </Tabs>
      </Paper>
    </Container>
  );
};

export default ProgresoSemanalPage;
