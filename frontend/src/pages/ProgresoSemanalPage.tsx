import React, { useState } from 'react';
import { Container, Title, Tabs, Paper, Loader, Center } from '@mantine/core';
import { IconBarbell, IconApple } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import ProgresoEntrenamientoTab from '../components/molecules/ProgresoEntrenamientoTab';
import ProgresoNutricionTab from '../components/molecules/ProgresoNutricionTab';

const ProgresoSemanalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('entrenamiento');

  if (!user) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl" c="nutroos-green">
        Progreso Semanal
      </Title>

      <Paper shadow="sm" p="md" radius="md">
        <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'entrenamiento')}>
          <Tabs.List>
            <Tabs.Tab 
              value="entrenamiento" 
              leftSection={<IconBarbell size={16} />}
            >
              Entrenamiento Personal
            </Tabs.Tab>
            <Tabs.Tab 
              value="nutricion" 
              leftSection={<IconApple size={16} />}
            >
              Nutrición
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="entrenamiento" pt="md">
            <ProgresoEntrenamientoTab />
          </Tabs.Panel>

          <Tabs.Panel value="nutricion" pt="md">
            <ProgresoNutricionTab />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
};

export default ProgresoSemanalPage;
