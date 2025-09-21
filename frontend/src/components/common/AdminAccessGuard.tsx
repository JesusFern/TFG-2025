import React from 'react';
import { Container, Title, Paper, Button, Group, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminAccessGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
  fallbackText?: string;
}

/**
 * Componente que verifica si el usuario es administrador
 * Si no es admin, muestra un mensaje de acceso denegado
 */
const AdminAccessGuard: React.FC<AdminAccessGuardProps> = ({
  children,
  fallbackPath = '/dashboard',
  fallbackText = 'Solo los administradores pueden acceder a esta sección.'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Verificar si el usuario es admin
  if (user && user.role !== 'admin') {
    return (
      <Container size="md" py="xl">
        <Paper shadow="sm" p="xl" radius="md">
          <Title order={2} mb="lg" ta="center" c="red">
            Acceso Denegado
          </Title>
          <Text ta="center" mb="lg">
            {fallbackText}
          </Text>
          <Group justify="center">
            <Button onClick={() => navigate(fallbackPath)} color="red">
              Ir al Dashboard
            </Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  return <>{children}</>;
};

export default AdminAccessGuard;
