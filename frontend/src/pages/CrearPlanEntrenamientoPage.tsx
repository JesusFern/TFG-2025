import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Group, Text, Box } from '@mantine/core';
import { IconUser, IconHome } from '@tabler/icons-react';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import TrainingPageLayout from '../components/atoms/TrainingPageLayout';
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
  
  const breadcrumbs = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Crear plan', href: '#' },
  ];

  const renderClientInfo = () => (
    <Group gap="xs">
      {clienteNombre ? (
        <>
          <Text c="dimmed">Para:</Text>
          <Text fw={600}>{clienteNombre}</Text>
        </>
      ) : clientId ? (
        <>
          <Text c="dimmed">Para cliente con ID:</Text>
          <Text fw={600}>{clientId}</Text>
        </>
      ) : (
        <Text c="dimmed">Plan de entrenamiento general</Text>
      )}
    </Group>
  );

  return (
    <TrainingPageLayout
      breadcrumbs={breadcrumbs}
      title="Crear Nuevo Plan de Entrenamiento"
      icon={<IconUser size="1.5rem" />}
    >
      <Group mb="md" align="flex-start">
        <Box style={{ flex: 1 }}>
          {renderClientInfo()}
        </Box>
      </Group>
      
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
    </TrainingPageLayout>
  );
};

export default CrearPlanEntrenamientoPage;


