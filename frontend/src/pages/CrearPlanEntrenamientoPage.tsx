import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Group, Text, Badge, Container, Paper, Breadcrumbs, Anchor, Title, Avatar, Box } from '@mantine/core';
import { IconHome, IconBarbell, IconChevronRight } from '@tabler/icons-react';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { getUserById } from '../services/userService';
import FormularioCrearPlanEntrenamiento from '../components/forms/training/FormularioCrearPlanEntrenamiento';

const CrearPlanEntrenamientoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const handleClienteInfoUpdate = (nombre: string) => {
    setClienteNombre(nombre);
  };

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

  const handlePlanCreado = (planData: { _id: string }) => {
    // Redirigir directamente a la página de editar plan
    if (planData._id) {
      navigate(`/training/planes/${planData._id}/editar`);
    }
  };

  const handleError = (error: Error) => {
    setNotice({
      message: error.message || 'Error al crear el plan',
      type: 'error'
    });
  };
  
  const items = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Crear plan', href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm" c="nutroos-green">
      {item.icon && (
        <Group gap={4}>
          {item.icon}
          <span>{item.title}</span>
        </Group>
      )}
      {!item.icon && item.title}
    </Anchor>
  ));

  const renderClientInfo = () => (
    <Group gap="xs">
      {clienteNombre ? (
        <>
          <Text c="dimmed">Para:</Text>
          <Text fw={600}>{clienteNombre}</Text>
          <Badge color="nutroos-green">Cliente</Badge>
        </>
      ) : clientId ? (
        <>
          <Text c="dimmed">Para cliente con ID:</Text>
          <Text fw={600}>{clientId}</Text>
          <Badge color="nutroos-green">Cliente</Badge>
        </>
      ) : (
        <Text c="dimmed">Plan de entrenamiento general</Text>
      )}
    </Group>
  );

  return (
    <Container size="md" py="xl">
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
            <IconBarbell size="1.5rem" />
          </Avatar>
          
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c="nutroos-green.6">Crear Nuevo Plan de Entrenamiento</Title>
            {renderClientInfo()}
          </Box>
        </Group>
      </Paper>
      
      {notice && (
        <GlobalNotificationOverlay
          message={notice.message}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}
        
      <FormularioCrearPlanEntrenamiento 
        onSuccess={handlePlanCreado}
        onError={handleError}
        clientId={clientId || undefined}
        clienteNombre={clienteNombre}
        onClienteNombreLoaded={handleClienteInfoUpdate}
      />
    </Container>
  );
};

export default CrearPlanEntrenamientoPage;


