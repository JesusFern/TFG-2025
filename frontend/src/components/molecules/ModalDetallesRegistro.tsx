import React from 'react';
import { Modal } from '@mantine/core';
import { RegistroEjercicioDetalle } from '../../types/estadisticas';
import ContenidoRegistroEjercicio from './ContenidoRegistroEjercicio';

interface ModalDetallesRegistroProps {
  opened: boolean;
  onClose: () => void;
  registro: RegistroEjercicioDetalle | null;
}

export const ModalDetallesRegistro: React.FC<ModalDetallesRegistroProps> = ({
  opened,
  onClose,
  registro
}) => {
  if (!registro) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Detalles del Registro: ${registro.ejercicio.nombre}`}
      size="md"
      zIndex={1000}
    >
      <ContenidoRegistroEjercicio 
        registro={registro} 
        onClose={onClose} 
      />
    </Modal>
  );
};

export default ModalDetallesRegistro;