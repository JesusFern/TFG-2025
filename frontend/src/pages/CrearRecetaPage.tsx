import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Alert, 
  Space,
  Group,
  Avatar,
  Paper,
  Box
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import FormularioCrearReceta from '../components/forms/recetas/FormularioCrearReceta';
import { IconAlertCircle, IconChefHat } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const CrearRecetaPage: React.FC = () => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success', texto: string } | null>(null);
  
  const handleRecetaCreada = () => {
    setMensaje({
      tipo: 'success',
      texto: 'Receta creada correctamente'
    });
    
    setTimeout(() => {
      navigate('/mis-recetas');
    }, 2000);
  };

  const handleError = (error: Error) => {
    setMensaje({
      tipo: 'error',
      texto: error.message || 'Error al crear la receta'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMensaje(null), 5000);
  };

  return (
    <Container size="md" py="xl">

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
            <IconChefHat size="1.5rem" />
          </Avatar>
          
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c="nutroos-green.6">Crear Nueva Receta</Title>
            <p style={{ margin: 0, color: 'var(--mantine-color-dimmed)' }}>
              Crea una nueva receta con ingredientes, pasos de preparación e información nutricional
            </p>
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
            title={mensaje.tipo === 'error' ? 'Error' : 'Éxito'}
            color={mensaje.tipo === 'error' ? 'red' : 'green'}
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
        
      <FormularioCrearReceta 
        onSuccess={handleRecetaCreada}
        onError={handleError}
      />
    </Container>
  );
};

export default CrearRecetaPage;
