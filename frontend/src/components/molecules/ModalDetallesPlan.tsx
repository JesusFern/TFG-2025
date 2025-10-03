import React from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Paper,
  Button,
  ScrollArea,
  Table,
  ThemeIcon
} from '@mantine/core';
import { IconTarget, IconCalendar, IconClock, IconBarbell } from '@tabler/icons-react';
import { PlanEntrenamientoDetalle, SesionDetalle } from '../../types/estadisticas';

interface ModalDetallesPlanProps {
  opened: boolean;
  onClose: () => void;
  plan: PlanEntrenamientoDetalle | null;
  onSesionClick: (sesion: SesionDetalle) => void;
}

export const ModalDetallesPlan: React.FC<ModalDetallesPlanProps> = ({
  opened,
  onClose,
  plan,
  onSesionClick
}) => {
  if (!plan) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Detalles del Plan: ${plan.nombre}`}
      size="xl"
      zIndex={1000}
    >
      <Stack gap="md">
        {/* Información del plan */}
        <Paper p="md" withBorder>
          <Group gap="md" mb="md">
            <ThemeIcon size="lg" radius="md" color="green">
              <IconTarget size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={600}>{plan.nombre}</Text>
              <Text size="sm" c="dimmed">{plan.objetivo}</Text>
            </div>
          </Group>
          
          <Group gap="lg">
            <Group gap="xs">
              <IconCalendar size={16} />
              <Text size="sm" c="dimmed">
                Inicio: {new Date(plan.fechaInicio).toLocaleDateString()}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Duración: {plan.duracionDias} días
            </Text>
            <Text size="sm" c="dimmed">
              Frecuencia: {plan.sesionesPorSemana} sesiones/semana
            </Text>
          </Group>
        </Paper>

        {/* Lista de sesiones */}
        <Paper p="md" withBorder>
          <Group gap="md" mb="md">
            <ThemeIcon size="lg" radius="md" color="orange">
              <IconClock size={20} />
            </ThemeIcon>
            <Text size="lg" fw={600}>Sesiones del Plan</Text>
          </Group>
          
          {plan.sesiones.length > 0 ? (
            <ScrollArea h={400}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Sesión</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Ejercicios</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {plan.sesiones.map((sesion) => {
                    const fechaSesion = new Date(sesion.fecha);
                    const hoy = new Date();
                    const esNoCompletada = !sesion.completada && fechaSesion < hoy;
                    
                    return (
                    <Table.Tr key={sesion.id}>
                      <Table.Td>
                        <Badge color="blue" variant="light" size="sm">
                          {sesion.tipoEntrenamiento || 'Fuerza'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {new Date(sesion.fecha).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={sesion.completada ? 'green' : esNoCompletada ? 'red' : 'orange'}
                          variant="light"
                          size="sm"
                        >
                          {sesion.completada ? 'Completada' : esNoCompletada ? 'No Completada' : 'Pendiente'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{sesion.ejercicios.length} ejercicios</Text>
                      </Table.Td>
                      <Table.Td>
                        <Button 
                          variant="light" 
                          size="xs"
                          onClick={() => onSesionClick(sesion)}
                        >
                          Ver Detalles
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            <Paper p="xl" withBorder>
              <Group justify="center">
                <ThemeIcon size="xl" radius="md" color="gray" variant="light">
                  <IconBarbell size={32} />
                </ThemeIcon>
              </Group>
              <Text size="lg" ta="center" c="dimmed" mt="md">
                No hay sesiones en este plan
              </Text>
            </Paper>
          )}
        </Paper>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cerrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalDetallesPlan;
