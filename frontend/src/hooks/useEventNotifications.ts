import React from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export const useEventNotifications = () => {
  const showSuccessNotification = (message: string) => {
    notifications.show({
      title: 'Éxito',
      message,
      color: 'green',
      icon: React.createElement(IconCheck, { size: 16 })
    });
  };

  const showErrorNotification = (message: string, error?: Error | unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    notifications.show({
      title: 'Error',
      message: `${message}: ${errorMessage}`,
      color: 'red',
      icon: React.createElement(IconX, { size: 16 })
    });
  };

  const showEventCreatedSuccess = () => {
    showSuccessNotification('Evento creado correctamente');
  };

  const showEventUpdatedSuccess = () => {
    showSuccessNotification('Evento actualizado correctamente');
  };

  const showEventDeletedSuccess = () => {
    showSuccessNotification('Evento eliminado correctamente');
  };

  const showEventCreateError = (error: Error | unknown) => {
    showErrorNotification('No se pudo crear el evento', error);
  };

  const showEventUpdateError = (error: Error | unknown) => {
    showErrorNotification('No se pudo actualizar el evento', error);
  };

  const showEventDeleteError = (error: Error | unknown) => {
    showErrorNotification('No se pudo eliminar el evento', error);
  };

  return {
    showSuccessNotification,
    showErrorNotification,
    showEventCreatedSuccess,
    showEventUpdatedSuccess,
    showEventDeletedSuccess,
    showEventCreateError,
    showEventUpdateError,
    showEventDeleteError
  };
};
