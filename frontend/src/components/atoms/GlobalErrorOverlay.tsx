import React from 'react';
import GlobalNoticeOverlay from './GlobalNoticeOverlay';

type GlobalErrorOverlayProps = {
  message?: string | null;
  withCloseButton?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
};

const GlobalErrorOverlay: React.FC<GlobalErrorOverlayProps> = ({ message, withCloseButton, onClose, title, icon }) => {
  return (
    <GlobalNoticeOverlay message={message} type="error" withCloseButton={withCloseButton} onClose={onClose} title={title} icon={icon} />
  );
};

export default GlobalErrorOverlay;


