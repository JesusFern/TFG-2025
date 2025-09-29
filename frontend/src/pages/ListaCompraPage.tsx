import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Alert,
  Button,
  Text,
  Paper,
  Group
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  IconAlertCircle, 
  IconArrowLeft
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ListaCompraSemanalComponent from '../components/molecules/ListaCompraSemanal';

const ListaCompraPage: React.FC = () => {
  const { dietaId, semana } = useParams<{ dietaId: string; semana: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [error, setError] = useState<string | null>(null);

  // Validar parámetros
  useEffect(() => {
    if (!dietaId) {
      setError('ID de dieta no proporcionado');
      return;
    }
    
    if (!semana) {
      setError('Número de semana no proporcionado');
      return;
    }
    
    const semanaNum = parseInt(semana);
    if (isNaN(semanaNum) || semanaNum < 1) {
      setError('Número de semana inválido');
      return;
    }
  }, [dietaId, semana]);

  const handleError = (error: Error) => {
    console.error('Error al cargar lista de compra:', error);
    setError(error.message);
  };

  const handleBackNavigation = () => {
    if (user?.role === 'user') {
      // Si es cliente, volver a mis dietas
      navigate('/mis-dietas');
    } else {
      // Si es worker, volver a la vista de la dieta
      navigate(`/ver-dieta/${dietaId}`);
    }
  };


  if (error) {
    return (
      <Container size="xl" py="xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            icon={<IconAlertCircle size={18} />} 
            title="Error" 
            color="red" 
            mb="md"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            color="nutroos-green"
            onClick={handleBackNavigation}
          >
            Volver
          </Button>
        </motion.div>
      </Container>
    );
  }

  if (!dietaId || !semana) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          withCloseButton
        >
          Parámetros de la URL no válidos.
        </Alert>
        <Button 
          mt="lg" 
          color="nutroos-green"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md" px="sm">
      {/* Header */}
      <Paper p="lg" mb="md" withBorder>
        <Group justify="space-between" align="center">
          <div>
            <Text size="xl" fw={700} c="nutroos-green.6">
              Lista de Compra - Semana {semana}
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              Dieta ID: {dietaId}
            </Text>
          </div>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            color="gray"
            variant="light"
            onClick={handleBackNavigation}
          >
            Volver
          </Button>
        </Group>
      </Paper>

      {/* Lista de Compra */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ListaCompraSemanalComponent
          dietaId={dietaId}
          semana={parseInt(semana)}
          onError={handleError}
        />
      </motion.div>
    </Container>
  );
};

export default ListaCompraPage;