import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Container, Group, LoadingOverlay, Table, Title, ActionIcon, Badge, Paper, Breadcrumbs, Anchor } from '@mantine/core';
import { IconHome, IconChevronRight } from '@tabler/icons-react';
import { IconEdit, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import trainingService from '../services/trainingService';
import type { Ejercicio } from '../types/training';
import { useAuth } from '../hooks/useAuth';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';

const EjerciciosListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const isWorkerTrainer = user?.role === 'worker' && (user.workerType === 'Entrenador personal' || user.workerType === 'Nutricionista y Entrenador personal');

  const load = async () => {
    setLoading(true);
    try {
      const res = await trainingService.obtenerEjercicios();
      setItems(res);
    } catch (e) {
      setNotice({ message: (e as Error).message || 'Error al cargar ejercicios', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      await trainingService.eliminarEjercicio(id);
      setNotice({ message: 'Ejercicio eliminado', type: 'success' });
      await load();
    } catch (e) {
      setNotice({ message: (e as Error).message || 'Error al eliminar', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Ejercicios', href: '#' },
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
          <Title order={3} c="nutroos-green.6">Ejercicios</Title>
          <Group>
            <ActionIcon variant="light" onClick={() => void load()} aria-label="refrescar">
              <IconRefresh size={18} />
            </ActionIcon>
            {isWorkerTrainer && (
              <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/training/ejercicios/crear')}>
                Nuevo ejercicio
              </Button>
            )}
          </Group>
        </Group>

      <Table striped withTableBorder withColumnBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Grupo muscular</Table.Th>
            <Table.Th>Dificultad</Table.Th>
            <Table.Th>Intensidad</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((e) => (
            <Table.Tr key={e._id}>
              <Table.Td>{e.nombre}</Table.Td>
              <Table.Td>{e.grupoMuscular}</Table.Td>
              <Table.Td><Badge color="orange">{e.nivelDificultad}</Badge></Table.Td>
              <Table.Td><Badge color="grape">{e.nivelIntensidad}</Badge></Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" onClick={() => navigate(`/training/ejercicios/${e._id}/editar`)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  {isWorkerTrainer && (
                    <ActionIcon color="red" variant="subtle" onClick={() => void handleDelete(e._id)}>
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

export default EjerciciosListPage;


