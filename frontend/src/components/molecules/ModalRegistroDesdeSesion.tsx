import React from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Paper,
  ThemeIcon,
  Divider,
  Badge
} from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';
import { RegistroEjercicioDetalle } from '../../types/estadisticas';
import EstadoBadge from '../atoms/EstadoBadge';
import InformacionSesion from '../atoms/InformacionSesion';
import MetricasEjercicio from '../atoms/MetricasEjercicio';
import NotasEjercicio from '../atoms/NotasEjercicio';
import BotonCerrar from '../atoms/BotonCerrar';

interface ModalRegistroDesdeSesionProps {
  opened: boolean;
  onClose: () => void;
  registro: RegistroEjercicioDetalle | null;
}

export const ModalRegistroDesdeSesion: React.FC<ModalRegistroDesdeSesionProps> = ({
  opened,
  onClose,
  registro
}) => {
  if (!registro) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Registro del Ejercicio: ${registro.ejercicio.nombre}`}
      size="md"
      zIndex={1001}
    >
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
                Sesión: {registro.sesion.nombre}
              </Text>
            </div>
          </Group>
          
          <Group gap="md">
            <Badge color="blue" variant="light" size="sm">
              {registro.sesion.tipoEntrenamiento || 'Fuerza'}
            </Badge>
            <EstadoBadge completado={registro.completado} />
          </Group>
        </Paper>

        <Divider />

        {/* Información de la sesión */}
        <InformacionSesion fecha={registro.fecha} completada={registro.completado} />

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

        <BotonCerrar onClose={onClose} />
      </Stack>
    </Modal>
  );
};

export default ModalRegistroDesdeSesion;
