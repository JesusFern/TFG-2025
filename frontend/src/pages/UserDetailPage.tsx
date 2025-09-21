import React, { useState, useEffect, useCallback } from 'react';
import { Container, Title, Paper, Button, Group, Text, Stack, Grid, Card, Badge, Avatar, Loader, Center, Alert, Divider } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconUser, IconMail, IconCalendar, IconPhone, IconCrown, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../services/api';
import { getSuscriptionPlanById, SuscriptionPlan } from '../services/suscriptionPlanService';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: string;
  birthDate?: string;
  role: string;
  suscripcion?: string;
  profilePicture?: string;
  datosSaludYNutricion?: {
    _id: string;
    [key: string]: unknown;
  };
  datosActividadFisica?: {
    _id: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
}

// Usar la interfaz del servicio

const UserDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SuscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest(`/api/admin/users/${userId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Error al cargar detalles del usuario');
      }

      const user = await response.json();
      setUserData(user);

      // Si el usuario tiene suscripción, obtener los detalles del plan
      if (user.suscripcion) {
        await fetchSubscriptionPlan(user.suscripcion);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar detalles del usuario');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  const fetchSubscriptionPlan = async (subscriptionId: string) => {
    try {
      const plan = await getSuscriptionPlanById(subscriptionId);
      setSubscriptionPlan(plan);
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            Solo los administradores pueden acceder a los detalles de usuarios.
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
            <Text>Cargando detalles del usuario...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error || !userData) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
        >
          {error || 'Usuario no encontrado'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
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

      <Paper shadow="sm" p="xl" radius="md" mb="xl">
        <Group mb="lg">
          <Title order={2} c="nutroos-green.7">
            Detalles del Usuario
          </Title>
        </Group>

        <Grid>
          {/* Información Personal */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack gap="md">
                <Title order={4} c="nutroos-green.7">
                  Información Personal
                </Title>
                
                <Group>
                  {userData.profilePicture ? (
                    <Avatar size="xl" radius="xl" src={userData.profilePicture} />
                  ) : (
                    <Avatar size="xl" radius="xl" color="nutroos-green">
                      {userData.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <div>
                    <Text fw={500} size="xl">
                      {userData.fullName}
                    </Text>
                    <Badge color="nutroos-green" variant="light">
                      {userData.role}
                    </Badge>
                  </div>
                </Group>

                <Divider />

                <Stack gap="md">
                  <Group gap="md">
                    <IconMail size={20} color="var(--mantine-color-gray-6)" />
                    <div>
                      <Text size="sm" c="dimmed">Email</Text>
                      <Text fw={500}>{userData.email}</Text>
                    </div>
                  </Group>

                  <Group gap="md">
                    <IconPhone size={20} color="var(--mantine-color-gray-6)" />
                    <div>
                      <Text size="sm" c="dimmed">Teléfono</Text>
                      <Text fw={500}>{userData.phoneNumber}</Text>
                    </div>
                  </Group>

                  <Group gap="md">
                    <IconUser size={20} color="var(--mantine-color-gray-6)" />
                    <div>
                      <Text size="sm" c="dimmed">Género</Text>
                      <Text fw={500}>{userData.gender || 'No especificado'}</Text>
                    </div>
                  </Group>

                  <Group gap="md">
                    <IconCalendar size={20} color="var(--mantine-color-gray-6)" />
                    <div>
                      <Text size="sm" c="dimmed">Edad</Text>
                      <Text fw={500}>
                        {userData.birthDate ? `${calculateAge(userData.birthDate)} años` : 'No disponible'}
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Información de Suscripción */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack gap="md">
                <Title order={4} c="nutroos-green.7">
                  Plan de Suscripción
                </Title>

                {userData.suscripcion ? (
                  <Stack gap="md">
                    <Group>
                      <IconCrown size={24} color="var(--mantine-color-yellow-6)" />
                      <div>
                        <Text fw={500} size="lg">
                          {subscriptionPlan?.nombre || 'Plan Activo'}
                        </Text>
                        <Badge color="green" variant="light">
                          Activo
                        </Badge>
                      </div>
                    </Group>

                    {subscriptionPlan && (
                      <Stack gap="sm">
                        <div>
                          <Text size="sm" c="dimmed">Descripción</Text>
                          <Text fw={500}>{subscriptionPlan.descripcion}</Text>
                        </div>
                        
                        <div>
                          <Text size="sm" c="dimmed">Precio Mensual</Text>
                          <Text fw={500}>€{subscriptionPlan.precioMensual}/mes</Text>
                        </div>
                        
                        <div>
                          <Text size="sm" c="dimmed">Tipo de Plan</Text>
                          <Text fw={500}>{subscriptionPlan.tipoPrecio}</Text>
                        </div>
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Stack align="center" gap="md">
                    <IconCrown size={48} color="var(--mantine-color-gray-4)" />
                    <Text c="dimmed" ta="center">
                      El usuario no tiene un plan de suscripción activo
                    </Text>
                  </Stack>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Información del Sistema */}
          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={4} c="nutroos-green.7">
                  Información del Sistema
                </Title>

                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <div>
                      <Text size="sm" c="dimmed">ID del Usuario</Text>
                      <Text fw={500} size="sm" ff="monospace">
                        {userData._id}
                      </Text>
                    </div>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <div>
                      <Text size="sm" c="dimmed">Fecha de Registro</Text>
                      <Text fw={500}>{formatDate(userData.createdAt)}</Text>
                    </div>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <div>
                      <Text size="sm" c="dimmed">Última Actualización</Text>
                      <Text fw={500}>{formatDate(userData.updatedAt)}</Text>
                    </div>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <div>
                      <Text size="sm" c="dimmed">Estado</Text>
                      <Badge color="green" variant="light">
                        Activo
                      </Badge>
                    </div>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserDetailPage;
