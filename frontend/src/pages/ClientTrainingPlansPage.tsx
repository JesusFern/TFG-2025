import React, { useState, useEffect } from 'react';
import { Container, SimpleGrid, Group, Button, Paper, Title, Text, Stack, Modal, Alert, Badge, Divider } from '@mantine/core';
import { IconBarbell, IconTarget, IconArrowLeft, IconSparkles, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLoadingState } from '../hooks/useLoadingState';
import { PlanEntrenamiento } from '../types/training';
import { trainingService } from '../services/trainingService';
import LoadingErrorStates from '../components/atoms/LoadingErrorStates';
import EmptyState from '../components/molecules/EmptyState';
import PlanCard from '../components/molecules/PlanCard';
import GenerateTrainingPlanForm from '../components/molecules/GenerateTrainingPlanForm';

const ClientTrainingPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, startLoading, stopLoading, setErrorState } = useLoadingState();
  
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    tipoPlan: string;
    limitePlanes: number;
    planesCreados: number;
  } | null>(null);

  useEffect(() => {
    const cargarPlanes = async () => {
      if (!user?._id) return;
      
      try {
        startLoading();
        
        // Obtener planes asignados al cliente (solo publicados, no borradores)
        const response = await trainingService.obtenerPlanes({
          cliente: user._id,
          activo: true
        });
        
        setPlanes(response);
      } catch (err) {
        console.error('Error al cargar los planes de entrenamiento:', err);
        setErrorState('Error al cargar los planes de entrenamiento');
      } finally {
        stopLoading();
      }
    };

    cargarPlanes();
    cargarInfoSuscripcion();
  }, [user, startLoading, stopLoading, setErrorState]);

  const cargarInfoSuscripcion = async () => {
    try {
      const response = await trainingService.obtenerInfoSuscripcion();
      setSubscriptionInfo({
        tipoPlan: response.tipoPlan,
        limitePlanes: response.limitePlanes,
        planesCreados: response.planesCreados
      });
    } catch (err) {
      console.error('Error al cargar información de suscripción:', err);
      // Si hay error, usar valores por defecto
      setSubscriptionInfo({
        tipoPlan: 'Gratuito',
        limitePlanes: 3,
        planesCreados: 0
      });
    }
  };

  const handleVerPlan = (planId: string) => {
    navigate(`/mis-entrenamientos/${planId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGenerateSuccess = (planId: string) => {
    setShowGenerateModal(false);
    // Recargar los planes para mostrar el nuevo plan
    window.location.reload();
    // Redirigir a los detalles del plan
    navigate(`/mis-entrenamientos/${planId}`);
  };

  const handleGenerateError = (errorMessage: string) => {
    console.error('Error al generar plan:', errorMessage);
    // El error se manejará dentro del componente GenerateTrainingPlanForm
  };

  const canGeneratePlan = () => {
    return subscriptionInfo && subscriptionInfo.planesCreados < subscriptionInfo.limitePlanes;
  };

  return (
    <LoadingErrorStates loading={loading} error={error}>
      <Container size="lg" py="xl">
        <Stack gap="lg">
          {/* Header con botón de volver al dashboard */}
          <Paper p="lg" radius="lg" withBorder>
            <Group justify="space-between" align="center">
              <div>
                <Title order={1}>Mis Planes de Entrenamiento</Title>
                <Text c="dimmed" size="lg">
                  Planes personalizados creados por tu entrenador
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  {planes.length} Plan{planes.length !== 1 ? 'es' : ''}
                </Text>
              </div>
              <Button
                leftSection={<IconArrowLeft size={16} />}
                variant="light"
                onClick={handleBackToDashboard}
              >
                Volver al Dashboard
              </Button>
            </Group>
          </Paper>
        
        {/* Panel de generación de plantillas */}
        {subscriptionInfo && (
          <Paper p="lg" radius="lg" withBorder bg="nutroos-green.0">
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={3} c="nutroos-green.7">
                    <Group gap="xs">
                      <IconSparkles size={24} />
                      Genera tu propio plan de entrenamiento
                    </Group>
                  </Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    Crea un plan personalizado usando nuestras plantillas inteligentes
                  </Text>
                </div>
                <Badge
                  color={subscriptionInfo.planesCreados < subscriptionInfo.limitePlanes ? 'green' : 'red'}
                  variant="light"
                  size="lg"
                >
                  {subscriptionInfo.planesCreados}/{subscriptionInfo.limitePlanes} planes
                </Badge>
              </Group>

              {canGeneratePlan() ? (
                <Group>
                  <Button
                    leftSection={<IconSparkles size={16} />}
                    color="nutroos-green"
                    onClick={() => setShowGenerateModal(true)}
                  >
                    Generar Plan Personalizado
                  </Button>
                  <Text size="sm" c="dimmed">
                    Plan {subscriptionInfo.tipoPlan} • {subscriptionInfo.limitePlanes - subscriptionInfo.planesCreados} planes restantes
                  </Text>
                </Group>
              ) : (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red.5"
                  variant="filled"
                  radius="md"
                >
                  <Text size="sm">
                    Has alcanzado el límite de planes para tu suscripción {subscriptionInfo.tipoPlan}. 
                    Actualiza tu plan para crear más planes personalizados.
                  </Text>
                </Alert>
              )}
            </Stack>
          </Paper>
        )}

        {/* Divider */}
        {planes.length > 0 && <Divider />}

        {planes.length === 0 ? (
          <EmptyState
            icon={
              <IconBarbell 
                size={64} 
                color="#868e96"
                stroke={1}
              />
            }
            title="No tienes planes de entrenamiento asignados"
            description={
              subscriptionInfo?.tipoPlan === 'Gratuito' 
                ? "Con el plan gratuito puedes generar hasta 3 planes personalizados usando nuestras plantillas inteligentes. ¡Prueba a crear tu primer plan!"
                : "Tu entrenador aún no ha creado ningún plan personalizado para ti. Contacta con él para comenzar tu rutina de ejercicios."
            }
            buttonText={subscriptionInfo?.tipoPlan === 'Gratuito' ? undefined : "Contactar Entrenador"}
            buttonIcon={subscriptionInfo?.tipoPlan === 'Gratuito' ? undefined : <IconTarget size={16} />}
            onButtonClick={subscriptionInfo?.tipoPlan === 'Gratuito' ? undefined : () => navigate('/chat')}
          />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {planes.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                onClick={handleVerPlan}
              />
            ))}
          </SimpleGrid>
        )}
        </Stack>
      </Container>

      {/* Modal para generar plantilla */}
      <Modal
        zIndex={1000}
        opened={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generar Plan Personalizado"
        size="lg"
        centered
      >
        <GenerateTrainingPlanForm
          onSuccess={handleGenerateSuccess}
          onError={handleGenerateError}
          userSubscription={subscriptionInfo || undefined}
        />
      </Modal>
    </LoadingErrorStates>
  );
};

export default ClientTrainingPlansPage;
