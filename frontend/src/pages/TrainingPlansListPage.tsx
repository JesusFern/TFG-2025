import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Container, Group, LoadingOverlay, Table, Title, ActionIcon, Badge, Text, Paper, Breadcrumbs, Anchor } from '@mantine/core';
import { IconHome, IconChevronRight } from '@tabler/icons-react';
import { IconEdit, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import trainingService from '../services/trainingService';
import type { PlanEntrenamiento } from '../types/training';
import { useAuth } from '../hooks/useAuth';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';

const TrainingPlansListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId') || undefined;
  const [items, setItems] = useState<PlanEntrenamiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const isWorkerTrainer = user?.role === 'worker' && (user.workerType === 'Entrenador personal' || user.workerType === 'Nutricionista y Entrenador personal');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await trainingService.obtenerPlanes(clientId ? { cliente: clientId } : {});
      setItems(res);
    } catch (e) {
      setNotice({ message: (e as Error).message || 'Error al cargar planes', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      await trainingService.eliminarPlan(id);
      setNotice({ message: 'Plan eliminado', type: 'success' });
      await fetchData();
    } catch (e) {
      setNotice({ message: (e as Error).message || 'Error al eliminar', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Planes', href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm" c="nutroos-green">
      {item.icon && (
        <Group gap={4}>
          {item.icon}
          <span>{item.title}</span>
        </Group>
      )}
      {!item.icon && item.title}
    </Anchor>
  ));

  return (
    <Container size="lg" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      {notice?.message && (
        <GlobalNotificationOverlay
          message={notice.message}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}
      <Paper 
        p="md" 
        mb="lg" 
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderBottom: '1px solid var(--app-border-color)' 
        }}
      >
        <Breadcrumbs separator={<IconChevronRight size={14} />}>{breadcrumbItems}</Breadcrumbs>
      </Paper>

      <Paper withBorder radius="md" p="md" style={{ backgroundColor: 'var(--app-paper-bg)', borderColor: 'var(--app-border-color)' }}>
        <Group justify="space-between" mb="md">
          <Title order={3} c="nutroos-green.6">Planes de entrenamiento{clientId ? ' del cliente' : ''}</Title>
          <Group>
            <ActionIcon variant="light" onClick={() => void fetchData()} aria-label="refrescar">
              <IconRefresh size={18} />
            </ActionIcon>
            {isWorkerTrainer && (
              <Button leftSection={<IconPlus size={16} />} onClick={() => navigate(`/training/planes/crear${clientId ? `?clientId=${clientId}` : ''}`)}>
                Nuevo plan
              </Button>
            )}
          </Group>
        </Group>

      <Table striped withTableBorder withColumnBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Objetivo</Table.Th>
            <Table.Th>Duración (días)</Table.Th>
            <Table.Th>Ses./semana</Table.Th>
            <Table.Th>Visibilidad</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((p) => (
            <Table.Tr key={p._id}>
              <Table.Td>
                <Text style={{ cursor: 'pointer' }} c="nutroos-green.7" fw={600} onClick={() => navigate(`/training/planes/${p._id}`)}>
                  {p.nombre}
                </Text>
              </Table.Td>
              <Table.Td>{p.objetivo}</Table.Td>
              <Table.Td>{p.duracionDias}</Table.Td>
              <Table.Td>{p.sesionesPorSemana}</Table.Td>
              <Table.Td>
                <Badge color={p.publico ? 'green' : 'gray'}>{p.publico ? 'Público' : 'Privado'}</Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" onClick={() => navigate(`/training/planes/${p._id}/editar`)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  {isWorkerTrainer && (
                    <ActionIcon color="red" variant="subtle" onClick={() => void handleDelete(p._id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      </Paper>
    </Container>
  );
};

export default TrainingPlansListPage;


