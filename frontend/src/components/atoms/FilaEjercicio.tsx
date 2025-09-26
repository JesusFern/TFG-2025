import { Table, Text } from '@mantine/core';
import FormatoPeso from './FormatoPeso';

interface Ejercicio {
  id: string;
  nombre: string;
  series: number;
  repeticiones: number;
  peso: number;
  tiempoDescanso: number;
}

interface FilaEjercicioProps {
  ejercicio: Ejercicio;
  showAcciones?: boolean;
  children?: React.ReactNode;
}

export const FilaEjercicio = ({ ejercicio, showAcciones = false, children }: FilaEjercicioProps) => {
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
          <FormatoPeso peso={ejercicio.peso} />
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{ejercicio.tiempoDescanso}s</Text>
      </Table.Td>
      {showAcciones && children && (
        <Table.Td>
          {children}
        </Table.Td>
      )}
    </Table.Tr>
  );
};

export default FilaEjercicio;
