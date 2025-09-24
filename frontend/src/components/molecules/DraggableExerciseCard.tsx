import React from 'react';
import {
  Paper,
  Group,
  Text,
  ActionIcon,
  Badge,
  Box,
  useMantineTheme
} from '@mantine/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconEdit, IconTrash, IconGripVertical } from '@tabler/icons-react';
import { EjercicioSesion } from '../../types/trainingCommon';
import { Ejercicio } from '../../types/training';

interface DraggableExerciseCardProps {
  ejercicio: EjercicioSesion;
  ejercicioData: Ejercicio;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  disabled?: boolean;
}

const DraggableExerciseCard: React.FC<DraggableExerciseCardProps> = ({
  ejercicio,
  ejercicioData,
  index,
  onEdit,
  onDelete,
  disabled = false
}) => {
  const theme = useMantineTheme();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ejercicio.ejercicio });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      p="md"
      withBorder
      radius="md"
      mb="md"
      style={{
        ...style,
        cursor: disabled ? 'default' : 'grab',
        border: isDragging ? `2px dashed ${theme.colors.blue[4]}` : undefined,
        backgroundColor: isDragging ? theme.colors.blue[0] : 'white'
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Group gap="md" style={{ flex: 1 }}>
          {/* Handle de arrastre */}
          {!disabled && (
            <Box
              {...attributes}
              {...listeners}
              style={{
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: theme.colors.gray[1],
                '&:hover': {
                  backgroundColor: theme.colors.gray[2]
                }
              }}
            >
              <IconGripVertical size={16} color={theme.colors.gray[6]} />
            </Box>
          )}

          {/* Información del ejercicio */}
          <Box style={{ flex: 1 }}>
            <Text fw={500} size="sm" mb="xs">
              {index + 1}. {ejercicioData.nombre}
            </Text>
            
            {ejercicioData.descripcion && (
              <Text size="xs" c="dimmed" mb="xs" lineClamp={2}>
                {ejercicioData.descripcion}
              </Text>
            )}

            {/* Badges informativos */}
            <Group gap="xs" mb="xs">
              <Badge size="xs" color="blue" variant="light">
                {ejercicioData.grupoMuscular}
              </Badge>
              <Badge size="xs" color="green" variant="light">
                {ejercicioData.equipamiento}
              </Badge>
              <Badge size="xs" color="orange" variant="light">
                {ejercicioData.nivelDificultad}
              </Badge>
            </Group>

            {/* Configuración de la sesión */}
            <Group gap="md">
              <Text size="xs">
                <strong>Series:</strong> {ejercicio.series}
              </Text>
              <Text size="xs">
                <strong>Repeticiones:</strong> {ejercicio.repeticiones}
              </Text>
              <Text size="xs">
                <strong>Descanso:</strong> {ejercicio.tiempoDescanso}s
              </Text>
              {ejercicio.peso && (
                <Text size="xs">
                  <strong>Peso:</strong> {ejercicio.peso}kg
                </Text>
              )}
            </Group>
          </Box>
        </Group>

        {/* Botones de acción */}
        {!disabled && (
          <Group gap="xs">
            <ActionIcon 
              size="sm" 
              color="nutroos-green" 
              variant="light"
              onClick={() => onEdit(index)}
            >
              <IconEdit size={14} />
            </ActionIcon>
            <ActionIcon 
              size="sm" 
              color="red" 
              variant="light"
              onClick={() => onDelete(index)}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Paper>
  );
};

export default DraggableExerciseCard;
