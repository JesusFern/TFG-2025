import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Group,
  Stack,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Text,
} from '@mantine/core';
import { motion } from 'framer-motion';

interface SesionData {
  fecha: string;
  hora?: string;
  tipoEntrenamiento: string;
  duracion: number;
  notas?: string;
}

interface ModalCrearSesionProps {
  opened: boolean;
  onClose: () => void;
  fechaInicial: string; // Fecha que viene del día seleccionado
  onCrear: (nuevaSesion: SesionData) => Promise<void>;
  loading?: boolean;
}

const tiposEntrenamiento = [
  { value: 'Fuerza', label: 'Fuerza' },
  { value: 'Cardio', label: 'Cardio' },
  { value: 'Flexibilidad', label: 'Flexibilidad' },
  { value: 'HIIT', label: 'HIIT' },
  { value: 'Resistencia', label: 'Resistencia' },
  { value: 'Potencia', label: 'Potencia' },
  { value: 'Movilidad', label: 'Movilidad' },
  { value: 'Estabilidad', label: 'Estabilidad' },
];

const ModalCrearSesion: React.FC<ModalCrearSesionProps> = ({
  opened,
  onClose,
  fechaInicial,
  onCrear,
  loading = false
}) => {
  const [nuevaSesion, setNuevaSesion] = useState<SesionData>({
    fecha: fechaInicial,
    hora: '00:00',
    tipoEntrenamiento: '',
    duracion: 60,
    notas: ''
  });

  // Actualizar la fecha cuando cambie la fecha inicial
  useEffect(() => {
    setNuevaSesion(prev => ({
      ...prev,
      fecha: fechaInicial
    }));
  }, [fechaInicial]);

  const handleCrear = async () => {
    if (!nuevaSesion.tipoEntrenamiento) {
      return; // No crear si no hay tipo de entrenamiento seleccionado
    }
    
    try {
      await onCrear(nuevaSesion);
      onClose();
    } catch {
      // El error se maneja en el componente padre
    }
  };

  const handleCancelar = () => {
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCancelar}
      title="Crear nueva sesión"
      size="lg"
      centered
      zIndex={1000}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Stack gap="md">
          {/* Mostrar fecha como información no editable */}
          <div>
            <Text size="sm" fw={500} mb={5}>Fecha de la sesión</Text>
            <Text size="sm" c="dimmed">
              {new Date(nuevaSesion.fecha).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </div>
          
          <TextInput
            label="Hora de la sesión"
            type="time"
            value={nuevaSesion.hora || '00:00'}
            onChange={(e) => 
              setNuevaSesion(prev => ({ 
                ...prev, 
                hora: e.target.value 
              }))
            }
            placeholder="HH:MM"
            description="Especifica la hora de la sesión"
          />
          
          <Select
            label="Tipo de entrenamiento"
            placeholder="Selecciona el tipo de entrenamiento"
            value={nuevaSesion.tipoEntrenamiento}
            onChange={(value) => 
              setNuevaSesion(prev => ({ 
                ...prev, 
                tipoEntrenamiento: value || '' 
              }))
            }
            data={tiposEntrenamiento}
            required
            comboboxProps={{ zIndex: 3000 }}
          />
          
          <NumberInput
            label="Duración (minutos)"
            value={nuevaSesion.duracion}
            onChange={(value) => 
              setNuevaSesion(prev => ({ 
                ...prev, 
                duracion: Number(value) || 60 
              }))
            }
            min={1}
            max={300}
            required
          />
          
          <Textarea
            label="Notas adicionales"
            value={nuevaSesion.notas || ''}
            onChange={(e) => 
              setNuevaSesion(prev => ({ 
                ...prev, 
                notas: e.target.value 
              }))
            }
            placeholder="Agrega notas sobre la sesión..."
            minRows={3}
            maxRows={6}
          />
          
          <Group justify="flex-end" mt="xl">
            <Button
              variant="outline"
              onClick={handleCancelar}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              color="nutroos-green"
              onClick={handleCrear}
              loading={loading}
              disabled={!nuevaSesion.tipoEntrenamiento}
            >
              Crear sesión
            </Button>
          </Group>
        </Stack>
      </motion.div>
    </Modal>
  );
};

export default ModalCrearSesion;
