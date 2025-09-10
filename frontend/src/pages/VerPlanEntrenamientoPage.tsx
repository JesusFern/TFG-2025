import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Card, Container, Group, LoadingOverlay, Paper, Stack, Text, Title, Breadcrumbs, Anchor } from '@mantine/core';
import { IconChevronRight, IconHome, IconUser } from '@tabler/icons-react';
import trainingService from '../services/trainingService';
import type { PlanEntrenamiento } from '../types/training';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { getUserById } from '../services/userService';

const VerPlanEntrenamientoPage: React.FC = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState<PlanEntrenamiento | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [clienteNombres, setClienteNombres] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      if (!planId) return;
      setLoading(true);
      try {
        const data = await trainingService.obtenerPlanPorId(planId);
        setPlan(data);
        if (data.clientes?.length) {
          const entries = await Promise.all(
            data.clientes.map(async (id) => {
              try { const u = await getUserById(id); return [id, u.fullName] as const; } catch { return [id, id] as const; }
            })
          );
          setClienteNombres(Object.fromEntries(entries));
        }
      } catch (e) {
        setNotice({ message: (e as Error).message || 'Error al cargar plan', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [planId]);

  const breadcrumbItems = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Ver plan', href: '#' },
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
    <Container size="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      {notice?.message && (
        <GlobalNotificationOverlay message={notice.message} type={notice.type} onClose={() => setNotice(null)} />
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

      <Card withBorder p="lg" radius="md" style={{ backgroundColor: 'var(--app-paper-bg)', borderColor: 'var(--app-border-color)' }}>
        <Title order={3} mb="md">{plan?.nombre || 'Plan de entrenamiento'}</Title>

        {plan && (
          <Stack gap="md">
            <Paper withBorder p="md" radius="md" style={{ backgroundColor: 'var(--app-paper-bg)', borderColor: 'var(--app-border-color)' }}>
              <Stack gap={4}>
                <Text size="sm" c="dimmed">Objetivo</Text>
                <Text fw={600}>{plan.objetivo || '—'}</Text>
              </Stack>
            </Paper>

            <Group grow>
              <Paper withBorder p="md" radius="md" style={{ backgroundColor: 'var(--app-paper-bg)' }}>
                <Text size="sm" c="dimmed">Duración</Text>
                <Text fw={600}>{plan.duracionDias} días</Text>
              </Paper>
              <Paper withBorder p="md" radius="md" style={{ backgroundColor: 'var(--app-paper-bg)' }}>
                <Text size="sm" c="dimmed">Sesiones/semana</Text>
                <Text fw={600}>{plan.sesionesPorSemana}</Text>
              </Paper>
              <Paper withBorder p="md" radius="md" style={{ backgroundColor: 'var(--app-paper-bg)' }}>
                <Text size="sm" c="dimmed">Visibilidad</Text>
                <Badge color={plan.publico ? 'green' : 'gray'}>{plan.publico ? 'Público' : 'Privado'}</Badge>
              </Paper>
            </Group>

            <Paper withBorder p="md" radius="md" style={{ backgroundColor: 'var(--app-paper-bg)' }}>
              <Text size="sm" c="dimmed" mb={6}>Clientes</Text>
              <Group gap="xs">
                {plan.clientes?.length ? plan.clientes.map((id) => (
                  <Badge key={id} leftSection={<IconUser size={14} />}>{clienteNombres[id] || id}</Badge>
                )) : <Text>—</Text>}
              </Group>
            </Paper>

            {plan.descripcion && (
              <Paper withBorder p="md" radius="md" style={{ backgroundColor: 'var(--app-paper-bg)' }}>
                <Text size="sm" c="dimmed" mb={6}>Descripción</Text>
                <Text>{plan.descripcion}</Text>
              </Paper>
            )}
          </Stack>
        )}
      </Card>
    </Container>
  );
};

export default VerPlanEntrenamientoPage;


