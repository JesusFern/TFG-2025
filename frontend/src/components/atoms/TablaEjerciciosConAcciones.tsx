import { Table, ScrollArea, Text, Button } from '@mantine/core';
import { RegistroEjercicioDetalle } from '../../types/estadisticas';
import FilaEjercicio from './FilaEjercicio';

interface Ejercicio {
  id: string;
  nombre: string;
  series: number;
  repeticiones: number;
  peso: number;
  tiempoDescanso: number;
}

interface TablaEjerciciosConAccionesProps {
  ejercicios: Ejercicio[];
  registros: RegistroEjercicioDetalle[];
  sesionId: string;
  onRegistroClick: (registro: RegistroEjercicioDetalle) => void;
  showEmptyState?: boolean;
}

export const TablaEjerciciosConAcciones = ({ 
  ejercicios, 
  registros, 
  sesionId, 
  onRegistroClick,
  showEmptyState = true 
}: TablaEjerciciosConAccionesProps) => {
  if (ejercicios.length === 0 && showEmptyState) {
    return null; // El estado vacío se maneja en el componente padre
  }

  return (
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
          {ejercicios.map((ejercicio) => {
            // Buscar si existe un registro para este ejercicio en esta sesión
            const registroExistente = registros.find(
              reg => reg.sesion.id === sesionId && 
                     reg.ejercicio.id === ejercicio.id
            );

            return (
              <FilaEjercicio 
                key={ejercicio.id} 
                ejercicio={ejercicio} 
                showAcciones={true}
              >
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
              </FilaEjercicio>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

export default TablaEjerciciosConAcciones;
