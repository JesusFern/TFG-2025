import React from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Paper,
  Divider,
  Button,
  ScrollArea,
  ThemeIcon
} from '@mantine/core';
import { IconNotes, IconCalendar } from '@tabler/icons-react';
import { RegistroEjercicioDetalle } from '../../types/estadisticas';

interface ModalNotasProps {
  opened: boolean;
  onClose: () => void;
  cliente: {
    id: string;
    nombre: string;
    email: string;
  } | null;
  registros: RegistroEjercicioDetalle[];
}

export const ModalNotas: React.FC<ModalNotasProps> = ({
  opened,
  onClose,
  cliente,
  registros
}) => {
  if (!cliente) return null;

  // Filtrar registros que tienen notas
  const registrosConNotas = registros.filter(registro => registro.notas && registro.notas.trim() !== '');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Notas de ${cliente.nombre}`}
      size="lg"
      zIndex={1000}
    >
      <Stack gap="md">
        {/* Información del cliente */}
        <Paper p="md" withBorder>
          <Group gap="md">
            <ThemeIcon size="lg" radius="md" color="blue">
              <IconNotes size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={600}>{cliente.nombre}</Text>
              <Text size="sm" c="dimmed">{cliente.email}</Text>
            </div>
          </Group>
        </Paper>

        <Divider />

        {/* Lista de notas */}
        {registrosConNotas.length > 0 ? (
          <ScrollArea h={400}>
            <Stack gap="md">
              {registrosConNotas.map((registro) => (
                <Paper key={registro.id} p="md" withBorder>
                  <Group justify="space-between" mb="sm">
                    <Text fw={600}>{registro.ejercicio.nombre}</Text>
                    <Group gap="xs">
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
                  </Group>
                  
                  <Group gap="md" mb="sm">
                    <Group gap="xs">
                      <IconCalendar size={16} />
                      <Text size="sm" c="dimmed">
                        {new Date(registro.fecha).toLocaleDateString()}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      Carga: {registro.cargaUtilizada}kg
                    </Text>
                    <Text size="sm" c="dimmed">
                      Reps: {registro.repeticionesRealizadas}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Series: {registro.seriesCompletadas}
                    </Text>
                  </Group>
                  
                  <Paper p="sm" withBorder style={{ backgroundColor: '#f8f9fa' }}>
                    <Text size="sm">{registro.notas}</Text>
                  </Paper>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        ) : (
          <Paper p="xl" withBorder>
            <Group justify="center">
              <ThemeIcon size="xl" radius="md" color="gray" variant="light">
                <IconNotes size={32} />
              </ThemeIcon>
            </Group>
            <Text size="lg" ta="center" c="dimmed" mt="md">
              No hay notas registradas
            </Text>
            <Text size="sm" ta="center" c="dimmed" mt="xs">
              Las notas aparecerán aquí cuando el cliente las agregue a sus ejercicios
            </Text>
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

export default ModalNotas;
