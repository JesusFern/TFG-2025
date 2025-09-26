import { Table, ScrollArea, Text } from '@mantine/core';
import FormatoPeso from './FormatoPeso';

interface Ejercicio {
  id: string;
  nombre: string;
  series: number;
  repeticiones: number;
  peso: number;
  tiempoDescanso: number;
}

interface TablaEjerciciosProps {
  ejercicios: Ejercicio[];
  showEmptyState?: boolean;
}

export const TablaEjercicios = ({ ejercicios, showEmptyState = true }: TablaEjerciciosProps) => {
  if (ejercicios.length === 0 && showEmptyState) {
    return null; // El estado vacío se maneja en el componente padre
  }

  return (
    <ScrollArea>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ejercicio</Table.Th>
            <Table.Th>Series</Table.Th>
            <Table.Th>Repeticiones</Table.Th>
            <Table.Th>Peso</Table.Th>
            <Table.Th>Descanso</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {ejercicios.map((ejercicio) => (
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
                  <FormatoPeso peso={ejercicio.peso} />
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{ejercicio.tiempoDescanso}s</Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

export default TablaEjercicios;
