import React, { useState, useEffect } from 'react';
import { Container, Title, Paper, Button, Group, Text, Stack, Card, Badge, Avatar, Loader, Center, Alert, Box, Divider, Grid } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconUser, IconCalendar, IconUsers, IconMail, IconPhone, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../services/api';

interface Worker {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: string;
  birthDate?: string;
  role: string;
  workerType?: string;
  biography?: string;
  availability?: string;
  isWorkerAvailable?: boolean;
  satisfactionRating?: number;
  clientesAsignados?: Array<{
    clienteId: {
      _id: string;
      fullName: string;
      email: string;
    };
    tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  }>;
  createdAt: string;
  updatedAt: string;
}

const WorkerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { workerId } = useParams<{ workerId: string }>();
  const { user } = useAuth();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorker = async () => {
    if (!workerId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest(`/api/admin/workers/${workerId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Error al cargar trabajador');
      }

      const result = await response.json();
      setWorker(result.data);
    } catch (error) {
      console.error('Error fetching worker:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar trabajador');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorker();
  }, [workerId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Verificar si el usuario es admin
  if (user && user.role !== 'admin') {
    return (
      <Container size="md" py="xl">
        <Paper shadow="sm" p="xl" radius="md">
          <Title order={2} mb="lg" ta="center" c="red">
            Acceso Denegado
          </Title>
          <Text ta="center" mb="lg">
            Solo los administradores pueden acceder a los detalles del trabajador.
          </Text>
          <Group justify="center">
            <Button onClick={() => navigate('/dashboard')} color="red">
              Ir al Dashboard
            </Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Cargando trabajador...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!worker) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Trabajador no encontrado"
          color="orange"
          variant="light"
        >
          El trabajador solicitado no existe o no se pudo cargar.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group mb="lg">
        <Button 
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/admin/workers')}
          variant="outline"
          size="sm"
          color="nutroos-green"
        >
          Volver a Trabajadores
        </Button>
      </Group>

      <Paper shadow="sm" p="xl" radius="md">
        <Group mb="xl" align="flex-start">
          <Avatar size="xl" radius="xl" color="nutroos-green">
            {worker.fullName.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box style={{ flex: 1 }}>
            <Title order={1} c="nutroos-green.7" mb="xs">
              {worker.fullName}
            </Title>
            
            <Group gap="lg" mb="md">
              <Group gap="xs">
                <IconMail size={16} color="var(--mantine-color-gray-6)" />
                <Text size="sm">{worker.email}</Text>
              </Group>
              
              <Group gap="xs">
                <IconPhone size={16} color="var(--mantine-color-gray-6)" />
                <Text size="sm">{worker.phoneNumber}</Text>
              </Group>
            </Group>

            <Group gap="md">
              <Badge 
                color={worker.isWorkerAvailable ? 'green' : 'red'} 
                variant="light" 
                size="lg"
              >
                {worker.isWorkerAvailable ? 'Disponible' : 'No disponible'}
              </Badge>
              
              {worker.workerType && (
                <Badge 
                  color="blue" 
                  variant="outline" 
                  size="lg"
                >
                  {worker.workerType}
                </Badge>
              )}
              
              {worker.satisfactionRating !== undefined && (
                <Badge 
                  color={worker.satisfactionRating >= 4 ? 'green' : worker.satisfactionRating >= 3 ? 'yellow' : 'red'} 
                  variant="light" 
                  size="lg"
                >
                  ⭐ {worker.satisfactionRating.toFixed(1)}
                </Badge>
              )}
            </Group>
          </Box>
        </Group>

        <Divider mb="xl" />

        <Stack gap="xl">
          {/* Información Personal */}
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Title order={3} mb="md" c="nutroos-green.7">
              Información Personal
            </Title>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group gap="xs" mb="sm">
                  <IconUser size={16} color="var(--mantine-color-gray-6)" />
                  <Text fw={500}>Género:</Text>
                  <Text>{worker.gender || 'No especificado'}</Text>
                </Group>
                
                <Group gap="xs" mb="sm">
                  <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                  <Text fw={500}>Edad:</Text>
                  <Text>{worker.birthDate ? `${calculateAge(worker.birthDate)} años` : 'No especificada'}</Text>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group gap="xs" mb="sm">
                  <Text fw={500}>Fecha de registro:</Text>
                  <Text>{formatDate(worker.createdAt)}</Text>
                </Group>
                
                <Group gap="xs" mb="sm">
                  <Text fw={500}>Última actualización:</Text>
                  <Text>{formatDate(worker.updatedAt)}</Text>
                </Group>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Información Profesional */}
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Title order={3} mb="md" c="nutroos-green.7">
              Información Profesional
            </Title>
            
            <Stack gap="md">
              <Box>
                <Text fw={500} mb="xs">Disponibilidad:</Text>
                <Text>{worker.availability || 'No especificada'}</Text>
              </Box>
              
              {worker.biography && (
                <Box>
                  <Text fw={500} mb="xs">Biografía:</Text>
                  <Text>{worker.biography}</Text>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Clientes Asignados */}
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group mb="md" align="center">
              <IconUsers size={20} color="var(--mantine-color-nutroos-green-6)" />
              <Title order={3} c="nutroos-green.7">
                Clientes Asignados ({worker.clientesAsignados?.length || 0})
              </Title>
            </Group>
            
            {worker.clientesAsignados && worker.clientesAsignados.length > 0 ? (
              <Stack gap="md">
                {worker.clientesAsignados.map((cliente, index) => (
                  <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                    <Group justify="space-between" align="center">
                      <Group gap="md">
                        <Avatar size="md" radius="xl" color="nutroos-green">
                          {cliente.clienteId.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        
                        <Box>
                          <Text fw={500} size="md">
                            {cliente.clienteId.fullName}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {cliente.clienteId.email}
                          </Text>
                        </Box>
                      </Group>

                      <Badge 
                        color={cliente.tipoAsignacion === 'Nutricionista' ? 'green' : 'blue'} 
                        variant="light" 
                        size="lg"
                      >
                        {cliente.tipoAsignacion}
                      </Badge>
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                No hay clientes asignados a este trabajador.
              </Text>
            )}
          </Paper>
        </Stack>
      </Paper>
    </Container>
  );
};

export default WorkerDetailPage;
