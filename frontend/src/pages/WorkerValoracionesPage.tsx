import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Alert,
  Tabs,
  Box,
  Badge,
  ThemeIcon
} from '@mantine/core';
import { 
  IconStar, 
  IconAlertCircle,
  IconChefHat,
  IconBarbell
} from '@tabler/icons-react';
import { useAuth } from '../contexts/useAuth';
import { 
  EstadisticasValoraciones, 
  EstadisticasValoracionesPorTipo 
} from '../types/valoraciones';
import { ValoracionService } from '../services/valoracionService';
import ValoracionList from '../components/molecules/ValoracionList';
import ValoracionStats from '../components/molecules/ValoracionStats';

const WorkerValoracionesPage: React.FC = () => {
  const { user } = useAuth();

  const [estadisticas, setEstadisticas] = useState<EstadisticasValoraciones | null>(null);
  const [estadisticasPorTipo, setEstadisticasPorTipo] = useState<EstadisticasValoracionesPorTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('todas');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?._id) return;

        // Las valoraciones se cargan en ValoracionList

        // Cargar estadísticas generales
        const estadisticasResponse = await ValoracionService.obtenerEstadisticas({
          trabajadorId: user._id
        });
        setEstadisticas(estadisticasResponse);

        // Cargar estadísticas por tipo
        const estadisticasPorTipoResponse = await ValoracionService.obtenerEstadisticasPorTipo(user._id);
        setEstadisticasPorTipo(estadisticasPorTipoResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      cargarDatos();
    }
  }, [user?._id]);

  const getTipoTrabajadorIcon = (tipo: string) => {
    return tipo === 'Nutricionista' ? IconChefHat : IconBarbell;
  };

  const getTipoTrabajadorColor = (tipo: string) => {
    return tipo === 'Nutricionista' ? 'green' : 'blue';
  };

  // Las valoraciones filtradas se manejan en ValoracionList

  const tabs = [
    { value: 'todas', label: 'Todas', count: 0 },
    ...estadisticasPorTipo.map(tipo => ({
      value: tipo.tipo,
      label: tipo.tipo,
      count: tipo.totalValoraciones
    }))
  ];

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Stack align="center" gap="md">
          <Text>Cargando valoraciones...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Box>
          <Title order={1} size="h2">
            Mis Valoraciones
          </Title>
          <Text c="dimmed" size="sm">
            Revisa las valoraciones que has recibido de tus clientes
          </Text>
        </Box>

        {/* Error */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Alert>
        )}

        {/* Estadísticas */}
        {estadisticas && (
          <ValoracionStats 
            estadisticas={estadisticas}
            estadisticasPorTipo={estadisticasPorTipo}
            compact={false}
          />
        )}

        {/* Tabs para filtrar por tipo */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'todas')}>
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                leftSection={
                  tab.value !== 'todas' ? (
                    <ThemeIcon
                      size="sm"
                      color={getTipoTrabajadorColor(tab.value)}
                      variant="light"
                    >
                      {React.createElement(getTipoTrabajadorIcon(tab.value), { size: 14 })}
                    </ThemeIcon>
                  ) : (
                    <IconStar size={14} />
                  )
                }
                rightSection={
                  <Badge size="sm" variant="light" color="gray">
                    {tab.count}
                  </Badge>
                }
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {/* Contenido de cada tab */}
          <Tabs.Panel value={activeTab} pt="md">
            <ValoracionList
              trabajadorId={user?._id}
              showFilters={true}
              showCreateButton={false}
              compact={false}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};

export default WorkerValoracionesPage;
