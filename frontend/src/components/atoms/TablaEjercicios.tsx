import { Table } from '@mantine/core';
import FilaEjercicio from './FilaEjercicio';

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
          <FilaEjercicio key={ejercicio.id} ejercicio={ejercicio} />
        ))}
      </Table.Tbody>
    </Table>
  );
};

export default TablaEjercicios;
