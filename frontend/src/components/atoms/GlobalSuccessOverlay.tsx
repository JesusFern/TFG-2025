import React from 'react';
import GlobalNoticeOverlay from './GlobalNoticeOverlay';

type Props = {
  message?: string | null;
  withCloseButton?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
};

const GlobalSuccessOverlay: React.FC<Props> = ({ message, withCloseButton, onClose, title, icon }) => (
  <GlobalNoticeOverlay message={message} type="success" withCloseButton={withCloseButton} onClose={onClose} title={title} icon={icon} />
);

export default GlobalSuccessOverlay;


