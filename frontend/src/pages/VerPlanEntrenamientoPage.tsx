import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useMantineColorScheme,
  Box,
  Pagination,
  Divider,
  Group
} from '@mantine/core';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import TrainingPlanHeader from '../components/molecules/TrainingPlanHeader';
import WeekSelector from '../components/molecules/WeekSelector';
import TrainingSessionsTable from '../components/molecules/TrainingSessionsTable';
import TrainingPageContainer from '../components/atoms/TrainingPageContainer';
import TrainingPaper from '../components/atoms/TrainingPaper';
import { useTrainingPlanData } from '../hooks/useTrainingPlanData';
import { useSesionesRange } from '../hooks/useSesionesRange';

const VerPlanEntrenamientoPage: React.FC = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentWeek, setCurrentWeek] = useState(1);
  
  const {
    plan,
    sesiones,
    loading,
    error,
    fechaInicio,
    setError,
    getEjercicioById
  } = useTrainingPlanData({ planId, redirectToEdit: true });

  const sesionesRange = useSesionesRange({ plan, sesiones, currentWeek, fechaInicio });

  const handleWeekChange = (newWeek: number) => {
    setCurrentWeek(newWeek);
  };

  const fechaInicioFormateada = useMemo(() => {
    if (!plan?.fechaInicio) return "";
    return format(new Date(plan.fechaInicio), "d 'de' MMMM 'de' yyyy");
  }, [plan?.fechaInicio]);


  if (!plan && !loading && !error) {
    return (
      <TrainingPageContainer
        error="No se encontró el plan solicitado o no tienes permisos para verlo."
        onBack={() => navigate(-1)}
      >
        <></>
      </TrainingPageContainer>
    );
  }

  return (
    <TrainingPageContainer loading={loading} error={error} onErrorClose={() => setError(null)}>
      <TrainingPaper>
        <TrainingPlanHeader 
          plan={plan!} 
          fechaInicioFormateada={fechaInicioFormateada} 
        />
        
        <Divider my="md" />
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
      </TrainingPaper>
      
      <TrainingPaper mb={0}>
        <WeekSelector
          currentWeek={currentWeek}
          totalWeeks={sesionesRange.totalWeeks}
          sessionsCount={sesionesRange.sesiones.length}
          onWeekChange={handleWeekChange}
        />
        
        <TrainingSessionsTable
          sesionesRange={sesionesRange}
          plan={plan!}
          isDark={isDark}
          getEjercicioById={getEjercicioById}
        />
        
        <Box py="sm" style={{ borderTop: '1px solid var(--app-border-color)' }}>
          <Group justify="center" gap="xs">
            <Pagination
              value={currentWeek}
              onChange={handleWeekChange}
              total={sesionesRange.totalWeeks}
              color="nutroos-green"
              withEdges
              size="sm"
              radius="xs"
            />
          </Group>
        </Box>
      </TrainingPaper>
    </TrainingPageContainer>
  );
};

export default VerPlanEntrenamientoPage;


