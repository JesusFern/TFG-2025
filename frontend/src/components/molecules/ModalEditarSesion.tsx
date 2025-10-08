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

interface ModalEditarSesionProps {
  opened: boolean;
  onClose: () => void;
  sesionData: SesionData | null;
  onGuardar: (sesionEditada: SesionData) => Promise<void>;
  loading?: boolean;
}

const tiposEntrenamiento = [
  { value: 'Fuerza', label: 'Fuerza' },
  { value: 'Cardio', label: 'Cardio' },
  { value: 'Flexibilidad', label: 'Flexibilidad' },
  { value: 'HIIT', label: 'HIIT' },
  { value: 'Resistencia', label: 'Resistencia' },
  { value: 'Potencia', label: 'Potencia' },
  { value: 'Estabilidad', label: 'Estabilidad' },
  { value: 'Movilidad', label: 'Movilidad' }
];

const ModalEditarSesion: React.FC<ModalEditarSesionProps> = ({
  opened,
  onClose,
  sesionData,
  onGuardar,
  loading = false
}) => {
  const [sesionEditando, setSesionEditando] = useState<SesionData | null>(null);

  // Actualizar el estado cuando cambien los datos de la sesión
  useEffect(() => {
    if (sesionData) {
      setSesionEditando({
        fecha: sesionData.fecha,
        hora: sesionData.hora || '00:00',
        tipoEntrenamiento: sesionData.tipoEntrenamiento,
        duracion: sesionData.duracion,
        notas: sesionData.notas || ''
      });
    }
  }, [sesionData]);

  const handleGuardar = async () => {
    if (!sesionEditando) return;
    
    try {
      await onGuardar(sesionEditando);
      onClose();
    } catch {
      // El error se maneja en el componente padre
    }
  };

  const handleCancelar = () => {
    onClose();
  };

  if (!sesionEditando) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleCancelar}
      title="Editar sesión"
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
              {new Date(sesionEditando.fecha).toLocaleDateString('es-ES', { 
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
             value={sesionEditando.hora || '00:00'}
             onChange={(e) => 
               setSesionEditando(prev => prev ? { 
                 ...prev, 
                 hora: e.target.value 
               } : null)
             }
             placeholder="HH:MM"
             description="Puedes modificar solo la hora de la sesión"
           />
          
          <Select
            label="Tipo de entrenamiento"
            placeholder="Selecciona el tipo de entrenamiento"
            value={sesionEditando.tipoEntrenamiento}
            onChange={(value) => 
              setSesionEditando(prev => prev ? { 
                ...prev, 
                tipoEntrenamiento: value || '' 
              } : null)
            }
            data={tiposEntrenamiento}
            required
            comboboxProps={{ zIndex: 3000 }}
          />
          
          <NumberInput
            label="Duración (minutos)"
            value={sesionEditando.duracion}
            onChange={(value) => 
              setSesionEditando(prev => prev ? { 
                ...prev, 
                duracion: Number(value) || 0 
              } : null)
            }
            min={1}
            max={300}
            required
          />
          
          <Textarea
            label="Notas adicionales"
            value={sesionEditando.notas || ''}
            onChange={(e) => 
              setSesionEditando(prev => prev ? { 
                ...prev, 
                notas: e.target.value 
              } : null)
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
              onClick={handleGuardar}
              loading={loading}
            >
              Guardar cambios
            </Button>
          </Group>
        </Stack>
      </motion.div>
    </Modal>
  );
};

export default ModalEditarSesion;
