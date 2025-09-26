import React from 'react';
import { Modal } from '@mantine/core';
import { RegistroEjercicioDetalle } from '../../types/estadisticas';
import ContenidoRegistroEjercicio from './ContenidoRegistroEjercicio';

interface ModalRegistroDesdeSesionProps {
  opened: boolean;
  onClose: () => void;
  registro: RegistroEjercicioDetalle | null;
}

export const ModalRegistroDesdeSesion: React.FC<ModalRegistroDesdeSesionProps> = ({
  opened,
  onClose,
  registro
}) => {
  if (!registro) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Registro del Ejercicio: ${registro.ejercicio.nombre}`}
      size="md"
      zIndex={1001}
    >
      <ContenidoRegistroEjercicio 
        registro={registro} 
        onClose={onClose}
        showSesionInfo={true}
      />
    </Modal>
  );
};

export default ModalRegistroDesdeSesion;
