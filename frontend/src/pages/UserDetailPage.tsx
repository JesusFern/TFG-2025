import React, { useState, useEffect, useCallback } from 'react';
import { Container, Title, Paper, Button, Group, Text, Stack, Grid, Card, Badge, Avatar, Loader, Center, Alert, Divider } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconUser, IconMail, IconCalendar, IconPhone, IconCrown, IconAlertCircle } from '@tabler/icons-react';
import { apiRequest } from '../services/api';
import { getSuscriptionPlanById, SuscriptionPlan } from '../services/suscriptionPlanService';
import { formatDateTime, calculateAge } from '../utils/dateUtils';
import AdminAccessGuard from '../components/common/AdminAccessGuard';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: string;
  birthDate?: string;
  role: string;
  suscripcion?: string | {
    _id: string;
    planId?: SuscriptionPlan | string;
    fechaInicio?: string;
    fechaFin?: string;
    estadoPago?: 'pendiente' | 'pagado' | 'vencido';
    frecuenciaDePago?: 'Mensual' | 'Trimestral' | 'Anual';
  };
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

      // Si el usuario tiene suscripción, obtener detalles del plan
      if (user.suscripcion) {
        // Caso 1: backend pobló el plan (preferido)
        if (typeof user.suscripcion !== 'string' && user.suscripcion.planId && typeof user.suscripcion.planId !== 'string') {
          setSubscriptionPlan(user.suscripcion.planId);
        } else if (typeof user.suscripcion !== 'string' && typeof user.suscripcion.planId === 'string') {
          // Caso 2: tenemos el id del plan
          await fetchSubscriptionPlan(user.suscripcion.planId);
        }
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

  const fetchSubscriptionPlan = async (planId: string) => {
    try {
      const plan = await getSuscriptionPlanById(planId);
      setSubscriptionPlan(plan);
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
    }
  };


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
    <AdminAccessGuard fallbackText="Solo los administradores pueden acceder a los detalles de usuarios.">
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
                        {typeof userData.suscripcion !== 'string' && (
                          <>
                            {userData.suscripcion.fechaInicio && (
                              <div>
                                <Text size="sm" c="dimmed">Inicio</Text>
                                <Text fw={500}>{new Date(userData.suscripcion.fechaInicio).toLocaleDateString('es-ES')}</Text>
                              </div>
                            )}
                            {userData.suscripcion.fechaFin && (
                              <div>
                                <Text size="sm" c="dimmed">Fin</Text>
                                <Text fw={500}>{new Date(userData.suscripcion.fechaFin).toLocaleDateString('es-ES')}</Text>
                              </div>
                            )}
                            {userData.suscripcion.estadoPago && (
                              <div>
                                <Text size="sm" c="dimmed">Estado de pago</Text>
                                <Text fw={500}>{userData.suscripcion.estadoPago}</Text>
                              </div>
                            )}
                          </>
                        )}
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
                      <Text fw={500}>{formatDateTime(userData.createdAt)}</Text>
                    </div>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <div>
                      <Text size="sm" c="dimmed">Última Actualización</Text>
                      <Text fw={500}>{formatDateTime(userData.updatedAt)}</Text>
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
    </AdminAccessGuard>
  );
};

export default UserDetailPage;
