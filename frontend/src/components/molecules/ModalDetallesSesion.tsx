import React from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Paper,
  ThemeIcon,
  Divider,
  ScrollArea
} from '@mantine/core';
import { IconClock, IconBarbell } from '@tabler/icons-react';
import { SesionDetalle } from '../../types/estadisticas';
import EstadoBadge from '../atoms/EstadoBadge';
import TablaEjercicios from '../atoms/TablaEjercicios';
import EstadoVacioEjercicios from '../atoms/EstadoVacioEjercicios';
import BotonCerrar from '../atoms/BotonCerrar';

interface ModalDetallesSesionProps {
  opened: boolean;
  onClose: () => void;
  sesion: SesionDetalle | null;
}

export const ModalDetallesSesion: React.FC<ModalDetallesSesionProps> = ({
  opened,
  onClose,
  sesion
}) => {
  if (!sesion) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Detalles de la Sesión: ${sesion.nombre}`}
      size="lg"
      zIndex={1000}
    >
      <Stack gap="md">
        {/* Información de la sesión */}
        <Paper p="lg" withBorder>
          <Group justify="space-between" mb="lg">
            <Group gap="lg">
              <ThemeIcon size="xl" radius="md" color="blue" variant="light">
                <IconClock size={24} />
              </ThemeIcon>
              <div>
                <Text size="xl" fw={600} mb="xs">{sesion.tipoEntrenamiento}</Text>
                <Text size="md" c="dimmed" mb="xs">
                  {new Date(sesion.fecha).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </div>
            </Group>
            <EstadoBadge completado={sesion.completada} size="lg" />
          </Group>
        </Paper>

        <Divider />

        {/* Lista de ejercicios */}
        <Paper p="md" withBorder>
          <Group gap="md" mb="md">
            <ThemeIcon size="lg" radius="md" color="purple">
              <IconBarbell size={20} />
            </ThemeIcon>
            <Text size="lg" fw={600}>Ejercicios de la Sesión</Text>
          </Group>
          
          {sesion.ejercicios.length > 0 ? (
            <ScrollArea h={400}>
              <TablaEjercicios ejercicios={sesion.ejercicios} />
            </ScrollArea>
          ) : (
            <EstadoVacioEjercicios />
          )}
        </Paper>

        <BotonCerrar onClose={onClose} />
      </Stack>
    </Modal>
  );
};

export default ModalDetallesSesion;
