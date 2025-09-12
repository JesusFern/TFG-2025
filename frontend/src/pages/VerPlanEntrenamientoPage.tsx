import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Alert, 
  useMantineColorScheme,
  Box,
  Loader,
  Pagination,
  Button,
  Divider,
  Group
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import trainingService from '../services/trainingService';
import type { PlanEntrenamiento, SesionPlan, Ejercicio } from '../types/training';
import TrainingPlanHeader from '../components/molecules/TrainingPlanHeader';
import WeekSelector from '../components/molecules/WeekSelector';
import TrainingSessionsTable from '../components/molecules/TrainingSessionsTable';

interface SesionInfo {
  weekDayIndex: number;
  weekDayName: string;
  fecha: Date;
  fechaFormateada: string;
  data: SesionPlan | null;
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const VerPlanEntrenamientoPage: React.FC = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [plan, setPlan] = useState<PlanEntrenamiento | null>(null);
  const [sesiones, setSesiones] = useState<SesionPlan[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);

  const sesionesRange = useMemo(() => {
    if (!plan || !fechaInicio) return { sesiones: [] as SesionInfo[], totalWeeks: 0 };
    
    const totalWeeks = Math.ceil(plan.duracionDias / 7);
    const weekStartIndex = (currentWeek - 1) * 7;
    const sesionesSemana: SesionInfo[] = [];
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = weekStartIndex + i;
      
      if (dayIndex < plan.duracionDias) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + dayIndex);
        
        const diaSemana = fecha.getDay();
        const weekDayName = DIAS_SEMANA[diaSemana];
        const fechaFormateada = format(fecha, 'dd/MM');
        
        const sesionExistente = sesiones.find(sesion => {
          const sesionFecha = new Date(sesion.fecha);
          return sesionFecha.toDateString() === fecha.toDateString();
        });
        
        sesionesSemana.push({
          weekDayIndex: i,
          weekDayName,
          fecha,
          fechaFormateada,
          data: sesionExistente || null
        });
      }
    }
    
    return { sesiones: sesionesSemana, totalWeeks };
  }, [plan, currentWeek, sesiones, fechaInicio]);

  useEffect(() => {
    const load = async () => {
      if (!planId) return;
      setLoading(true);
      try {
        const [planData, sesionesData, ejerciciosData] = await Promise.all([
          trainingService.obtenerPlanPorId(planId),
          trainingService.obtenerSesiones({ plan: planId }),
          trainingService.obtenerEjercicios()
        ]);
        
        setPlan(planData);
        
        if (planData.draftMode) {
          navigate(`/editar-plan-entrenamiento/${planId}`);
          return;
        }
        
        const sesionesNormalizadas = sesionesData.map(sesion => ({
          ...sesion,
          ejercicios: sesion.ejercicios.map(ejercicio => ({
            ...ejercicio,
            ejercicio: typeof ejercicio.ejercicio === 'object' && ejercicio.ejercicio !== null 
              ? (ejercicio.ejercicio as { _id: string })._id 
              : ejercicio.ejercicio
          }))
        }));
        
        setSesiones(sesionesNormalizadas);
        setEjercicios(ejerciciosData);
        
        if (planData.fechaInicio) {
          const fechaInicioDate = new Date(planData.fechaInicio);
          setFechaInicio(fechaInicioDate);
        }
        
      } catch (e) {
        setError((e as Error).message || 'Error al cargar el plan');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [planId, navigate]);

  const handleWeekChange = (newWeek: number) => {
    setCurrentWeek(newWeek);
  };

  const getEjercicioById = (ejercicioId: string): Ejercicio | null => {
    return ejercicios.find(ej => ej._id === ejercicioId) || null;
  };

  const fechaInicioFormateada = useMemo(() => {
    if (!plan?.fechaInicio) return "";
    return format(new Date(plan.fechaInicio), "d 'de' MMMM 'de' yyyy");
  }, [plan?.fechaInicio]);


  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader color="nutroos-green" size="lg" />
        </Box>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          withCloseButton
        >
          No se encontró el plan solicitado o no tienes permisos para verlo.
        </Alert>
        <Button 
          mt="lg" 
          color="nutroos-green"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" px="md">
      <Paper 
        p="lg" 
        mb="md" 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderColor: 'var(--app-border-color)' 
        }}
      >
        <TrainingPlanHeader 
          plan={plan} 
          fechaInicioFormateada={fechaInicioFormateada} 
        />
        
        <Divider my="md" />
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              icon={<IconAlertCircle size={18} />} 
              title="Error" 
              color="red" 
              mb="md"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </motion.div>
        )}
      </Paper>
      
      <Paper 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderColor: 'var(--app-border-color)' 
        }}
      >
        <WeekSelector
          currentWeek={currentWeek}
          totalWeeks={sesionesRange.totalWeeks}
          onWeekChange={handleWeekChange}
          isDark={isDark}
        />
        
        <TrainingSessionsTable
          sesionesRange={sesionesRange}
          plan={plan}
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
      </Paper>
    </Container>
  );
};

export default VerPlanEntrenamientoPage;


