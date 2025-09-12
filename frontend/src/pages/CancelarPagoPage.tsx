import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Button, Group, Paper, Stack, ThemeIcon, Alert } from '@mantine/core';
import { IconX, IconInfoCircle } from '@tabler/icons-react';
import Layout from '../components/layout/Layout';

const PaymentCancellationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Container size="sm" py={40}>
        <Paper p="xl" radius="md" withBorder shadow="md">
          <Stack align="center" p="xl" gap="lg">
            <ThemeIcon size={60} radius={100} color="orange">
              <IconX size={30} />
            </ThemeIcon>
            <Title order={2} c="orange" ta="center">Pago cancelado</Title>
            <Text size="lg" ta="center">
              Has cancelado el proceso de pago. No se ha realizado ningún cargo.
            </Text>
            <Alert icon={<IconInfoCircle size={16} />} color="orange" variant="light">
              <Text size="sm">
                Si cambias de opinión, puedes volver a intentar suscribirte en cualquier momento.
              </Text>
            </Alert>
            <Group gap="md">
              <Button color="nutroos-green" onClick={() => navigate('/planes-suscripcion')}>
                Volver a planes de suscripción
              </Button>
              <Button variant="outline" color="gray" onClick={() => navigate('/dashboard')}>
                Ir al dashboard
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Layout>
  );
};

export default PaymentCancellationPage;
