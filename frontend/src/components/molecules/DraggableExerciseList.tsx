import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { EjercicioSesion } from '../../types/trainingCommon';
import { Ejercicio } from '../../types/training';
import DraggableExerciseCard from './DraggableExerciseCard';

interface DraggableExerciseListProps {
  ejercicios: EjercicioSesion[];
  ejerciciosData: Ejercicio[];
  onReorder: (newOrder: EjercicioSesion[]) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  disabled?: boolean;
}

const DraggableExerciseList: React.FC<DraggableExerciseListProps> = ({
  ejercicios,
  ejerciciosData,
  onReorder,
  onEdit,
  onDelete,
  disabled = false
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = ejercicios.findIndex(item => item.ejercicio === active.id);
      const newIndex = ejercicios.findIndex(item => item.ejercicio === over?.id);

      const newOrder = arrayMove(ejercicios, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={ejercicios.map(ej => ej.ejercicio)}
        strategy={verticalListSortingStrategy}
      >
        {ejercicios.map((ejercicio, index) => {
          const ejercicioData = ejerciciosData.find(e => e._id === ejercicio.ejercicio);
          if (!ejercicioData) return null;

          return (
            <DraggableExerciseCard
              key={ejercicio.ejercicio}
              ejercicio={ejercicio}
              ejercicioData={ejercicioData}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={disabled}
            />
          );
        })}
      </SortableContext>
    </DndContext>
  );
};

export default DraggableExerciseList;
