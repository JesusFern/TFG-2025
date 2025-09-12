import React, { useState } from 'react';
import {
  Modal,
  Title,
  Group,
  Tabs,
  Badge,
  MantineProvider
} from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { Ejercicio } from '../../types/training';
import SeleccionEjercicio from './SeleccionEjercicio';
import CrearEjercicioForm from './CrearEjercicioForm';

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

interface ModalGestionarEjerciciosProps {
  opened: boolean;
  onClose: () => void;
  onAddEjercicio: (ejercicio: EjercicioSesion) => void;
  onEjercicioCreado?: (ejercicio: Ejercicio) => void;
  ejerciciosExistentes: Ejercicio[];
  siguienteOrden: number;
}

const ModalGestionarEjercicios: React.FC<ModalGestionarEjerciciosProps> = ({
  opened,
  onClose,
  onAddEjercicio,
  onEjercicioCreado,
  ejerciciosExistentes,
  siguienteOrden
}) => {
  const [activeTab, setActiveTab] = useState<string | null>('seleccionar');

  const handleEjercicioSeleccionado = (ejercicio: EjercicioSesion) => {
    onAddEjercicio(ejercicio);
    onClose();
  };

  const handleEjercicioCreado = (ejercicio: Ejercicio) => {
    if (onEjercicioCreado) {
      onEjercicioCreado(ejercicio);
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      zIndex={1000}
      onClose={onClose}
      title={
        <Group gap="xs" align="center">
          <IconBarbell size={20} color="var(--mantine-color-nutroos-green-6)" />
          <Title order={4} c="nutroos-green.6">
            Gestionar Ejercicios
          </Title>
        </Group>
      }
      size="xl"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Group justify="space-between" align="center" mb="md">
        <Badge color="nutroos-green" variant="light" size="sm">
          Orden: {siguienteOrden}
        </Badge>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="seleccionar">
            Seleccionar Existente
          </Tabs.Tab>
          <Tabs.Tab value="crear">
            Crear Nuevo
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="seleccionar" pt="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MantineProvider>
              <SeleccionEjercicio
                ejerciciosExistentes={ejerciciosExistentes}
                siguienteOrden={siguienteOrden}
                onEjercicioSeleccionado={handleEjercicioSeleccionado}
              />
            </MantineProvider>
          </motion.div>
        </Tabs.Panel>

        <Tabs.Panel value="crear" pt="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MantineProvider>
              <CrearEjercicioForm
                onEjercicioCreado={handleEjercicioCreado}
                onAddEjercicio={onAddEjercicio}
                siguienteOrden={siguienteOrden}
              />
            </MantineProvider>
          </motion.div>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

export default ModalGestionarEjercicios;