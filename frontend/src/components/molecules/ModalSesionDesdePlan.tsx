import React from 'react';
import { Modal, Stack, Divider } from '@mantine/core';
import { SesionDetalle, RegistroEjercicioDetalle } from '../../types/estadisticas';
import HeaderSesion from '../atoms/HeaderSesion';
import SeccionEjercicios from '../atoms/SeccionEjercicios';
import BotonCerrar from '../atoms/BotonCerrar';

interface ModalSesionDesdePlanProps {
  opened: boolean;
  onClose: () => void;
  sesion: SesionDetalle | null;
  onRegistroClick: (registro: RegistroEjercicioDetalle) => void;
  registros: RegistroEjercicioDetalle[];
}

export const ModalSesionDesdePlan: React.FC<ModalSesionDesdePlanProps> = ({
  opened,
  onClose,
  sesion,
  onRegistroClick,
  registros
}) => {
  if (!sesion) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Sesión: ${sesion.tipoEntrenamiento}`}
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
        <SeccionEjercicios 
          ejercicios={sesion.ejercicios}
          registros={registros}
          sesionId={sesion.id}
          onRegistroClick={onRegistroClick}
          showAcciones={true}
          descripcion="Haz clic en 'Ver Registro' para ver los detalles del ejercicio"
        />

        <BotonCerrar onClose={onClose} />
      </Stack>
    </Modal>
  );
};

export default ModalSesionDesdePlan;
