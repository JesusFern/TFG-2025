import React from 'react';
import { Container, Title, Paper, Alert, Button, Group } from '@mantine/core';
import { IconShield, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RegisterWorkerForm from '../components/organisms/RegisterWorkerForm';

const RegisterWorkerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Verificar que el usuario sea admin
  if (user?.role !== 'admin') {
    return (
      <Container size="md" py="xl">
        <Alert 
          icon={<IconShield size={16} />} 
          title="Acceso Denegado" 
          color="red"
          mb="lg"
        >
          Solo los administradores pueden registrar trabajadores.
        </Alert>
        <Button 
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          variant="outline"
        >
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Group mb="lg">
        <Button 
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          color="nutroos-green"
        >
          Volver
        </Button>
      </Group>

      <Paper shadow="sm" p="xl" radius="md">
        <Title order={2} mb="lg" ta="center" c="nutroos-green.7">
          Registrar Nuevo Trabajador
        </Title>
        <RegisterWorkerForm />
      </Paper>
    </Container>
  );
};

export default RegisterWorkerPage;
