import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Breadcrumbs, 
  Title, 
  Avatar, 
  Box, 
  Group,
  SimpleGrid,
  Card,
  Text,
  Button,
  Stack,
  Alert
} from '@mantine/core';
import { 
  IconChevronRight, 
  IconTarget,
  IconArrowLeft,
  IconInfoCircle
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { getUserById } from '../services/userService';
import { BREADCRUMBS_TRAINING_BASE } from '../constants/training';
import { createBreadcrumbItems, renderClientInfo } from '../components/common/BreadcrumbUtils';

interface ObjetivoPlantilla {
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  beneficios: string[];
}

const SeleccionarObjetivoPlantillaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    if (clientId) {
      (async () => {
        try {
          const userData = await getUserById(clientId);
          setClienteNombre(userData.fullName);
        } catch {
          // ignore
        }
      })();
    }
  }, [clientId]);


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

  const objetivosPredefinidos: ObjetivoPlantilla[] = [
    {
      nombre: 'Ganancia muscular',
      descripcion: 'Desarrolla masa muscular y fuerza con ejercicios específicos',
      icono: '💪',
      color: 'red',
      beneficios: ['Hipertrofia muscular', 'Aumento de fuerza', 'Mejora de composición corporal']
    },
    {
      nombre: 'Pérdida de peso',
      descripcion: 'Quema grasa y mejora la condición física general',
      icono: '🔥',
      color: 'orange',
      beneficios: ['Quema de grasa', 'Mejora cardiovascular', 'Aumento de metabolismo']
    },
    {
      nombre: 'Resistencia',
      descripcion: 'Mejora la capacidad cardiovascular y la resistencia',
      icono: '🏃',
      color: 'blue',
      beneficios: ['Mejora cardiovascular', 'Aumento de resistencia', 'Mejor condición física']
    },
    {
      nombre: 'Flexibilidad',
      descripcion: 'Desarrolla movilidad y flexibilidad muscular',
      icono: '🧘',
      color: 'grape',
      beneficios: ['Mejor movilidad', 'Reducción de lesiones', 'Relajación muscular']
    },
    {
      nombre: 'Potencia',
      descripcion: 'Desarrolla explosividad y velocidad en movimientos',
      icono: '⚡',
      color: 'yellow',
      beneficios: ['Mejora de explosividad', 'Aumento de velocidad', 'Desarrollo de potencia']
    },
    {
      nombre: 'Estabilidad',
      descripcion: 'Fortalece el core y mejora el equilibrio corporal',
      icono: '⚖️',
      color: 'teal',
      beneficios: ['Fortalecimiento del core', 'Mejor equilibrio', 'Prevención de lesiones']
    },
    {
      nombre: 'Mantenimiento',
      descripcion: 'Mantén tu condición física actual',
      icono: '🔄',
      color: 'cyan',
      beneficios: ['Mantener forma física', 'Rutina equilibrada', 'Bienestar general']
    },
    {
      nombre: 'Salud general',
      descripcion: 'Mejora tu salud y bienestar general',
      icono: '❤️',
      color: 'green',
      beneficios: ['Mejora de salud', 'Bienestar general', 'Prevención de enfermedades']
    }
  ];

  return (
    <Container size="lg" py="xl">
      <Paper 
        p="md" 
        mb="lg" 
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderBottom: '1px solid var(--app-border-color)' 
        }}
      >
        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          {items}
        </Breadcrumbs>
      </Paper>

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
        <Group mb="md" align="flex-start">
          <Avatar 
            size="lg" 
            color="nutroos-green" 
            radius="xl"
          >
            <IconTarget size="1.5rem" />
          </Avatar>
          
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c="nutroos-green.6">Seleccionar Objetivo</Title>
            {renderClientInfo(clienteNombre, clientId)}
            <Text size="sm" c="dimmed" mt="xs">
              Elige el objetivo principal del plan de entrenamiento
            </Text>
          </Box>
        </Group>
      </Paper>

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
        {objetivosPredefinidos.map((objetivo, index) => (
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
    </Container>
  );
};

export default SeleccionarObjetivoPlantillaPage;
