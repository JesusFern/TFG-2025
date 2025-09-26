import React from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Paper,
  Button,
  SimpleGrid,
  ThemeIcon,
  Divider
} from '@mantine/core';
import { IconBarbell, IconCalendar, IconCheck, IconX } from '@tabler/icons-react';
import { RegistroEjercicioDetalle } from '../../types/estadisticas';

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
            <Badge 
              color={registro.completado ? 'green' : 'red'}
              variant="light"
              size="sm"
            >
              {registro.completado ? 'Completado' : 'No completado'}
            </Badge>
          </Group>
        </Paper>

        <Divider />

        {/* Información de la sesión */}
        <Paper p="md" withBorder>
          <Group gap="md" mb="md">
            <ThemeIcon size="lg" radius="md" color="orange">
              <IconCalendar size={20} />
            </ThemeIcon>
            <Text size="lg" fw={600}>Información de la Sesión</Text>
          </Group>
          
          <Text size="sm" c="dimmed" mb="sm">
            Fecha: {new Date(registro.fecha).toLocaleDateString()}
          </Text>
        </Paper>

        {/* Métricas del ejercicio */}
        <Paper p="md" withBorder>
          <Text size="lg" fw={600} mb="md">Métricas del Ejercicio</Text>
          
          <SimpleGrid cols={2} spacing="md">
            <div>
              <Text size="sm" fw={500} mb="xs">Carga Utilizada</Text>
              <Text size="lg" fw={600}>{registro.cargaUtilizada}kg</Text>
            </div>
            <div>
              <Text size="sm" fw={500} mb="xs">Repeticiones Realizadas</Text>
              <Text size="lg" fw={600}>{registro.repeticionesRealizadas}</Text>
            </div>
            <div>
              <Text size="sm" fw={500} mb="xs">Series Completadas</Text>
              <Text size="lg" fw={600}>{registro.seriesCompletadas}</Text>
            </div>
            <div>
              <Text size="sm" fw={500} mb="xs">Nivel de Esfuerzo (RPE)</Text>
              <Text size="lg" fw={600}>{registro.nivelEsfuerzo}/10</Text>
            </div>
            <div>
              <Text size="sm" fw={500} mb="xs">Tiempo de Descanso</Text>
              <Text size="lg" fw={600}>{registro.tiempoDescanso}s</Text>
            </div>
          </SimpleGrid>
        </Paper>

        {/* Notas del ejercicio */}
        {registro.notas && (
          <Paper p="md" withBorder>
            <Text size="lg" fw={600} mb="md">Notas del Ejercicio</Text>
            <Paper p="sm" withBorder style={{ backgroundColor: '#f8f9fa' }}>
              <Text size="sm">{registro.notas}</Text>
            </Paper>
          </Paper>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cerrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
