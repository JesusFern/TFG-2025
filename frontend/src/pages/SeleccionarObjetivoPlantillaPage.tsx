import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SimpleGrid,
  Card,
  Text,
  Button,
  Stack,
  Alert,
  Group,
  Title
} from '@mantine/core';
import { 
  IconTarget,
  IconArrowLeft,
  IconInfoCircle
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { BREADCRUMBS_TRAINING_BASE } from '../constants/training';
import { createBreadcrumbItems } from '../components/common/BreadcrumbUtils';
import { PageLayout } from '../components/common/PageLayout';
import { useClientData } from '../hooks/useClientData';
import { OBJETIVOS_ENTRENAMIENTO } from '../constants/objectives';

const SeleccionarObjetivoPlantillaPage: React.FC = () => {
  const navigate = useNavigate();
  const { clientId, clienteNombre } = useClientData();
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);


  const handleObjetivoSeleccionado = (objetivo: string) => {
    navigate(`/training/planes/plantillas/configurar?clientId=${clientId}&objetivo=${encodeURIComponent(objetivo)}`);
  };

  const handleVolver = () => {
    navigate(`/training/planes/tipo?clientId=${clientId}`);
  };

  const items = createBreadcrumbItems(BREADCRUMBS_TRAINING_BASE, [
    { title: 'Seleccionar tipo de plan', href: `/training/planes/tipo?clientId=${clientId}` },
    { title: 'Seleccionar objetivo', href: '#', icon: undefined }
  ]);


  return (
    <PageLayout
      breadcrumbItems={items}
      title="Seleccionar Objetivo"
      subtitle="Elige el objetivo principal del plan de entrenamiento"
      icon={<IconTarget size="1.5rem" />}
      clienteNombre={clienteNombre}
      clientId={clientId}
    >

      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Plantillas Inteligentes"
        color="blue"
        mb="xl"
      >
        Las plantillas se generan automáticamente basándose en el objetivo seleccionado, 
        optimizando ejercicios, frecuencia y progresión para obtener los mejores resultados.
      </Alert>
      
      {notice && (
        <GlobalNotificationOverlay
          message={notice.message}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}

      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
        {OBJETIVOS_ENTRENAMIENTO.map((objetivo, index) => (
          <motion.div
            key={objetivo.nombre}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              p="lg"
              radius="md"
              withBorder
              style={{ 
                backgroundColor: 'var(--app-paper-bg)', 
                borderColor: 'var(--app-border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleObjetivoSeleccionado(objetivo.nombre)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Stack align="center" gap="md">
                <Text size="3rem">{objetivo.icono}</Text>
                
                <Title order={4} ta="center" c={`${objetivo.color}.6`}>
                  {objetivo.nombre}
                </Title>
                
                <Text size="sm" c="dimmed" ta="center">
                  {objetivo.descripcion}
                </Text>

                <Stack gap="xs" w="100%">
                  {objetivo.beneficios.map((beneficio, idx) => (
                    <Group gap="xs" key={idx}>
                      <Text size="xs" c="dimmed">•</Text>
                      <Text size="xs">{beneficio}</Text>
                    </Group>
                  ))}
                </Stack>

                <Button 
                  color={objetivo.color} 
                  fullWidth 
                  variant="light"
                  leftSection={<IconTarget size={16} />}
                  onClick={() => handleObjetivoSeleccionado(objetivo.nombre)}
                >
                  Seleccionar
                </Button>
              </Stack>
            </Card>
          </motion.div>
        ))}
      </SimpleGrid>

      <Group justify="space-between" mt="xl">
        <Button 
          variant="subtle" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleVolver}
        >
          Volver
        </Button>
      </Group>
    </PageLayout>
  );
};

export default SeleccionarObjetivoPlantillaPage;
