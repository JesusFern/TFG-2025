import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Button, Group, Paper, Loader, Stack, ThemeIcon, Alert } from '@mantine/core';
import { IconCheck, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import Layout from '../components/layout/Layout';
import { checkPaymentStatus, confirmPayment } from '../services/paymentService';
import { notifications } from '@mantine/notifications';

const PaymentConfirmationPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando el estado de tu pago...');
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id') || searchParams.get('sessionId');
    
    if (!sessionId) {
      setStatus('error');
      setMessage('No se pudo verificar el pago. Identificador de sesión no encontrado.');
      return;
    }
    
    const verifyPayment = async () => {
      try {
        const confirmResult = await confirmPayment(sessionId);
        
        if (confirmResult.success) {
          setStatus('success');
          setMessage('¡Tu pago ha sido procesado correctamente! Tu suscripción está activa.');
          
          notifications.show({
            title: 'Suscripción activada',
            message: '¡Bienvenido! Tu suscripción se ha activado correctamente.',
            color: 'green',
          });
          return;
        }
        
        const statusResult = await checkPaymentStatus(sessionId);
        
        if (statusResult.success && statusResult.payment) {
          if (statusResult.payment.status === 'completed') {
            setStatus('success');
            setMessage('¡Tu pago ha sido procesado correctamente! Tu suscripción está activa.');
            
            notifications.show({
              title: 'Suscripción activada',
              message: '¡Bienvenido! Tu suscripción se ha activado correctamente.',
              color: 'green',
            });
          } else if (statusResult.payment.status === 'pending') {
            setStatus('error');
            setMessage('Tu pago está pendiente. Por favor, espera unos minutos y recarga la página.');
            
            notifications.show({
              title: 'Pago pendiente',
              message: 'Tu pago está siendo procesado. Te notificaremos cuando esté completo.',
              color: 'yellow',
            });
          } else if (statusResult.payment.status === 'failed') {
            setStatus('error');
            setMessage('Tu pago no pudo ser procesado. Por favor, intenta nuevamente.');
            
            notifications.show({
              title: 'Pago fallido',
              message: 'No se pudo procesar tu pago. Por favor, intenta nuevamente.',
              color: 'red',
            });
          } else {
            setStatus('error');
            setMessage(`Estado del pago: ${statusResult.payment.status}`);
          }
        } else {
          setStatus('error');
          setMessage(statusResult.message || 'Hubo un problema al verificar tu pago.');
          
          notifications.show({
            title: 'Error en la verificación',
            message: statusResult.message || 'No se pudo verificar el estado del pago.',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Error al verificar el pago:', error);
        setStatus('error');
        setMessage('Hubo un error al verificar el estado de tu pago.');
        
        notifications.show({
          title: 'Error',
          message: 'Hubo un problema al verificar tu pago. Por favor, contacta con soporte.',
          color: 'red',
        });
      }
    };
    
    verifyPayment();
  }, [location.search, navigate]);
  
  return (
    <Layout>
      <Container size="sm" py={40}>
        <Paper p="xl" radius="md" withBorder shadow="md">
          {status === 'loading' && (
            <Stack align="center" p="xl" gap="lg">
              <Loader size="lg" color="nutroos-green" />
              <Text size="lg" ta="center">{message}</Text>
            </Stack>
          )}
          
          {status === 'success' && (
            <Stack align="center" p="xl" gap="lg">
              <ThemeIcon size={60} radius={100} color="nutroos-green">
                <IconCheck size={30} />
              </ThemeIcon>
              <Title order={2} c="nutroos-green.7" ta="center">¡Pago completado!</Title>
              <Text size="lg" ta="center">{message}</Text>
              <Alert icon={<IconInfoCircle size={16} />} color="nutroos-green" variant="light">
                <Text size="sm">
                  Tu suscripción está ahora activa. Puedes acceder a todas las funciones premium desde tu dashboard.
                </Text>
              </Alert>
              <Group gap="md">
                <Button color="nutroos-green" onClick={() => navigate('/dashboard')}>
                  Ir a mi dashboard
                </Button>
                <Button variant="outline" color="nutroos-green" onClick={() => navigate('/perfil')}>
                  Ver mi suscripción
                </Button>
              </Group>
            </Stack>
          )}
          
          {status === 'error' && (
            <Stack align="center" p="xl" gap="lg">
              <ThemeIcon size={60} radius={100} color="red">
                <IconAlertCircle size={30} />
              </ThemeIcon>
              <Title order={2} c="red" ta="center">Ha ocurrido un problema</Title>
              <Text size="lg" ta="center">{message}</Text>
              <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
                <Text size="sm">
                  Si el problema persiste, por favor contacta con nuestro equipo de soporte.
                </Text>
              </Alert>
              <Group gap="md">
                <Button variant="filled" color="nutroos-green" onClick={() => navigate('/planes-suscripcion')}>
                  Volver a planes de suscripción
                </Button>
                <Button variant="outline" color="gray" onClick={() => window.location.reload()}>
                  Reintentar verificación
                </Button>
              </Group>
            </Stack>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};

export default PaymentConfirmationPage;