import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  TextInput,
  Divider,
  Checkbox,
} from '@mantine/core';
import { motion } from 'framer-motion';

interface EjercicioSesion {
  ejercicio: string;
  orden: number;
  series: number;
  repeticiones: number;
  peso?: number;
  tiempoDescanso: number;
  ejerciciosAlternativos?: string[];
  opcionesProgresion?: {
    aumentarPeso: boolean;
    masRepeticiones: boolean;
    mayorIntensidad: boolean;
  };
}

interface ModalEditarEjercicioSesionProps {
  opened: boolean;
  onClose: () => void;
  ejercicioData: EjercicioSesion | null;
  onGuardar: (ejercicioEditado: EjercicioSesion) => Promise<void>;
  loading?: boolean;
}

const ModalEditarEjercicioSesion: React.FC<ModalEditarEjercicioSesionProps> = ({
  opened,
  onClose,
  ejercicioData,
  onGuardar,
  loading = false
}) => {
  const [ejercicioEditando, setEjercicioEditando] = useState<EjercicioSesion | null>(null);

  // Actualizar el estado cuando cambien los datos del ejercicio
  useEffect(() => {
    if (ejercicioData) {
      setEjercicioEditando({
        ...ejercicioData,
        opcionesProgresion: ejercicioData.opcionesProgresion || {
          aumentarPeso: false,
          masRepeticiones: false,
          mayorIntensidad: false
        }
      });
    }
  }, [ejercicioData]);

  const handleGuardar = async () => {
    if (!ejercicioEditando) return;
    
    try {
      await onGuardar(ejercicioEditando);
      onClose();
    } catch {
      // El error se maneja en el componente padre
    }
  };

  const handleCancelar = () => {
    onClose();
  };

  if (!ejercicioEditando) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleCancelar}
      title="Editar ejercicio"
      size="lg"
      centered
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Stack gap="md">
          <TextInput
            label="Series"
            type="number"
            value={ejercicioEditando.series}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setEjercicioEditando(prev => prev ? { ...prev, series: parseInt(e.target.value) || 0 } : null)
            }
            min={1}
          />
          
          <TextInput
            label="Repeticiones"
            type="number"
            value={ejercicioEditando.repeticiones}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setEjercicioEditando(prev => prev ? { ...prev, repeticiones: parseInt(e.target.value) || 0 } : null)
            }
            min={1}
          />
          
          <TextInput
            label="Peso (kg)"
            type="number"
            value={ejercicioEditando.peso || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setEjercicioEditando(prev => prev ? { ...prev, peso: e.target.value ? parseFloat(e.target.value) : undefined } : null)
            }
            min={0}
            step="0.5"
          />
          
          <TextInput
            label="Tiempo de descanso (segundos)"
            type="number"
            value={ejercicioEditando.tiempoDescanso}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setEjercicioEditando(prev => prev ? { ...prev, tiempoDescanso: parseInt(e.target.value) || 0 } : null)
            }
            min={0}
          />
          
          <Divider />
          
          <Text fw={500} size="sm">Opciones de progresión</Text>
          
          <Checkbox
            label="Aumentar peso"
            checked={ejercicioEditando.opcionesProgresion?.aumentarPeso || false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEjercicioEditando(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  opcionesProgresion: {
                    ...(prev.opcionesProgresion || {
                      aumentarPeso: false,
                      masRepeticiones: false,
                      mayorIntensidad: false
                    }),
                    aumentarPeso: e.target.checked
                  }
                };
              });
            }}
          />
          
          <Checkbox
            label="Más repeticiones"
            checked={ejercicioEditando.opcionesProgresion?.masRepeticiones || false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEjercicioEditando(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  opcionesProgresion: {
                    ...(prev.opcionesProgresion || {
                      aumentarPeso: false,
                      masRepeticiones: false,
                      mayorIntensidad: false
                    }),
                    masRepeticiones: e.target.checked
                  }
                };
              });
            }}
          />
          
          <Checkbox
            label="Mayor intensidad"
            checked={ejercicioEditando.opcionesProgresion?.mayorIntensidad || false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEjercicioEditando(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  opcionesProgresion: {
                    ...(prev.opcionesProgresion || {
                      aumentarPeso: false,
                      masRepeticiones: false,
                      mayorIntensidad: false
                    }),
                    mayorIntensidad: e.target.checked
                  }
                };
              });
            }}
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

export default ModalEditarEjercicioSesion;
