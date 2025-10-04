import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Title, Avatar, Box, Group } from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { getUserById } from '../services/userService';
import FormularioCrearPlanEntrenamiento from '../components/forms/training/FormularioCrearPlanEntrenamiento';
import { renderClientInfo } from '../components/common/BreadcrumbUtils';

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
            <IconBarbell size="1.5rem" />
          </Avatar>
          
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c="nutroos-green.6">Crear Nuevo Plan de Entrenamiento</Title>
            {renderClientInfo(clienteNombre, clientId)}
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


