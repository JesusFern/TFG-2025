import React from 'react';
import { Stack, Group, Paper, ThemeIcon, Divider, Text } from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';
import { RegistroEjercicioDetalle } from '../../types/estadisticas';
import EstadoBadge from '../atoms/EstadoBadge';
import InformacionSesion from '../atoms/InformacionSesion';
import MetricasEjercicio from '../atoms/MetricasEjercicio';
import NotasEjercicio from '../atoms/NotasEjercicio';
import VideoCliente from '../atoms/VideoCliente';
import BotonCerrar from '../atoms/BotonCerrar';

interface ContenidoRegistroEjercicioProps {
  registro: RegistroEjercicioDetalle;
  onClose: () => void;
  showSesionInfo?: boolean;
}

export const ContenidoRegistroEjercicio: React.FC<ContenidoRegistroEjercicioProps> = ({
  registro,
  onClose,
  showSesionInfo = true
}) => {
  return (
    <Stack gap="md">
      {/* Información del ejercicio */}
      <Paper p="md" withBorder>
        <Group gap="md" mb="md">
          <ThemeIcon size="lg" radius="md" color="purple">
            <IconBarbell size={20} />
          </ThemeIcon>
          <div>
            <Text size="lg" fw={600}>{registro.ejercicio.nombre}</Text>
            <Text size="sm" c="dimmed">
              Sesión: {registro.sesion.tipoEntrenamiento || registro.sesion.nombre}
            </Text>
          </div>
        </Group>
        
        <Group gap="md">
          <EstadoBadge completado={registro.completado} />
        </Group>
      </Paper>

      <Divider />

      {/* Información de la sesión */}
      {showSesionInfo && (
        <InformacionSesion fecha={registro.sesion.fecha} completada={registro.sesion.completada} />
      )}

      {/* Métricas del ejercicio */}
      <MetricasEjercicio
        cargaUtilizada={registro.cargaUtilizada}
        repeticionesRealizadas={registro.repeticionesRealizadas}
        seriesCompletadas={registro.seriesCompletadas}
        nivelEsfuerzo={registro.nivelEsfuerzo}
        tiempoDescanso={registro.tiempoDescanso}
      />

      {/* Notas del ejercicio */}
      <NotasEjercicio notas={registro.notas} />

      {/* Video del cliente */}
      {registro.videoCliente && (
        <VideoCliente 
          videoUrl={registro.videoCliente}
          height={250}
        />
      )}

      <BotonCerrar onClose={onClose} />
    </Stack>
  );
};

export default ContenidoRegistroEjercicio;
