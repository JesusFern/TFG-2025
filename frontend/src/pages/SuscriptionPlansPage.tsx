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
  Loader
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { PricingCard } from '../components/molecules/PricingCard';
import { getPlansWithUserStatus, SuscriptionPlan as ApiSuscriptionPlan } from '../services/suscriptionPlanService';
import { createCheckoutSession, createUpgradeCheckoutSession, CheckoutResponse } from '../services/paymentService';
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
      'Gratuito': [] as ApiSuscriptionPlan[],
      'Nutricion': [] as ApiSuscriptionPlan[],
      'Entrenamiento personal': [] as ApiSuscriptionPlan[],
      'Nutrición y entrenamiento personal': [] as ApiSuscriptionPlan[]
    };
    
    planes.forEach(plan => {
      if (plan.tipoPrecio === 'Gratuito') {
        grouped['Gratuito'].push(plan);
      } else if (plan.tipoPlan && grouped[plan.tipoPlan as keyof typeof grouped]) {
        grouped[plan.tipoPlan as keyof typeof grouped].push(plan);
      }
    });
    
    return grouped;
  };
  
  // Función para obtener el título del tipo de plan
  const getTypeTitle = (tipoPlan: string) => {
    switch (tipoPlan) {
      case 'Gratuito':
        return 'Plan Gratuito';
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
        // Verificar si hay parámetros de éxito de Stripe
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const sessionId = urlParams.get('sessionId');
        const upgrade = urlParams.get('upgrade');
        
        if (success === 'true' && (sessionId || upgrade === 'true')) {
          console.log('Procesando pago completado de Stripe:', sessionId || 'upgrade=true');
          
          // Mostrar notificación de procesamiento
          notifications.show({
            id: 'processing-payment-return',
            title: 'Procesando pago...',
            message: 'Estamos activando tu suscripción, por favor espera.',
            color: 'blue',
            loading: true,
            autoClose: false,
          });
          
          try {
            let confirmUrl;
            
            if (sessionId) {
              // Si tenemos sessionId, usarlo directamente
              confirmUrl = `/api/suscription-plans/payment/confirm?sessionId=${sessionId}`;
            } else {
              // Si no tenemos sessionId pero tenemos upgrade=true, procesar upgrades pendientes
              confirmUrl = `/api/suscription-plans/process-pending-upgrades`;
            }
            
            // Confirmar el pago en el backend
            console.log('Llamando a:', confirmUrl);
            console.log('Método:', sessionId ? 'GET' : 'POST');
            
            const response = await fetch(confirmUrl, {
              method: sessionId ? 'GET' : 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('Respuesta del servidor:', response.status, response.statusText);
            
            // Cerrar notificación de procesamiento
            notifications.hide('processing-payment-return');
            
            if (response.ok) {
              // Verificar si es un cambio de plan (upgrade=true en la URL)
              if (upgrade === 'true') {
                notifications.show({
                  title: '¡Plan actualizado!',
                  message: 'Tu plan de suscripción ha sido cambiado correctamente',
                  color: 'green'
                });
                
                // Redirigir a la página de profesionales después de un breve delay
                setTimeout(() => {
                  navigate('/profesionales');
                }, 2000);
              } else {
                notifications.show({
                  title: '¡Pago procesado!',
                  message: 'Tu suscripción ha sido activada correctamente',
                  color: 'green'
                });
              }
            } else {
              console.error('Error confirmando pago:', await response.text());
              notifications.show({
                title: 'Error',
                message: 'Hubo un problema al procesar tu pago. Por favor, contacta con soporte.',
                color: 'red'
              });
            }
          } catch (error) {
            console.error('Error procesando pago:', error);
            notifications.hide('processing-payment-return');
            notifications.show({
              title: 'Error de conexión',
              message: 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.',
              color: 'red'
            });
          }
          
          // Limpiar la URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
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
          // Agregar plan gratuito personalizado si no existe
          let planesConBeneficios = planesResponse.data.plans.map(plan => ({
            ...plan,
            beneficios: plan.beneficios || []
          }));

          // Si no hay plan gratuito en la respuesta, agregar uno personalizado
          const hasFreePlan = planesConBeneficios.some(plan => plan.tipoPrecio === 'Gratuito');
          if (!hasFreePlan) {
            const planGratuito = {
              _id: 'gratuito-personalizado',
              nombre: 'Plan Gratuito',
              descripcion: 'Acceso básico gratuito a la plataforma',
              tipoPrecio: 'Gratuito' as const,
              tipoPlan: null,
              precioMensual: 0,
              precioTrimestral: 0,
              precioAnual: 0,
              beneficios: [
                'Acceso a las dietas plantilla de la aplicación',
                'Acceso a los entrenamientos plantilla de la aplicación'
              ],
              isUserSubscribed: isAuthenticated && (!currentSubscription || !currentSubscription.subscription)
            };
            planesConBeneficios = [planGratuito, ...planesConBeneficios];
          }
          
          console.log('SuscriptionPlansPage: Planes procesados:', planesConBeneficios);
          setPlanes(planesConBeneficios);
        } else {
          console.warn('SuscriptionPlansPage: No se obtuvieron planes válidos');
          setPlanes([]);
        }

        // Establecer la suscripción actual
        setCurrentSubscription(subscriptionResponse);
        
        // Actualizar el estado de suscripción del plan gratuito
        setPlanes(prevPlanes => 
          prevPlanes.map(plan => {
            if (plan.tipoPrecio === 'Gratuito') {
              return {
                ...plan,
                isUserSubscribed: isAuthenticated && (!subscriptionResponse || !subscriptionResponse.subscription)
              };
            }
            return plan;
          })
        );
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
    
    // Determinar si es un upgrade
    const currentPlan = currentSubscription?.subscription?.planId;
    const planSeleccionado = planes.find(plan => plan._id === planId);
    
    // Si el usuario tiene una suscripción activa, cualquier cambio es un "esChange"
    const esChange = currentPlan && planSeleccionado && currentPlan.tipoPlan !== planSeleccionado.tipoPlan;
    
    const paymentFunction = esChange ? 
      createUpgradeCheckoutSession(planId, frecuenciaPago) : 
      createCheckoutSession(planId, frecuenciaPago);
    
    paymentFunction
      .then((response) => {
        console.log('Respuesta de checkout:', response);
        handlePaymentResponse(response);
      })
      .catch((error) => {
        console.error('Error en checkout:', error);
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

    // Verificar si el usuario puede suscribirse a este plan
    
    // Manejo especial para plan gratuito
    if (planSeleccionado.tipoPrecio === 'Gratuito') {
      if (!isAuthenticated) {
        navigate('/register');
        return;
      }
      
      if (planSeleccionado.isUserSubscribed) {
        notifications.show({
          title: 'Plan actual',
          message: 'Ya tienes acceso al plan gratuito',
          color: 'blue'
        });
        return;
      }
      
      // Para el plan gratuito, no necesitamos modal de confirmación
      notifications.show({
        title: 'Plan gratuito activado',
        message: 'Ya tienes acceso a las dietas y entrenamientos plantilla',
        color: 'green'
      });
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
    
    // Verificar si es un cambio de plan
    const currentPlanForChange = currentSubscription?.subscription?.planId;
    const esChange = currentPlanForChange && currentPlanForChange.tipoPlan !== planSeleccionado.tipoPlan;
    
    console.log('🔍 Debug change logic:');
    console.log('currentPlanForChange:', currentPlanForChange);
    console.log('planSeleccionado.tipoPlan:', planSeleccionado.tipoPlan);
    console.log('esChange:', esChange);
    
    try {
      console.log('Intentando abrir modal...');
      const modalResult = modals.openConfirmModal({
        title: esChange ? 
          `Cambiar a ${planSeleccionado.nombre}` : 
          `Suscripción al plan ${planSeleccionado.nombre}`,
        children: (
          <Text size="sm">
            {esChange ? (
              <>
                ¿Estás seguro de que quieres cambiar tu plan de suscripción a {planSeleccionado.nombre}?
                <br /><br />
                <strong>Precio completo:</strong> 
                {frecuenciaPago === 'mensual' && ` ${planSeleccionado.precioMensual}€ al mes`}
                {frecuenciaPago === 'trimestral' && ` ${planSeleccionado.precioTrimestral}€ cada tres meses`}
                {frecuenciaPago === 'anual' && ` ${planSeleccionado.precioAnual}€ al año`}
                <br />
                <em>Se actualizarán las fechas de inicio y fin de tu suscripción.</em>
              </>
            ) : (
              <>
                ¿Estás seguro de que quieres suscribirte al plan {planSeleccionado.nombre} con pago {frecuenciaPago}?
                {frecuenciaPago === 'mensual' && 
                  ` El costo será de ${planSeleccionado.precioMensual}€ al mes.`}
                {frecuenciaPago === 'trimestral' && 
                  ` El costo será de ${planSeleccionado.precioTrimestral}€ cada tres meses.`}
                {frecuenciaPago === 'anual' && 
                  ` El costo será de ${planSeleccionado.precioAnual}€ al año.`}
              </>
            )}
          </Text>
        ),
        labels: { confirm: esChange ? 'Cambiar mi plan de suscripción' : 'Continuar con el pago', cancel: 'Cancelar' },
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
                            isUserSubscribed={plan.tipoPrecio === 'Gratuito' ? 
                              (isAuthenticated && (!currentSubscription || !currentSubscription.subscription)) : 
                              plan.isUserSubscribed}
                            isSubmitting={isSubmitting === plan._id}
                            destacado={tipoPlan === 'Gratuito'}
                            hasActiveSubscription={!!(currentSubscription && currentSubscription.subscription)}
                            currentPlan={currentSubscription?.subscription?.planId ? {
                              ...currentSubscription.subscription.planId,
                              id: currentSubscription.subscription.planId._id,
                              tipoPrecio: currentSubscription.subscription.planId.tipoPrecio as "Gratuito" | "Básico" | "Pro"
                            } : null}
                          />
                        ))}
                      </Stack>
                    </Box>
                  );
                })}
              </Group>
            </Box>
          )}
          
        </Stack>
      </Container>
    </Layout>
  );
};

export default SuscriptionPlansPage;