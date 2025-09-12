import React, { useEffect, useState } from 'react';
import { Paper, Group, Text, Badge, ThemeIcon, Stack, Button, Alert } from '@mantine/core';
import { IconCrown, IconCheck, IconAlertCircle, IconCalendar } from '@tabler/icons-react';
import { getUserSubscription, SubscriptionResponse } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

interface CurrentSubscriptionProps {
  className?: string;
}

export const CurrentSubscription: React.FC<CurrentSubscriptionProps> = ({ className }) => {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await getUserSubscription();
        setSubscription(response);
      } catch (error) {
        console.error('Error al obtener la suscripción:', error);
        setSubscription({
          success: false,
          message: 'Error al obtener la suscripción'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <Paper p="lg" radius="lg" withBorder className={className}>
        <Text size="sm" c="dimmed">Cargando información de suscripción...</Text>
      </Paper>
    );
  }

  if (!subscription || !subscription.subscription || subscription.status === 'no-subscription') {
    return (
      <Paper p="lg" radius="lg" withBorder className={className}>
        <Stack gap="md">
          <Group>
            <ThemeIcon color="gray" size="lg" radius="xl">
              <IconAlertCircle size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="sm">Sin suscripción activa</Text>
              <Text size="xs" c="dimmed">
                {subscription?.message || 'No tienes una suscripción activa'}
              </Text>
            </div>
          </Group>
          <Button 
            size="sm" 
            color="nutroos-green" 
            variant="light"
            onClick={() => navigate('/planes-suscripcion')}
          >
            Ver planes disponibles
          </Button>
        </Stack>
      </Paper>
    );
  }

  const { subscription: sub } = subscription;
  const isExpired = subscription.status === 'expirada';
  const isActive = subscription.status === 'activa';

  const getStatusColor = () => {
    if (isExpired) return 'red';
    if (isActive) return 'green';
    return 'yellow';
  };

  const getStatusText = () => {
    if (isExpired) return 'Expirada';
    if (isActive) return 'Activa';
    return 'Pendiente';
  };

  const getPlanIcon = () => {
    if (sub.planId.tipoPrecio === 'Pro') return <IconCrown size={20} />;
    return <IconCheck size={20} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Paper p="lg" radius="lg" withBorder className={className}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <ThemeIcon 
              color={getStatusColor()} 
              size="lg" 
              radius="xl"
            >
              {getPlanIcon()}
            </ThemeIcon>
            <div>
              <Text fw={600} size="sm">{sub.planId.nombre}</Text>
              <Text size="xs" c="dimmed">{sub.planId.descripcion}</Text>
            </div>
          </Group>
          <Badge color={getStatusColor()} variant="light" size="sm">
            {getStatusText()}
          </Badge>
        </Group>

        <Group gap="md">
          <Group gap="xs">
            <IconCalendar size={14} />
            <Text size="xs" c="dimmed">
              Vence: {formatDate(sub.fechaFin)}
            </Text>
          </Group>
          <Badge color="blue" variant="light" size="xs">
            {sub.frecuenciaPago}
          </Badge>
        </Group>

        {isExpired && (
          <Alert color="red" variant="light" icon={<IconAlertCircle size={16} />}>
            <Text size="xs">
              Tu suscripción ha expirado. Renueva para continuar disfrutando de todos los beneficios.
            </Text>
          </Alert>
        )}

        <Button 
          size="sm" 
          color="nutroos-green" 
          variant="light"
          onClick={() => navigate('/planes-suscripcion')}
        >
          {isExpired ? 'Renovar suscripción' : 'Gestionar suscripción'}
        </Button>
      </Stack>
    </Paper>
  );
};
