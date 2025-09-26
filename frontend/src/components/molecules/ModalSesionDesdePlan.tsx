import React from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Paper,
  ThemeIcon,
  Divider
} from '@mantine/core';
import { IconClock, IconBarbell } from '@tabler/icons-react';
import { SesionDetalle, RegistroEjercicioDetalle } from '../../types/estadisticas';
import EstadoBadge from '../atoms/EstadoBadge';
import TablaEjerciciosConAcciones from '../atoms/TablaEjerciciosConAcciones';
import EstadoVacioEjercicios from '../atoms/EstadoVacioEjercicios';
import BotonCerrar from '../atoms/BotonCerrar';

interface ModalSesionDesdePlanProps {
  opened: boolean;
  onClose: () => void;
  sesion: SesionDetalle | null;
  onRegistroClick: (registro: RegistroEjercicioDetalle) => void;
  registros: RegistroEjercicioDetalle[];
}

export const ModalSesionDesdePlan: React.FC<ModalSesionDesdePlanProps> = ({
  opened,
  onClose,
  sesion,
  onRegistroClick,
  registros
}) => {
  if (!sesion) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Sesión: ${sesion.tipoEntrenamiento}`}
      size="lg"
      zIndex={1000}
    >
      <Stack gap="md">
        {/* Información de la sesión */}
        <Paper p="lg" withBorder>
           <Group justify="space-between" mb="lg">
             <Group gap="md" align="flex-start">
               <ThemeIcon size="xl" radius="md" color="blue" variant="light" mt="xs">
                 <IconClock size={24} />
               </ThemeIcon>
               <div>
                 <Text size="xl" fw={600} mb="xs">{sesion.tipoEntrenamiento}</Text>
                 <Text size="md" c="dimmed">
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
            <div>
              <Text size="lg" fw={600}>Ejercicios de la Sesión</Text>
              <Text size="sm" c="dimmed">
                Haz clic en "Ver Registro" para ver los detalles del ejercicio
              </Text>
            </div>
          </Group>
          
          {sesion.ejercicios.length > 0 ? (
            <TablaEjerciciosConAcciones
              ejercicios={sesion.ejercicios}
              registros={registros}
              sesionId={sesion.id}
              onRegistroClick={onRegistroClick}
            />
          ) : (
            <EstadoVacioEjercicios />
          )}
        </Paper>

        <BotonCerrar onClose={onClose} />
      </Stack>
    </Modal>
  );
};

export default ModalSesionDesdePlan;
