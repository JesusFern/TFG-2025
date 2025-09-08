import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Alert, 
  Space,
  Text,
  Group,
  Avatar,
  Badge,
  Breadcrumbs,
  Anchor,
  Paper,
  Box
} from '@mantine/core';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import FormularioCrearDieta from '../components/forms/diets/FormularioCrearDieta';
import { DietaResponse } from '../types';
import { IconAlertCircle, IconUser, IconChevronRight, IconHome } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const CrearDietaPage: React.FC = () => {
  const { clienteId } = useParams<{ clienteId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { clienteNombre?: string } | undefined;
  
  const [clienteInfo, setClienteInfo] = useState({
    id: clienteId || "",
    nombre: state?.clienteNombre || ""
  });
  
  const [mensaje, setMensaje] = useState<{ tipo: 'error', texto: string } | null>(null);
  
  const handleClienteInfoUpdate = (nombre: string) => {
    setClienteInfo(prev => ({ ...prev, nombre }));
  };

  const handleDietaCreada = (dietaData: DietaResponse) => {
    // Redirigir directamente a la página de editar dieta
    if (dietaData._id) {
      navigate(`/editar-dieta/${dietaData._id}`);
    }
  };

  const handleError = (error: Error) => {
    setMensaje({
      tipo: 'error',
      texto: error.message || 'Error al crear la dieta'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMensaje(null), 5000);
  };
  
  // Ya no necesitamos la función handleContinuar

  const items = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Clientes', href: '/clientes' },
    { title: 'Detalles del cliente', href: `/clientes/${clienteInfo.id}` },
    { title: 'Crear dieta', href: '#' },
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
            <IconUser size="1.5rem" />
          </Avatar>
          
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c="nutroos-green.6">Crear Nueva Dieta</Title>
            <Group gap="xs">
              {clienteInfo.nombre ? (
                <>
                  <Text c="dimmed">Para:</Text>
                  <Text fw={600}>{clienteInfo.nombre}</Text>
                  <Badge color="nutroos-green">Cliente</Badge>
                </>
              ) : (
                <>
                  <Text c="dimmed">Para cliente con ID:</Text>
                  <Text fw={600}>{clienteInfo.id}</Text>
                  <Badge color="nutroos-green">Cliente</Badge>
                </>
              )}
            </Group>
          </Box>
        </Group>
      </Paper>
      
      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="filled"
            mb="md"
            withCloseButton
            onClose={() => setMensaje(null)}
          >
            {mensaje.texto}
          </Alert>
          <Space h="md" />
        </motion.div>
      )}
        
      <FormularioCrearDieta 
        onSuccess={handleDietaCreada}
        onError={handleError}
        clienteId={clienteInfo.id}
        clienteNombre={clienteInfo.nombre}
        onClienteNombreLoaded={handleClienteInfoUpdate}
      />
    </Container>
  );
};

export default CrearDietaPage;