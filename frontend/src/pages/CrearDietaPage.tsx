import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  Alert, 
  Space 
} from '@mantine/core';
import FormularioCrearDieta from '../components/forms/FormularioCrearDieta';
import { DietaResponse } from '../types';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

const CrearDietaPage: React.FC = () => {
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

  const handleDietaCreada = (dietaData: DietaResponse) => {
    setMensaje({
      tipo: 'success',
      texto: `Dieta "${dietaData.nombre}" creada con éxito.`
    });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleError = (error: Error) => {
    setMensaje({
      tipo: 'error',
      texto: error.message || 'Error al crear la dieta'
    });
    setTimeout(() => setMensaje(null), 5000);
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="md" withBorder>
        <Title order={1} ta="center" mb="xl">Crear Nueva Dieta</Title>
        
        {mensaje && (
          <>
            <Alert 
              icon={mensaje.tipo === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
              title={mensaje.tipo === 'success' ? "¡Éxito!" : "Error"}
              color={mensaje.tipo === 'success' ? "green" : "red"}
              variant="filled"
              mb="md"
            >
              {mensaje.texto}
            </Alert>
            <Space h="md" />
          </>
        )}
        
        <FormularioCrearDieta 
          onSuccess={handleDietaCreada}
          onError={handleError}
        />
      </Paper>
    </Container>
  );
};

export default CrearDietaPage;