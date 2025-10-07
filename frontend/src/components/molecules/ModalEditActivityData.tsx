import React, { useState } from 'react';
import { Modal, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import ActivityDataForm from '../forms/activity/ActivityDataForm';
import { DatosActividadFisica } from '../../types/profile';

interface ActivityFormData {
  frecuenciaEjercicio: string;
  tipoEjercicioPractica: string[];
  objetivosPrincipales: string[];
  preferenciasEjercicios: string[];
  limitacionesFisicas: string[];
}

interface ModalEditActivityDataProps {
  opened: boolean;
  onClose: () => void;
  initialData?: DatosActividadFisica;
  onSave: (data: ActivityFormData) => Promise<void>;
}

const ModalEditActivityData: React.FC<ModalEditActivityDataProps> = ({
  opened,
  onClose,
  initialData,
  onSave
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ActivityFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos de actividad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      zIndex={1000}
      opened={opened}
      onClose={handleCancel}
      title="Editar Datos de Actividad Física"
      size="lg"
      centered
    >
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <ActivityDataForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default ModalEditActivityData;
