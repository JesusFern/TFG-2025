import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Group, 
  SegmentedControl, 
  Box,
  Center,
  Loader,
  SimpleGrid
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { PricingCard } from '../components/molecules/PricingCard';
import { getPlansWithUserStatus, SuscriptionPlan as ApiSuscriptionPlan } from '../services/suscriptionPlanService';
import { createCheckoutSession, CheckoutResponse } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { getUserSubscription, SubscriptionResponse } from '../services/paymentService';

const SuscriptionPlansPage: React.FC = () => {
  const [frecuenciaPago, setFrecuenciaPago] = useState<'mensual' | 'trimestral' | 'anual'>('mensual');
  const [planes, setPlanes] = useState<ApiSuscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionResponse | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Función para agrupar planes por tipo
  const groupPlansByType = (planes: ApiSuscriptionPlan[]) => {
    const grouped = {
      'Nutricion': [] as ApiSuscriptionPlan[],
      'Entrenamiento personal': [] as ApiSuscriptionPlan[],
      'Nutrición y entrenamiento personal': [] as ApiSuscriptionPlan[]
    };
    
    planes.forEach(plan => {
      if (plan.tipoPlan && grouped[plan.tipoPlan as keyof typeof grouped]) {
        grouped[plan.tipoPlan as keyof typeof grouped].push(plan);
      }
    });
    
    return grouped;
  };
  
  // Función para obtener el título del tipo de plan
  const getTypeTitle = (tipoPlan: string) => {
    switch (tipoPlan) {
      case 'Nutricion':
        return 'Nutrición';
      case 'Entrenamiento personal':
        return 'Entrenamiento Personal';
      case 'Nutrición y entrenamiento personal':
        return 'Nutrición y Entrenamiento';
      default:
        return tipoPlan;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Comprobar primero si hay un token expirado y eliminarlo
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            // Verificación simple de la validez del token (si tiene formato JWT)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
              console.warn('Token con formato inválido, eliminando del localStorage');
              localStorage.removeItem('authToken');
            } else {
              // Validar que no esté expirado
              const tokenPayload = JSON.parse(atob(tokenParts[1]));
              const currentTime = Date.now() / 1000;
              
              if (tokenPayload.exp && tokenPayload.exp <= currentTime) {
                console.warn('Token expirado, eliminando del localStorage');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
              }
            }
          } catch (err) {
            console.warn('Error al analizar el token, eliminando del localStorage', err);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        }
        
        // Obtener planes y suscripción actual en paralelo
        const [planesResponse, subscriptionResponse] = await Promise.all([
          getPlansWithUserStatus(),
          isAuthenticated ? getUserSubscription() : Promise.resolve(null)
        ]);
        
        console.log('SuscriptionPlansPage: Respuesta de planes recibida:', planesResponse);
        console.log('SuscriptionPlansPage: Respuesta de suscripción recibida:', subscriptionResponse);
        
        if (planesResponse && planesResponse.success && planesResponse.data.plans && planesResponse.data.plans.length > 0) {
          // Filtrar el plan gratuito y usar los beneficios de la API directamente
          const planesConBeneficios = planesResponse.data.plans
            .filter(plan => plan.tipoPrecio !== 'Gratuito') // Filtrar el plan gratuito
            .map(plan => ({
              ...plan,
              beneficios: plan.beneficios || []
            }));
          
          console.log('SuscriptionPlansPage: Planes procesados:', planesConBeneficios);
          setPlanes(planesConBeneficios);
        } else {
          console.warn('SuscriptionPlansPage: No se obtuvieron planes válidos');
          setPlanes([]);
        }

        // Establecer la suscripción actual
        setCurrentSubscription(subscriptionResponse);
      } catch (error) {
        console.error('SuscriptionPlansPage: Error al obtener los datos:', error);
        setPlanes([]);
        setCurrentSubscription(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handlePaymentResponse = (response: CheckoutResponse) => {
    console.log('Respuesta del pago:', response);
    
    // Cerrar notificación de procesamiento
    notifications.hide('processing-payment');
    
    if (response.success) {
      if (response.redirect) {
        console.log('Redirigiendo a:', response.redirect);
        notifications.show({
          title: 'Plan activado',
          message: 'Tu plan gratuito ha sido activado correctamente',
          color: 'green'
        });
        navigate(response.redirect);
        return;
      }
      
      if (response.checkoutUrl) {
        console.log('Redirigiendo a Stripe:', response.checkoutUrl);
        notifications.show({
          title: 'Redirigiendo a Stripe',
          message: 'Te estamos llevando a la página de pago seguro de Stripe.',
          color: 'blue'
        });
        
        // Pequeño delay para que el usuario vea la notificación
        const redirectToStripe = () => {
          console.log('Ejecutando redirección a Stripe...');
          window.location.href = response.checkoutUrl!;
        };
        setTimeout(redirectToStripe, 1000);
        return;
      }

      console.error('No se recibió URL de pago válida. Respuesta:', response);
      notifications.show({
        title: 'Error',
        message: 'No se recibió una URL de pago válida',
        color: 'red'
      });
    } else {
      console.error('Error en la respuesta del pago:', response);
      notifications.show({
        title: 'Error al procesar el pago',
        message: response.message || 'No se pudo procesar la suscripción',
        color: 'red'
      });
    }
  };

  const handlePaymentError = (error: unknown) => {
    // Cerrar notificación de procesamiento
    notifications.hide('processing-payment');
    
    console.error('Error al procesar la suscripción:', error);
    notifications.show({
      title: 'Error de conexión',
      message: 'Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.',
      color: 'red'
    });
  };

  const processPayment = (planId: string) => {
    console.log('Iniciando proceso de pago para plan:', planId, 'con frecuencia:', frecuenciaPago);
    setIsSubmitting(planId);
    
    // Mostrar notificación de procesamiento
    notifications.show({
      id: 'processing-payment',
      title: 'Procesando pago...',
      message: 'Estamos preparando tu pago, por favor espera.',
      color: 'blue',
      loading: true,
      autoClose: false,
    });
    
    createCheckoutSession(planId, frecuenciaPago)
      .then((response) => {
        console.log('Respuesta de createCheckoutSession:', response);
        handlePaymentResponse(response);
      })
      .catch((error) => {
        console.error('Error en createCheckoutSession:', error);
        handlePaymentError(error);
      })
      .finally(() => setIsSubmitting(null));
  };

  const handleSelectPlan = (planId: string) => {
    console.log('handleSelectPlan llamado con planId:', planId);
    console.log('Planes disponibles:', planes);
    
    // Encontrar el plan seleccionado
    const planSeleccionado = planes.find(plan => plan._id === planId);
    console.log('Plan seleccionado:', planSeleccionado);
    
    if (!planSeleccionado) {
      console.error('Plan no encontrado para ID:', planId);
      notifications.show({
        title: 'Error',
        message: 'Plan no encontrado',
        color: 'red'
      });
      return;
    }
    
    if (planSeleccionado.tipoPrecio === 'Gratuito' && !isAuthenticated) {
      navigate('/register');
      return;
    }
    
    if (planSeleccionado.isUserSubscribed) {
      notifications.show({
        title: 'Plan actual',
        message: 'Ya estás suscrito a este plan',
        color: 'blue'
      });
      return;
    }
    
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo al login');
      notifications.show({
        title: 'Inicio de sesión requerido',
        message: 'Debes iniciar sesión para suscribirte a este plan',
        color: 'blue'
      });
      navigate('/login', { 
        state: { 
          redirectTo: '/planes-suscripcion',
          selectedPlanId: planId,
          frecuenciaPago 
        } 
      });
      return;
    }
    
    console.log('Usuario autenticado, abriendo modal de confirmación');
    
    try {
      console.log('Intentando abrir modal...');
      const modalResult = modals.openConfirmModal({
        title: `Suscripción al plan ${planSeleccionado.nombre}`,
        children: (
          <Text size="sm">
            ¿Estás seguro de que quieres suscribirte al plan {planSeleccionado.nombre} con pago {frecuenciaPago}?
            {frecuenciaPago === 'mensual' && 
              ` El costo será de ${planSeleccionado.precioMensual}€ al mes.`}
            {frecuenciaPago === 'trimestral' && 
              ` El costo será de ${planSeleccionado.precioTrimestral}€ cada tres meses.`}
            {frecuenciaPago === 'anual' && 
              ` El costo será de ${planSeleccionado.precioAnual}€ al año.`}
          </Text>
        ),
        labels: { confirm: 'Continuar con el pago', cancel: 'Cancelar' },
        confirmProps: { color: 'nutroos-green' },
        size: 'md',
        centered: true,
        overlayProps: { backgroundOpacity: 0.55, blur: 3 },
        styles: {
          root: {
            marginTop: '80px',
          },
          header: {
            marginBottom: '16px',
          },
          body: {
            paddingBottom: '20px',
          }
        },
        onConfirm: () => {
          console.log('Usuario confirmó el pago, iniciando proceso...');
          processPayment(planId);
        },
        onCancel: () => {
          console.log('Usuario canceló el modal');
        }
      });
      console.log('Modal abierto exitosamente:', modalResult);
    } catch (error) {
      console.error('Error al abrir el modal:', error);
      // Fallback: procesar el pago directamente sin modal
      console.log('Procesando pago directamente como fallback...');
      processPayment(planId);
    }
  };

  return (
    <Layout>
      <Container size="xl" py="md">
        <Stack gap="lg" align="center">
          <Title order={1} ta="center" size="h2" c="nutroos-green.7">
            Planes de Suscripción
          </Title>
          
          <Text c="dimmed" ta="center" size="md" maw={600}>
            Elige el plan que mejor se adapte a tus necesidades
          </Text>
          
          {/* Información de suscripción actual */}
          {isAuthenticated && currentSubscription && currentSubscription.subscription && (
            <Box 
              p="md" 
              style={{ 
                backgroundColor: 'var(--mantine-color-body)', 
                borderRadius: '8px',
                border: '1px solid var(--mantine-color-dimmed)'
              }}
            >
              <Group justify="center" gap="sm">
                <Text size="sm" fw={500} c="dimmed">
                  ✓ Suscripción actual: {currentSubscription.subscription.planId.nombre}
                </Text>
                <Text size="xs" c="dimmed">
                  Vence: {new Date(currentSubscription.subscription.fechaFin).toLocaleDateString('es-ES')}
                </Text>
              </Group>
            </Box>
          )}
          
          <Group justify="center" mb="lg">
            <SegmentedControl
              size="md"
              value={frecuenciaPago}
              onChange={(value: string) => setFrecuenciaPago(value as 'mensual' | 'trimestral' | 'anual')}
              data={[
                { label: 'Mensual', value: 'mensual' },
                { label: 'Trimestral', value: 'trimestral' },
                { label: 'Anual', value: 'anual' },
              ]}
              color="nutroos-green"
            />
          </Group>
        
          {isLoading ? (
            <Center style={{ minHeight: '300px' }}>
              <Loader size="xl" />
            </Center>
          ) : (
            <Box w="100%">
              <Group justify="center" gap="xl" align="flex-start" wrap="nowrap">
                {Object.entries(groupPlansByType(planes)).map(([tipoPlan, planesDelTipo]) => {
                  if (planesDelTipo.length === 0) return null;
                  
                  return (
                    <Box key={tipoPlan} style={{ width: '300px', flexShrink: 0 }}>
                      <Title order={3} ta="center" mb="md" c="nutroos-green.6" size="sm">
                        {getTypeTitle(tipoPlan)}
                      </Title>
                      
                      <Stack gap="sm">
                        {planesDelTipo.map((plan) => (
                          <PricingCard 
                            key={plan._id}
                            plan={{
                              ...plan,
                              id: plan._id,
                              beneficios: plan.beneficios || []
                            }}
                            frecuenciaPago={frecuenciaPago}
                            onSelectPlan={handleSelectPlan}
                            isUserSubscribed={plan.isUserSubscribed}
                            isSubmitting={isSubmitting === plan._id}
                            destacado={false}
                          />
                        ))}
                      </Stack>
                    </Box>
                  );
                })}
              </Group>
            </Box>
          )}
          
          <Box mt="xl" pt="xl">
            <Stack gap="md" maw={800} mx="auto">
              <Title order={3} ta="center" c="nutroos-green.7">
                Preguntas Frecuentes
              </Title>
              
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Box p="md" style={{ textAlign: 'center' }}>
                  <Text fw={600} size="sm" mb="xs">¿Puedo cambiar de plan?</Text>
                  <Text c="dimmed" size="sm">
                    Sí, puedes cambiar cuando quieras.
                  </Text>
                </Box>
                
                <Box p="md" style={{ textAlign: 'center' }}>
                  <Text fw={600} size="sm" mb="xs">¿Hay permanencia?</Text>
                  <Text c="dimmed" size="sm">
                    No, puedes cancelar cuando quieras.
                  </Text>
                </Box>
                
                <Box p="md" style={{ textAlign: 'center' }}>
                  <Text fw={600} size="sm" mb="xs">¿Qué métodos de pago aceptan?</Text>
                  <Text c="dimmed" size="sm">
                    Tarjetas de crédito y débito.
                  </Text>
                </Box>
              </SimpleGrid>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Layout>
  );
};

export default SuscriptionPlansPage;