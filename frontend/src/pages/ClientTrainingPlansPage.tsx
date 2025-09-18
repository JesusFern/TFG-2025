import React, { useState, useEffect } from 'react';
import { Container, SimpleGrid } from '@mantine/core';
import { IconBarbell, IconTarget } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLoadingState } from '../hooks/useLoadingState';
import { PlanEntrenamiento } from '../types/training';
import { trainingService } from '../services/trainingService';
import LoadingErrorStates from '../components/atoms/LoadingErrorStates';
import PageHeader from '../components/molecules/PageHeader';
import EmptyState from '../components/molecules/EmptyState';
import PlanCard from '../components/molecules/PlanCard';

const ClientTrainingPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, startLoading, stopLoading, setErrorState } = useLoadingState();
  
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([]);

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
  }, [user?._id, startLoading, stopLoading, setErrorState]);

  const handleVerPlan = (planId: string) => {
    navigate(`/mis-entrenamientos/${planId}`);
  };

  return (
    <LoadingErrorStates loading={loading} error={error}>
      <Container size="lg" py="xl">
        {/* Header */}
        <PageHeader
          title="Mis Planes de Entrenamiento"
          subtitle="Planes personalizados creados por tu entrenador"
          badgeText={`${planes.length} Plan${planes.length !== 1 ? 'es' : ''}`}
          badgeIcon={<IconBarbell size={20} />}
        />
        
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
            description="Tu entrenador aún no ha creado ningún plan personalizado para ti. Contacta con él para comenzar tu rutina de ejercicios."
            buttonText="Contactar Entrenador"
            buttonIcon={<IconTarget size={16} />}
            onButtonClick={() => navigate('/chat')}
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
      </Container>
    </LoadingErrorStates>
  );
};

export default ClientTrainingPlansPage;
