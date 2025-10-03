import React, { useState } from 'react';
import { Container, Title, Tabs, Paper, Loader, Center, Alert, Button, Stack, Text } from '@mantine/core';
import { IconBarbell, IconApple, IconAlertCircle, IconCreditCard, IconActivity } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useSuscription } from '../hooks/useSuscription';
import ProgresoEntrenamientoTab from '../components/molecules/ProgresoEntrenamientoTab';
import ProgresoNutricionTab from '../components/molecules/ProgresoNutricionTab';
import ProgresoEntrenamientoWorkerTab from '../components/molecules/ProgresoEntrenamientoWorkerTab';
import ProgresoNutricionWorkerTab from '../components/molecules/ProgresoNutricionWorkerTab';
import MiProgresoTab from '../components/molecules/MiProgresoTab';
import MiProgresoWorkerTab from '../components/molecules/MiProgresoWorkerTab';

const ProgresoSemanalPage: React.FC = () => {
  const { user } = useAuth();
  const { suscriptionStatus, loading: suscriptionLoading } = useSuscription();
  const [activeTab, setActiveTab] = useState<string>('mi-progreso');

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
          <Title order={1} mb="xl" c="nutroos-green">
            Seguimiento de Clientes
          </Title>
          
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

    // Si solo puede acceder a uno, mostrar tabs con progreso de clientes
    if (canAccessTraining && !canAccessNutrition) {
      return (
        <Container size="xl" py="xl">
          <Title order={1} mb="xl" c="nutroos-green">
            Seguimiento de Clientes
          </Title>

          <Paper shadow="sm" p="md" radius="md">
            <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'mi-progreso')}>
              <Tabs.List>
                <Tabs.Tab value="mi-progreso" leftSection={<IconActivity size={16} />}>Progreso de mis clientes</Tabs.Tab>
                <Tabs.Tab 
                  value="entrenamiento" 
                  leftSection={<IconBarbell size={16} />}
                >
                  Entrenamiento Personal
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="mi-progreso" pt="md">
                <MiProgresoWorkerTab />
              </Tabs.Panel>

              <Tabs.Panel value="entrenamiento" pt="md">
                <ProgresoEntrenamientoWorkerTab />
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Container>
      );
    }

    if (canAccessNutrition && !canAccessTraining) {
      return (
        <Container size="xl" py="xl">
          <Title order={1} mb="xl" c="nutroos-green">
            Seguimiento de Clientes
          </Title>

          <Paper shadow="sm" p="md" radius="md">
            <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'mi-progreso')}>
              <Tabs.List>
                <Tabs.Tab value="mi-progreso" leftSection={<IconActivity size={16} />}>Progreso de mis clientes</Tabs.Tab>
                <Tabs.Tab 
                  value="nutricion" 
                  leftSection={<IconApple size={16} />}
                >
                  Nutrición
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="mi-progreso" pt="md">
                <MiProgresoWorkerTab />
              </Tabs.Panel>

              <Tabs.Panel value="nutricion" pt="md">
                <ProgresoNutricionWorkerTab />
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Container>
      );
    }

    // Si puede acceder a ambos, mostrar tabs
    return (
      <Container size="xl" py="xl">
        <Title order={1} mb="xl" c="nutroos-green">
          Seguimiento de Clientes
        </Title>

        <Paper shadow="sm" p="md" radius="md">
          <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'mi-progreso')}>
            <Tabs.List>
              <Tabs.Tab value="mi-progreso" leftSection={<IconActivity size={16} />}>Progreso de mis clientes</Tabs.Tab>
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
            <Tabs.Panel value="mi-progreso" pt="md">
              <MiProgresoWorkerTab />
            </Tabs.Panel>
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
        <Title order={1} mb="xl" c="nutroos-green">
          Progreso Semanal
        </Title>
        
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
        <Title order={1} mb="xl" c="nutroos-green">
          Progreso Semanal
        </Title>
        
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
        <Title order={1} mb="xl" c="nutroos-green">
          Progreso Semanal
        </Title>
        <ProgresoEntrenamientoTab />
      </Container>
    );
  }

  if (canAccessNutrition && !canAccessTraining) {
    return (
      <Container size="xl" py="xl">
        <Title order={1} mb="xl" c="nutroos-green">
          Progreso Semanal
        </Title>
        <ProgresoNutricionTab />
      </Container>
    );
  }

  // Si puede acceder a ambos, mostrar tabs
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl" c="nutroos-green">
        Progreso Semanal
      </Title>

      <Paper shadow="sm" p="md" radius="md">
        <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'mi-progreso')}>
          <Tabs.List>
            {suscriptionStatus?.suscription?.plan?.tipoPrecio !== 'Gratuito' && (
              <Tabs.Tab value="mi-progreso" leftSection={<IconActivity size={16} />}>Mi Progreso</Tabs.Tab>
            )}
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
          {suscriptionStatus?.suscription?.plan?.tipoPrecio !== 'Gratuito' && (
            <Tabs.Panel value="mi-progreso" pt="md">
              <MiProgresoTab />
            </Tabs.Panel>
          )}
        </Tabs>
      </Paper>
    </Container>
  );
};

export default ProgresoSemanalPage;
