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
  Anchor
} from '@mantine/core';
import { useParams, useLocation, Link } from 'react-router-dom';
import FormularioCrearDieta from '../components/forms/FormularioCrearDieta';
import { DietaResponse } from '../types';
import { IconAlertCircle, IconCheck, IconUser, IconChevronRight, IconHome } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const CrearDietaPage: React.FC = () => {
  const { clienteId } = useParams<{ clienteId?: string }>();
  const location = useLocation();
  const state = location.state as { clienteNombre?: string } | undefined;
  
  const clienteInfo = {
    id: clienteId || "",
    nombre: state?.clienteNombre || "Juan Pérez"
  };
  
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

  const handleDietaCreada = (dietaData: DietaResponse) => {
    setMensaje({
      tipo: 'success',
      texto: `Dieta "${dietaData.nombre}" creada con éxito para ${clienteInfo.nombre}.`
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleError = (error: Error) => {
    setMensaje({
      tipo: 'error',
      texto: error.message || 'Error al crear la dieta'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMensaje(null), 5000);
  };

  const items = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Clientes', href: '/clientes' },
    { title: clienteInfo.nombre, href: `/clientes/${clienteInfo.id}` },
    { title: 'Crear dieta', href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm">
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
      <Breadcrumbs mb="lg" separator={<IconChevronRight size={14} />}>
        {items}
      </Breadcrumbs>

      <Group mb="xl" align="flex-start">
        <Avatar 
          size="lg" 
          color="blue" 
          radius="xl"
        >
          <IconUser size="1.5rem" />
        </Avatar>
        
        <div style={{ flex: 1 }}>
          <Title order={2} mb={5}>Crear Nueva Dieta</Title>
          <Group gap="xs">
            <Text c="dimmed">Para:</Text>
            <Text fw={600}>{clienteInfo.nombre}</Text>
            <Badge color="blue">Cliente</Badge>
          </Group>
        </div>
      </Group>
      
      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            icon={mensaje.tipo === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
            title={mensaje.tipo === 'success' ? "¡Éxito!" : "Error"}
            color={mensaje.tipo === 'success' ? "green" : "red"}
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
      />
    </Container>
  );
};

export default CrearDietaPage;