import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Alert, 
  Space,
  Group,
  Avatar,
  Breadcrumbs,
  Paper,
  Box
} from '@mantine/core';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import FormularioCrearDieta from '../components/forms/diets/FormularioCrearDieta';
import { DietaResponse } from '../types';
import { IconAlertCircle, IconUser, IconChevronRight } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { BREADCRUMBS_DIET_BASE } from '../constants/training';
import { createBreadcrumbItems, renderClientInfo } from '../components/common/BreadcrumbUtils';

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

  const items = createBreadcrumbItems(BREADCRUMBS_DIET_BASE, [
    { title: 'Detalles del cliente', href: `/clientes/${clienteInfo.id}` },
    { title: 'Crear dieta', href: '#' }
  ]);

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
            {renderClientInfo(clienteInfo.nombre, clienteInfo.id)}
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