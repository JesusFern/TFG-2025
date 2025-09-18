import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container,
  Alert,
  SimpleGrid
} from '@mantine/core';
import { 
  IconAlertCircle,
  IconBarbell
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTrainingData } from '../hooks/useTrainingData';
import { useSesionesRange } from '../hooks/useSesionesRange';
import { Ejercicio } from '../types/training';
import LoadingErrorStates from '../components/atoms/LoadingErrorStates';
import PlanDetailHeader from '../components/molecules/PlanDetailHeader';
import WeekSelector from '../components/molecules/WeekSelector';
import SessionCard from '../components/molecules/SessionCard';
import EmptyState from '../components/molecules/EmptyState';

const ClientTrainingPlanDetailPage: React.FC = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  
  const [currentWeek, setCurrentWeek] = useState(1);
  
  const {
    plan,
    sesiones,
    loading,
    error,
    fechaInicio,
    getEjercicioById
  } = useTrainingData({ planId });

  const sesionesRange = useSesionesRange({ plan, sesiones, currentWeek, fechaInicio });

  const handleWeekChange = (newWeek: number) => {
    setCurrentWeek(newWeek);
  };

  const handleVerSesion = (sesionId: string) => {
    if (planId) {
      navigate(`/mis-entrenamientos/${planId}/sesion/${sesionId}`);
    }
  };

  const handleBackClick = () => {
    navigate('/mis-entrenamientos');
  };

  const fechaInicioFormateada = useMemo(() => {
    if (!plan?.fechaInicio) return "";
    return format(new Date(plan.fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es });
  }, [plan?.fechaInicio]);


  // Solo mostrar error si no hay plan Y no está cargando
  if (!loading && !plan) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          No se encontró el plan solicitado o no tienes permisos para verlo.
        </Alert>
      </Container>
    );
  }

  return (
    <LoadingErrorStates loading={loading} error={error}>
      <Container size="lg" py="xl">
        {/* Header con navegación - solo mostrar si hay plan */}
        {plan && (
          <PlanDetailHeader
            plan={plan}
            fechaInicioFormateada={fechaInicioFormateada}
            onBackClick={handleBackClick}
          />
        )}

        {/* Selector de semana - solo mostrar si hay plan */}
        {plan && (
          <WeekSelector
            currentWeek={currentWeek}
            totalWeeks={sesionesRange.totalWeeks}
            sessionsCount={sesionesRange.sesiones.length}
            onWeekChange={handleWeekChange}
          />
        )}

        {/* Lista de sesiones - solo mostrar si hay plan */}
        {plan && (
          sesionesRange.sesiones.length === 0 ? (
            <EmptyState
              icon={
                <IconBarbell 
                  size={48} 
                  color="#868e96"
                  stroke={1}
                />
              }
              title="No hay sesiones programadas para esta semana"
              description="Tu entrenador aún no ha programado sesiones para esta semana."
            />
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {sesionesRange.sesiones.map((sesionInfo, index) => {
                const sesion = sesionInfo.data;
                if (!sesion) return null;

                // Obtener ejercicios para esta sesión
                const ejercicios = sesion.ejercicios
                  .map(ej => getEjercicioById(ej.ejercicio))
                  .filter((ejercicio): ejercicio is Ejercicio => ejercicio !== null);

                return (
                  <SessionCard
                    key={`${sesionInfo.weekDayIndex}-${index}`}
                    sesion={sesion}
                    fechaFormateada={sesionInfo.fechaFormateada}
                    ejercicios={ejercicios}
                    onSessionClick={handleVerSesion}
                  />
                );
              })}
            </SimpleGrid>
          )
        )}
      </Container>
    </LoadingErrorStates>
  );
};

export default ClientTrainingPlanDetailPage;
