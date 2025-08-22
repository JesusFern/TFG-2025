import React from 'react';
import GlobalNoticeOverlay from './GlobalNoticeOverlay';

type Props = {
  message?: string | null;
  withCloseButton?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
};

const GlobalWarningOverlay: React.FC<Props> = ({ message, withCloseButton, onClose, title, icon }) => (
  <GlobalNoticeOverlay message={message} type="warning" withCloseButton={withCloseButton} onClose={onClose} title={title} icon={icon} />
);

export default GlobalWarningOverlay;


