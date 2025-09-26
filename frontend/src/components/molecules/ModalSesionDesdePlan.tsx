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
  ThemeIcon,
  Divider
} from '@mantine/core';
import { IconClock, IconBarbell } from '@tabler/icons-react';
import { SesionDetalle, RegistroEjercicioDetalle } from '../../types/estadisticas';

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
            <Badge 
              color={sesion.completada ? 'green' : 'red'}
              variant="light"
              size="lg"
            >
              {sesion.completada ? 'Completada' : 'Pendiente'}
            </Badge>
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
            <ScrollArea h={400}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ejercicio</Table.Th>
                    <Table.Th>Series</Table.Th>
                    <Table.Th>Repeticiones</Table.Th>
                    <Table.Th>Peso</Table.Th>
                    <Table.Th>Descanso</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sesion.ejercicios.map((ejercicio) => {
                    // Buscar si existe un registro para este ejercicio en esta sesión
                    const registroExistente = registros.find(
                      reg => reg.sesion.id === sesion.id && 
                             reg.ejercicio.id === ejercicio.id
                    );

                    return (
                      <Table.Tr key={ejercicio.id}>
                        <Table.Td>
                          <Text fw={500}>{ejercicio.nombre}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ejercicio.series}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ejercicio.repeticiones}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {ejercicio.peso > 0 ? `${ejercicio.peso}kg` : 'Sin peso'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ejercicio.tiempoDescanso}s</Text>
                        </Table.Td>
                        <Table.Td>
                          {registroExistente ? (
                            <Button 
                              variant="light" 
                              size="xs"
                              onClick={() => onRegistroClick(registroExistente)}
                            >
                              Ver Registro
                            </Button>
                          ) : (
                            <Text size="sm" c="dimmed">Sin registro</Text>
                          )}
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
                No hay ejercicios en esta sesión
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
