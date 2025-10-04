import React, { useState, useEffect, useCallback } from 'react';
import { Container, Title, Paper, Button, Group, Text, Stack, Loader, Center, Alert, Grid, Badge, Select } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { apiRequest } from '../services/api';
import UserFilters from '../components/organisms/UserFilters';
import UserList from '../components/organisms/UserList';
import { formatDate, calculateAge } from '../utils/dateUtils';
import AdminAccessGuard from '../components/common/AdminAccessGuard';

interface Worker {
  _id: string;
  fullName: string;
  email: string;
  gender?: string;
  birthDate?: string;
  role: string;
  workerType?: string;
  biography?: string;
  availability?: string;
  isWorkerAvailable?: boolean;
  satisfactionRating?: number;
  clientesAsignados?: Array<{
    clienteId: string;
    tipoAsignacion: string;
  }>;
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
  workerType: string;
  isWorkerAvailable: string;
  gender: string;
  [key: string]: string;
}

interface WorkersResponse {
  success: boolean;
  data: Worker[];
  totalWorkers: number;
  totalWorkersInApp: number;
  pagination: PaginationInfo;
  filters: FiltersInfo;
}

const WorkerManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalWorkersInApp, setTotalWorkersInApp] = useState(0);
  const [totalFilteredWorkers, setTotalFilteredWorkers] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [filters, setFilters] = useState<FiltersInfo>({
    search: '',
    workerType: '',
    isWorkerAvailable: '',
    gender: ''
  });

  const [tempFilters, setTempFilters] = useState<FiltersInfo>({
    search: '',
    workerType: '',
    isWorkerAvailable: '',
    gender: ''
  });

  const fetchWorkers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query string con filtros
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await apiRequest(`/api/admin/workers?${queryParams.toString()}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Error al cargar trabajadores');
      }

      const result: WorkersResponse = await response.json();
      setWorkers(result.data);
      setPagination(result.pagination);
      setTotalWorkersInApp(result.totalWorkersInApp || 0);
      setTotalFilteredWorkers(result.totalWorkers || 0);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar trabajadores');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchWorkers(currentPage);
  }, [currentPage, fetchWorkers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1); // Reset a la primera página al aplicar filtros
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as 'asc' | 'desc');
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      workerType: '',
      isWorkerAvailable: '',
      gender: ''
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setCurrentPage(1);
  };

  const handleViewWorker = (workerId: string) => {
    navigate(`/admin/workers/${workerId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };


  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Cargando trabajadores...</Text>
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

  const renderWorkerInfo = (worker: Worker) => {
    const clientesCount = worker.clientesAsignados?.length || 0;
    
    return (
      <Group gap="md" align="center" style={{ flexWrap: 'wrap' }}>
        <Badge 
          color={worker.isWorkerAvailable ? 'green' : 'red'} 
          variant="light" 
          size="sm"
        >
          {worker.isWorkerAvailable ? 'Disponible' : 'No disponible'}
        </Badge>
        
        {worker.workerType && (
          <Badge 
            color="blue" 
            variant="outline" 
            size="sm"
          >
            {worker.workerType === 'Entrenador personal' ? 'Entrenador' :
             worker.workerType === 'Nutricionista' ? 'Nutricionista' :
             worker.workerType === 'Nutricionista y Entrenador personal' ? 'Ambos' :
             worker.workerType}
          </Badge>
        )}
        
        {worker.satisfactionRating !== undefined && (
          <Badge 
            color={worker.satisfactionRating >= 4 ? 'green' : worker.satisfactionRating >= 3 ? 'yellow' : 'red'} 
            variant="light" 
            size="sm"
          >
            ⭐ {worker.satisfactionRating.toFixed(1)}
          </Badge>
        )}
        
        <Badge 
          color="purple" 
          variant="outline" 
          size="sm"
        >
          {clientesCount} cliente{clientesCount !== 1 ? 's' : ''}
        </Badge>
      </Group>
    );
  };

  return (
    <AdminAccessGuard fallbackText="Solo los administradores pueden acceder a la gestión de trabajadores.">
      <Container size="lg" py="xl">
        <Group mb="lg" justify="space-between">
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            color="nutroos-green"
          >
            Volver
          </Button>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
            onClick={handleBackToDashboard}
          >
            Volver al Dashboard
          </Button>
        </Group>

      <Paper shadow="sm" p="md" radius="md" mb="md">
        <Group justify="space-between" align="center">
          <Title order={2} c="nutroos-green.7">
            Gestión de Trabajadores
          </Title>
          <Stack gap="xs" align="flex-start">
            <Text fw={500}>
              Total trabajadores: {totalWorkersInApp}
            </Text>
            <Text fw={500} c="nutroos-green.6">
              Mostrando: {totalFilteredWorkers}
            </Text>
          </Stack>
        </Group>
      </Paper>

      <UserFilters
        filters={tempFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onApplyFilters={handleApplyFilters}
        showApplyButton={true}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        config={{
          search: true,
          gender: true,
          sorting: true,
          customFilters: (
            <>
              <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
                <Select
                  label="Tipo de trabajador"
                  placeholder="Seleccionar tipo"
                  value={tempFilters.workerType}
                  onChange={(value) => handleFilterChange('workerType', value || '')}
                  data={[
                    { value: '', label: 'Todos los tipos' },
                    { value: 'Entrenador personal', label: 'Entrenador personal' },
                    { value: 'Nutricionista', label: 'Nutricionista' },
                    { value: 'Nutricionista y Entrenador personal', label: 'Nutricionista y Entrenador personal' }
                  ]}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
                <Select
                  label="Disponibilidad"
                  placeholder="Seleccionar estado"
                  value={tempFilters.isWorkerAvailable}
                  onChange={(value) => handleFilterChange('isWorkerAvailable', value || '')}
                  data={[
                    { value: '', label: 'Todos' },
                    { value: 'true', label: 'Disponible' },
                    { value: 'false', label: 'No disponible' }
                  ]}
                />
              </Grid.Col>
            </>
          )
        }}
        title="Filtros"
      />

      <Paper shadow="sm" p="md" radius="md">
        <UserList
          users={workers}
          pagination={pagination}
          userPlans={{}}
          onPageChange={handlePageChange}
          onViewUser={handleViewWorker}
          formatDate={formatDate}
          calculateAge={calculateAge}
          renderUserInfo={renderWorkerInfo}
          emptyMessage="No hay trabajadores registrados"
        />
      </Paper>
      </Container>
    </AdminAccessGuard>
  );
};

export default WorkerManagementPage;
