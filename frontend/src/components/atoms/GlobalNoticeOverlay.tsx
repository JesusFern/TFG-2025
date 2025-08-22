import React from 'react';
import { Alert } from '@mantine/core';
import styles from '../../styles/GlobalNoticeOverlay.module.css';
import { IconCheck, IconAlertTriangle, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';

export type NoticeType = 'success' | 'error' | 'warning' | 'info';

type GlobalNoticeOverlayProps = {
  message?: string | null;
  type?: NoticeType;
  withCloseButton?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
};

const typeToColor: Record<NoticeType, string> = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
};

const defaultTitleByType: Record<NoticeType, string> = {
  success: 'Operación completada',
  error: 'Error',
  warning: 'Aviso',
  info: 'Información',
};

const defaultIconByType: Record<NoticeType, React.ReactNode> = {
  success: <IconCheck size={20} />,
  error: <IconAlertCircle size={20} />,
  warning: <IconAlertTriangle size={20} />,
  info: <IconInfoCircle size={20} />,
};

const GlobalNoticeOverlay: React.FC<GlobalNoticeOverlayProps> = ({
  message,
  type = 'info',
  withCloseButton = true,
  onClose,
  title,
  icon,
}) => {
  if (!message) return null;
  return (
    <div className={styles.root}>
        <Alert
          color={typeToColor[type]}
          variant="filled"
          withCloseButton={withCloseButton}
          onClose={onClose}
          title={title ?? defaultTitleByType[type]}
          icon={icon ?? defaultIconByType[type]}
          classNames={{message: styles.message }}
        >
          {message}
        </Alert>
    </div>
  );
};

export default GlobalNoticeOverlay;


