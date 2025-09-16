import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Title, 
  Alert, 
  Space,
  Group,
  Avatar,
  Paper,
  Box,
  Center,
  Loader,
  Stack
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import FormularioCrearReceta from '../components/forms/recetas/FormularioCrearReceta';
import { obtenerReceta, RecetaResponse } from '../services/recetaService';
import { IconAlertCircle, IconChefHat } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const EditarRecetaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receta, setReceta] = useState<RecetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success', texto: string } | null>(null);

  const cargarReceta = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const recetaData = await obtenerReceta(id);
      setReceta(recetaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la receta');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      cargarReceta();
    }
  }, [id, cargarReceta]);

  const handleRecetaActualizada = () => {
    setMensaje({
      tipo: 'success',
      texto: 'Receta actualizada correctamente'
    });
    
    // Redirigir después de un breve delay
    setTimeout(() => {
      navigate('/mis-recetas');
    }, 2000);
  };

  const handleError = (error: Error) => {
    setMensaje({
      tipo: 'error',
      texto: error.message || 'Error al actualizar la receta'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMensaje(null), 5000);
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center style={{ height: '50vh' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" color="nutroos-green" />
            <p>Cargando receta...</p>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error || !receta) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
          mb="md"
        >
          {error || 'Receta no encontrada'}
        </Alert>
      </Container>
    );
  }

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
            <Title order={2} mb={5} c="nutroos-green.6">Editar Receta</Title>
            <p style={{ margin: 0, color: 'var(--mantine-color-dimmed)' }}>
              Modifica los datos de la receta "{receta.nombreReceta}"
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
        onSuccess={handleRecetaActualizada}
        onError={handleError}
        modoEdicion={true}
        recetaInicial={receta}
      />
    </Container>
  );
};

export default EditarRecetaPage;

