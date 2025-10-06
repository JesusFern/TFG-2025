import React, { useState, useEffect, useCallback } from 'react';
import { Container, Title, Paper, Button, Group, Text, Stack, Badge, Loader, Center, Alert, Pagination, TextInput, Select, Grid, useMantineColorScheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconUser, IconCalendar, IconCrown, IconAlertCircle, IconSearch, IconFilter } from '@tabler/icons-react';
import { apiRequest } from '../services/api';
import { formatDate, calculateAge } from '../utils/dateUtils';
import AdminAccessGuard from '../components/common/AdminAccessGuard';
import UserCard from '../components/common/UserCard';

interface User {
  _id: string;
  fullName: string;
  email: string;
  gender?: string;
  birthDate?: string;
  role: string;
  suscripcion?: string | {
    _id: string;
    planId?: {
      _id: string;
      nombre: string;
      tipoPrecio: string;
      tipoPlan: string | null;
    };
    fechaInicio?: string;
    fechaFin?: string;
    estadoPago?: 'pendiente' | 'pagado' | 'vencido';
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface FiltersInfo {
  search: string;
  gender: string;
  planType: string;
  planPrecio: string;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  totalUsers: number;
  totalUsersInApp: number;
  pagination: PaginationInfo;
  filters: FiltersInfo;
}

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsersInApp, setTotalUsersInApp] = useState(0);
  const [totalFilteredUsers, setTotalFilteredUsers] = useState(0);
  
  const [filters, setFilters] = useState<FiltersInfo>({
    search: '',
    gender: '',
    planType: '',
    planPrecio: ''
  });

