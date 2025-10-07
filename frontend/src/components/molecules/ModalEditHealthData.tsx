import React, { useState } from 'react';
import { Modal, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import HealthDataForm from '../forms/health/HealthDataForm';
import { DatosSaludYNutricion } from '../../types/profile';

interface HealthFormData {
  altura: number;
  pesoActual: number;
  objetivoPeso: number;
  condicionesMedicas: string[];
  restriccionesDieteticas: string[];
  alergiasIntolerancias: string[];
  medicacionActual: string[];
  preferenciasAlimentarias: string[];
  horariosComidas: Array<{
    comida: string;
    hora: string;
  }>;
}

interface ModalEditHealthDataProps {
  opened: boolean;
  onClose: () => void;
  initialData?: DatosSaludYNutricion;
  onSave: (data: HealthFormData) => Promise<void>;
}

const ModalEditHealthData: React.FC<ModalEditHealthDataProps> = ({
  opened,
  onClose,
  initialData,
  onSave
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: HealthFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos de salud');
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
      opened={opened}
      onClose={handleCancel}
      title="Editar Datos de Salud y Nutrición"
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

      <HealthDataForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default ModalEditHealthData;
