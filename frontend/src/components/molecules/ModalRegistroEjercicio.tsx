import React from 'react';
import { Modal, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import FormularioRegistroEjercicio from '../forms/training/FormularioRegistroEjercicio';
import { CrearRegistroEjercicioDTO, Ejercicio, SesionPlan } from '../../types/training';
import { trainingService } from '../../services/trainingService';

interface ModalRegistroEjercicioProps {
  opened: boolean;
  onClose: () => void;
  ejercicio: Ejercicio;
  sesion: SesionPlan;
  ejercicioSesion: {
    series: number;
    repeticiones: number;
    peso?: number;
    tiempoDescanso: number;
    nivelIntensidad: string;
  };
  onSuccess?: () => void;
}

const ModalRegistroEjercicio: React.FC<ModalRegistroEjercicioProps> = ({
  opened,
  onClose,
  ejercicio,
  sesion,
  ejercicioSesion,
  onSuccess
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (data: CrearRegistroEjercicioDTO) => {
    try {
      setLoading(true);
      setError(null);

      await trainingService.crearRegistroEjercicio(data);
      
      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
      
      // Cerrar modal
      onClose();
    } catch (err) {
      console.error('Error al registrar ejercicio:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar el ejercicio');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Registrar Ejercicio"
      size="xl"
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
    >
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          mb="md"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

        <FormularioRegistroEjercicio
          ejercicio={{
            _id: ejercicio._id || '',
            nombre: ejercicio.nombre,
            grupoMuscular: ejercicio.grupoMuscular,
            equipamiento: ejercicio.equipamiento,
            nivelDificultad: ejercicio.nivelDificultad
          }}
          sesionId={sesion._id!}
          ejercicioSesion={ejercicioSesion}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          loading={loading}
        />
    </Modal>
  );
};

export default ModalRegistroEjercicio;
