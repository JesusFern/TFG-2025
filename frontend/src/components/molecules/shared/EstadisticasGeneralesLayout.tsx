import React from 'react';
import { Grid, Card, Text, Group, Progress, ThemeIcon } from '@mantine/core';
import { IconCheck, IconStar, IconApple, IconTarget } from '@tabler/icons-react';

interface EstadisticaCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  porcentaje?: number;
  color: string;
  icono: React.ReactNode;
  sufijo?: string;
}

const EstadisticaCard: React.FC<EstadisticaCardProps> = ({
  titulo,
  valor,
  subtitulo,
  porcentaje,
  color,
  icono,
  sufijo = ''
}) => (
  <Card shadow="sm" padding="md" radius="md">
    <Group justify="space-between" mb="xs">
      <Text fw={500} size="sm">{titulo}</Text>
      <ThemeIcon color={color} variant="light">
        {icono}
      </ThemeIcon>
    </Group>
    <Text size="xl" fw={700} c={color}>
      {valor}{sufijo}
    </Text>
    {subtitulo && (
      <Text size="sm" c="dimmed">
        {subtitulo}
      </Text>
    )}
    {porcentaje !== undefined && (
      <Progress 
        value={porcentaje} 
        size="sm" 
        mt="xs" 
        color={color}
      />
    )}
  </Card>
);

interface EstadisticasGeneralesLayoutProps {
  estadisticas: {
    // Para entrenamiento
    asistencia?: {
      porcentajeAsistencia: number;
      sesionesCompletadas: number;
      sesionesProgramadas: number;
    };
    rendimiento?: {
      porcentajeCompletitud: number;
      ejerciciosCompletados: number;
      ejerciciosTotal: number;
      tiempoPromedioSesion: number;
    };
    consistencia?: {
      porcentajeConsistencia: number;
      diasEntrenados: number;
      diasDisponibles: number;
    };
    // Para nutrición
    porcentajeCumplimientoGeneral?: number;
    totalComidasRegistradas?: number;
    totalComidasPlanificadas?: number;
    promedioSatisfaccion?: number;
    dietasActivas?: number;
    totalDietas?: number;
    promedioCumplimiento?: number;
  };
  tipo: 'entrenamiento' | 'nutricion';
}

const EstadisticasGeneralesLayout: React.FC<EstadisticasGeneralesLayoutProps> = ({
  estadisticas,
  tipo
}) => {
  if (tipo === 'entrenamiento') {
    return (
      <Grid>
        <Grid.Col span={12}>
          <Text size="lg" fw={600} mb="md">
            Resumen General
          </Text>
        </Grid.Col>
        
        {/* Asistencia */}
        <Grid.Col span={{ base: 6, md: 3 }}>
          <EstadisticaCard
            titulo="Asistencia"
            valor={Math.round(estadisticas.asistencia?.porcentajeAsistencia || 0)}
            subtitulo={`${estadisticas.asistencia?.sesionesCompletadas || 0} de ${estadisticas.asistencia?.sesionesProgramadas || 0} sesiones`}
            porcentaje={estadisticas.asistencia?.porcentajeAsistencia}
            color="blue"
            icono={<IconCheck size={16} />}
            sufijo="%"
          />
        </Grid.Col>

        {/* Progreso */}
        <Grid.Col span={{ base: 6, md: 3 }}>
          <EstadisticaCard
            titulo="Progreso"
            valor={Math.round(estadisticas.rendimiento?.porcentajeCompletitud || 0)}
            subtitulo={`${estadisticas.rendimiento?.ejerciciosCompletados || 0} de ${estadisticas.rendimiento?.ejerciciosTotal || 0} ejercicios`}
            porcentaje={estadisticas.rendimiento?.porcentajeCompletitud}
            color="green"
            icono={<IconTarget size={16} />}
            sufijo="%"
          />
        </Grid.Col>

        {/* Consistencia */}
        <Grid.Col span={{ base: 6, md: 3 }}>
          <EstadisticaCard
            titulo="Consistencia"
            valor={Math.round(estadisticas.consistencia?.porcentajeConsistencia || 0)}
            subtitulo={`${estadisticas.consistencia?.diasEntrenados || 0} de ${estadisticas.consistencia?.diasDisponibles || 0} días`}
            porcentaje={estadisticas.consistencia?.porcentajeConsistencia}
            color="orange"
            icono={<IconStar size={16} />}
            sufijo="%"
          />
        </Grid.Col>

        {/* Tiempo Promedio */}
        <Grid.Col span={{ base: 6, md: 3 }}>
          <EstadisticaCard
            titulo="Tiempo Promedio"
            valor={estadisticas.rendimiento?.tiempoPromedioSesion || 0}
            subtitulo="Por sesión"
            color="purple"
            icono={<IconCheck size={16} />}
            sufijo=" min"
          />
        </Grid.Col>
      </Grid>
    );
  }

  // Para nutrición
  return (
    <Grid>
      <Grid.Col span={12}>
        <Text size="lg" fw={600} mb="md">
          Resumen General
        </Text>
      </Grid.Col>
      
      {/* Cumplimiento General */}
      <Grid.Col span={{ base: 6, md: 3 }}>
        <EstadisticaCard
          titulo="Cumplimiento"
          valor={Math.round(estadisticas.porcentajeCumplimientoGeneral || 0)}
          subtitulo={`${estadisticas.totalComidasRegistradas || 0} de ${estadisticas.totalComidasPlanificadas || 0} comidas`}
          porcentaje={estadisticas.porcentajeCumplimientoGeneral}
          color="green"
          icono={<IconCheck size={16} />}
          sufijo="%"
        />
      </Grid.Col>

      {/* Satisfacción Promedio */}
      <Grid.Col span={{ base: 6, md: 3 }}>
        <EstadisticaCard
          titulo="Satisfacción"
          valor={(estadisticas.promedioSatisfaccion || 0).toFixed(1)}
          subtitulo="Promedio general"
          color="yellow"
          icono={<IconStar size={16} />}
          sufijo="/5"
        />
      </Grid.Col>

      {/* Dietas Activas */}
      <Grid.Col span={{ base: 6, md: 3 }}>
        <EstadisticaCard
          titulo="Dietas Activas"
          valor={estadisticas.dietasActivas || 0}
          subtitulo={`de ${estadisticas.totalDietas || 0} totales`}
          color="blue"
          icono={<IconApple size={16} />}
        />
      </Grid.Col>

      {/* Cumplimiento Promedio */}
      <Grid.Col span={{ base: 6, md: 3 }}>
        <EstadisticaCard
          titulo="Cumplimiento Promedio"
          valor={(estadisticas.promedioCumplimiento || 0).toFixed(1)}
          subtitulo="Promedio general"
          color="orange"
          icono={<IconTarget size={16} />}
          sufijo="/5"
        />
      </Grid.Col>
    </Grid>
  );
};

export default EstadisticasGeneralesLayout;

