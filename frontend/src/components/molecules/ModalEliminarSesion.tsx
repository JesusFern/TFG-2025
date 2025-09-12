import React from 'react';
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  Alert,
} from '@mantine/core';
import { motion } from 'framer-motion';
import { IconAlertTriangle } from '@tabler/icons-react';

interface ModalEliminarSesionProps {
  opened: boolean;
  onClose: () => void;
  sesionInfo: {
    fecha: string;
    tipoEntrenamiento: string;
    duracion: number;
    ejerciciosCount: number;
  } | null;
  onConfirmar: () => Promise<void>;
  loading?: boolean;
}

const ModalEliminarSesion: React.FC<ModalEliminarSesionProps> = ({
  opened,
  onClose,
  sesionInfo,
  onConfirmar,
  loading = false
}) => {
  const handleConfirmar = async () => {
    try {
      await onConfirmar();
      onClose();
    } catch {
      // El error se maneja en el componente padre
    }
  };

  const handleCancelar = () => {
    onClose();
  };

  if (!sesionInfo) return null;

  const fechaFormateada = new Date(sesionInfo.fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Modal
      opened={opened}
      onClose={handleCancelar}
      title="Eliminar sesión"
      size="md"
      centered
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="¿Estás seguro?"
            color="red"
            variant="light"
          >
            Esta acción no se puede deshacer. Se eliminará permanentemente la sesión y todos sus ejercicios.
          </Alert>
          
          <Stack gap="sm">
            <Text fw={500}>Detalles de la sesión a eliminar:</Text>
            <Text size="sm" c="dimmed">
              <strong>Fecha:</strong> {fechaFormateada}
            </Text>
            <Text size="sm" c="dimmed">
              <strong>Tipo:</strong> {sesionInfo.tipoEntrenamiento}
            </Text>
            <Text size="sm" c="dimmed">
              <strong>Duración:</strong> {sesionInfo.duracion} minutos
            </Text>
            <Text size="sm" c="dimmed">
              <strong>Ejercicios:</strong> {sesionInfo.ejerciciosCount} ejercicio{sesionInfo.ejerciciosCount !== 1 ? 's' : ''}
            </Text>
          </Stack>
          
          <Group justify="flex-end" mt="xl">
            <Button
              variant="outline"
              onClick={handleCancelar}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleConfirmar}
              loading={loading}
            >
              Eliminar sesión
            </Button>
          </Group>
        </Stack>
      </motion.div>
    </Modal>
  );
};

export default ModalEliminarSesion;