  const [tempFilters, setTempFilters] = useState<FiltersInfo>({
    search: '',
    gender: '',
    planType: '',
    planPrecio: ''
  });

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchUsers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query string con filtros
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: sortOrder
      });

      if (filters.search) queryParams.append('search', filters.search);
      if (filters.gender) queryParams.append('gender', filters.gender);
      if (filters.planType) queryParams.append('planType', filters.planType);
      if (filters.planPrecio) queryParams.append('planPrecio', filters.planPrecio);
      
      const response = await apiRequest(`/api/admin/users?${queryParams.toString()}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const result: UsersResponse = await response.json();
      setUsers(result.data);
      setPagination(result.pagination);
      setTotalUsersInApp(result.totalUsersInApp || 0);
      setTotalFilteredUsers(result.totalUsers || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [filters, sortOrder]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: keyof FiltersInfo, value: string) => {
    setTempFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Si se selecciona "Gratuito" como tipo de precio, limpiar el filtro de tipo de plan
      if (key === 'planPrecio' && value === 'Gratuito') {
        newFilters.planType = '';
      }
      
      return newFilters;
    });
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1); // Reset a la primera página al aplicar filtros
  };

  const handleSortOrderChange = (value: string | null) => {
    if (value === 'asc' || value === 'desc') {
      setSortOrder(value);
      setCurrentPage(1); // Reset a la primera página al cambiar orden
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      gender: '',
      planType: '',
      planPrecio: ''
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setCurrentPage(1);
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };


  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Cargando usuarios...</Text>
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

  return (
    <AdminAccessGuard fallbackText="Solo los administradores pueden acceder a la gestión de usuarios.">
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

      <Paper shadow="sm" p="md" radius="md" mb="md">
        <Group justify="space-between" align="center">
          <Title order={2} c="nutroos-green.7">
            Gestión de Usuarios
          </Title>
          <Stack gap="xs" align="flex-start">
            <Text fw={500}>
              Total usuarios: {totalUsersInApp}
            </Text>
            <Text fw={500} c="nutroos-green.6">
              Mostrando: {totalFilteredUsers}
            </Text>
          </Stack>
        </Group>
      </Paper>

      {/* Filtros */}
      <Paper shadow="sm" p="md" radius="md" mb="md">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <IconFilter size={20} color="var(--mantine-color-nutroos-green-6)" />
            <Text fw={500} c="nutroos-green.7">Filtros</Text>
          </Group>
          <Button
            variant="light"
            size="xs"
            color="gray"
            onClick={handleClearFilters}
          >
            Limpiar Filtros
          </Button>
        </Group>

        {/* Filtros organizados en una sola fila */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
            <TextInput
              label="Buscar por nombre o email"
              placeholder="Buscar..."
              leftSection={<IconSearch size={16} />}
              value={tempFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
            <Select
              label="Tipo de precio suscripción"
              placeholder="Seleccionar tipo"
              value={tempFilters.planPrecio}
              onChange={(value) => handleFilterChange('planPrecio', value || '')}
              data={[
                { value: '', label: 'Todos los precios' },
                { value: 'Gratuito', label: 'Gratuito' },
                { value: 'Básico', label: 'Básico' },
                { value: 'Pro', label: 'Pro' }
              ]}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
            <Select
              label="Tipo de plan suscripción"
              placeholder={tempFilters.planPrecio === 'Gratuito' ? 'No aplicable para planes gratuitos' : 'Seleccionar tipo'}
              value={tempFilters.planType}
              onChange={(value) => handleFilterChange('planType', value || '')}
              disabled={tempFilters.planPrecio === 'Gratuito'}
              data={[
                { value: '', label: 'Todos los tipos' },
                { value: 'Nutricion', label: 'Nutrición' },
                { value: 'Entrenamiento personal', label: 'Entrenamiento personal' },
                { value: 'Nutrición y entrenamiento personal', label: 'Nutrición + Entrenamiento' }
              ]}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
            <Select
              label="Género"
              placeholder="Seleccionar género"
              value={tempFilters.gender}
              onChange={(value) => handleFilterChange('gender', value || '')}
              data={[
                { value: '', label: 'Todos los géneros' },
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Femenino', label: 'Femenino' },
                { value: 'Otro', label: 'Otro' }
              ]}
            />
          </Grid.Col>

        </Grid>

        <Grid mt="md">
          <Grid.Col span={{ base: 6, sm: 6, md: 4, lg: 2.4 }}>
            <TextInput
              label="Ordenar por"
              value="Fecha de registro"
              readOnly
              styles={{
                input: {
                  backgroundColor: isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-1)',
                  color: isDark ? 'var(--mantine-color-gray-4)' : undefined,
                  border: isDark ? '1px solid var(--mantine-color-dark-4)' : undefined,
                  cursor: 'not-allowed',
                  '&:focus': {
                    border: isDark ? '1px solid var(--mantine-color-dark-4)' : undefined,
                    backgroundColor: isDark ? 'var(--mantine-color-dark-5)' : undefined
                  }
                }
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 6, md: 4, lg: 2.4 }}>
            <Select
              label="Orden"
              placeholder="Seleccionar orden"
              value={sortOrder}
              onChange={handleSortOrderChange}
              data={[
                { value: 'desc', label: 'Descendente' },
                { value: 'asc', label: 'Ascendente' }
              ]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 12, md: 4, lg: 2.4 }}>
            <Group align="end" h="100%">
              <Button
                color="nutroos-green"
                onClick={handleApplyFilters}
                leftSection={<IconFilter size={16} />}
                fullWidth
              >
                Aplicar Filtros
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>

      {users.length === 0 ? (
        <Paper shadow="sm" p="xl" radius="md">
          <Center h={200}>
            <Stack align="center" gap="md">
              <IconUser size={48} color="var(--mantine-color-gray-4)" />
              <Text c="dimmed" size="lg">
                No hay usuarios registrados
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Stack gap="md">
          {users.map((user) => (
            <UserCard key={user._id} user={user}>
              <Group gap="lg" align="center">
                  <Group gap="xs">
                    <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                    <Text size="sm">
                      {user.birthDate ? `${calculateAge(user.birthDate)} años` : 'N/A'}
                    </Text>
                  </Group>
                  
                  <Group gap="xs">
                    <IconUser size={16} color="var(--mantine-color-gray-6)" />
                    <Text size="sm">
                      {user.gender || 'N/A'}
                    </Text>
                  </Group>
                  
                  <Group gap="xs">
                    <IconCrown size={16} color="var(--mantine-color-gray-6)" />
                    {user.suscripcion && typeof user.suscripcion !== 'string' && user.suscripcion.planId ? (
                      <Group gap="xs">
                        <Badge 
                          color={user.suscripcion.planId.tipoPrecio === 'Gratuito' ? 'blue' : 
                                 user.suscripcion.planId.tipoPrecio === 'Básico' ? 'yellow' : 'purple'} 
                          variant="light" 
                          size="sm"
                        >
                          {user.suscripcion.planId.tipoPrecio}
                        </Badge>
                        {user.suscripcion.planId.tipoPlan && (
                          <Badge 
                            color="green" 
                            variant="outline" 
                            size="sm"
                          >
                            {user.suscripcion.planId.tipoPlan === 'Nutricion' ? 'Nutrición' :
                             user.suscripcion.planId.tipoPlan === 'Entrenamiento personal' ? 'Entrenamiento' :
                             user.suscripcion.planId.tipoPlan === 'Nutrición y entrenamiento personal' ? 'Nutri + Entreno' :
                             user.suscripcion.planId.tipoPlan}
                          </Badge>
                        )}
                      </Group>
                    ) : (
                      <Badge 
                        color="gray" 
                        variant="light" 
                        size="sm"
                      >
                        Sin suscripción
                      </Badge>
                    )}
                  </Group>

                  <Text size="xs" c="dimmed">
                    Registrado: {formatDate(user.createdAt)}
                  </Text>

                <Button
                  size="sm"
                  variant="light"
                  color="nutroos-green"
                  onClick={() => handleViewUser(user._id)}
                >
                  Ver Detalles
                </Button>
              </Group>
            </UserCard>
          ))}

          {pagination && pagination.totalPages > 1 && (
            <Paper shadow="sm" p="md" radius="md" mt="lg">
              <Group justify="center">
                <Pagination
                  value={currentPage}
                  onChange={handlePageChange}
                  total={pagination.totalPages}
                  color="nutroos-green"
                  size="sm"
                />
              </Group>
              <Text size="xs" c="dimmed" ta="center" mt="sm">
                Página {pagination.currentPage} de {pagination.totalPages} 
                ({pagination.totalUsers} usuarios en total)
              </Text>
            </Paper>
          )}
        </Stack>
      )}
      </Container>
    </AdminAccessGuard>
  );
};

export default UserManagementPage;
