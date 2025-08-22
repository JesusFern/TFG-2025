import React from 'react';
import { Notification } from '@mantine/core';
import styles from '../../styles/GlobalNotificationOverlay.module.css';
import { IconCheck, IconAlertTriangle, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

type GlobalNotificationOverlayProps = {
  message?: string | null;
  title?: React.ReactNode;
  type?: NotificationType;
  withCloseButton?: boolean;
  onClose?: () => void;
};

const defaultTitleByType: Record<NotificationType, string> = {
  success: 'Operación completada',
  error: 'Error',
  warning: 'Aviso',
  info: 'Información',
};

const defaultIconByType: Record<NotificationType, React.ReactNode> = {
  success: <IconCheck size={18} />,
  error: <IconAlertCircle size={18} />,
  warning: <IconAlertTriangle size={18} />,
  info: <IconInfoCircle size={18} />,
};

const GlobalNotificationOverlay: React.FC<GlobalNotificationOverlayProps> = ({
  message,
  title,
  type = 'info',
  withCloseButton = true,
  onClose,
}) => {
  if (!message) return null;
  return (
    <div className={styles.root}>
      <Notification
        withCloseButton={withCloseButton}
        onClose={onClose}
        title={title ?? defaultTitleByType[type]}
        icon={defaultIconByType[type]}
        classNames={{ description: styles.message }}
      >
        {message}
      </Notification>
    </div>
  );
};

export default GlobalNotificationOverlay;


