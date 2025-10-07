import React from 'react';
import { Modal, Stack, Divider } from '@mantine/core';
import { SesionDetalle } from '../../types/estadisticas';
import HeaderSesion from '../atoms/HeaderSesion';
import SeccionEjercicios from '../atoms/SeccionEjercicios';
import BotonCerrar from '../atoms/BotonCerrar';

interface ModalDetallesSesionProps {
  opened: boolean;
  onClose: () => void;
  sesion: SesionDetalle | null;
}

export const ModalDetallesSesion: React.FC<ModalDetallesSesionProps> = ({
  opened,
  onClose,
  sesion
}) => {
  if (!sesion) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Detalles de la Sesión: ${sesion.tipoEntrenamiento}`}
      size="lg"
      zIndex={1000}
    >
      <Stack gap="md">
        {/* Información de la sesión */}
        <HeaderSesion 
          tipoEntrenamiento={sesion.tipoEntrenamiento}
          fecha={sesion.fecha}
          completada={sesion.completada}
          size="lg"
        />

        <Divider />

        {/* Lista de ejercicios */}
        <SeccionEjercicios ejercicios={sesion.ejercicios} />

        <BotonCerrar onClose={onClose} />
      </Stack>
    </Modal>
  );
};

export default ModalDetallesSesion;
