import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Breadcrumbs, Text, Title, Avatar, Group, Box, Anchor } from '@mantine/core';
import { IconHome, IconBarbell, IconChevronRight } from '@tabler/icons-react';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import FormularioCrearEjercicio from '../components/forms/training/FormularioCrearEjercicio';

const CrearEjercicioPage: React.FC = () => {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const handleEjercicioCreado = () => {
    setNotice({ message: 'Ejercicio creado correctamente', type: 'success' });
    navigate('/training/ejercicios');
  };

  const handleError = (error: Error) => {
    setNotice({
      message: error.message || 'Error al crear ejercicio',
      type: 'error'
    });
  };

  const items = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Crear ejercicio', href: '#' },
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
            <Title order={2} mb={5} c="nutroos-green.6">Crear Nuevo Ejercicio</Title>
            <Text size="sm" c="dimmed">Define los detalles del ejercicio</Text>
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
        
      <FormularioCrearEjercicio 
        onSuccess={handleEjercicioCreado}
        onError={handleError}
      />
    </Container>
  );
};

export default CrearEjercicioPage;


