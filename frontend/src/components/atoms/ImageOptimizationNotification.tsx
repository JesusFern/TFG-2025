import React from 'react';
import { Alert, Loader } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

interface ImageOptimizationNotificationProps {
  isOptimizing: boolean;
  error?: string | null;
}

/**
 * Componente para mostrar notificaciones sobre la optimización de imágenes
 */
export const ImageOptimizationNotification: React.FC<ImageOptimizationNotificationProps> = ({
  isOptimizing,
  error
}) => {
  if (!isOptimizing && !error) {
    return null;
  }

  if (isOptimizing) {
    return (
      <Alert
        icon={<Loader size="1rem" />}
        title="Optimizando imagen"
        color="blue"
        variant="light"
        mb="md"
      >
        Estamos optimizando tu imagen de perfil para la videollamada...
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<IconInfoCircle size="1rem" />}
        title="Imagen no disponible"
        color="yellow"
        variant="light"
        mb="md"
      >
        No se pudo optimizar tu imagen de perfil. La videollamada funcionará sin imagen.
      </Alert>
    );
  }

  return null;
};
