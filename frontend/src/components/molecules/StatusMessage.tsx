import React from 'react';
import { Alert, Space } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface StatusMessageProps {
  mensaje: { tipo: 'error' | 'success', texto: string } | null;
  onClose: () => void;
  showSpace?: boolean;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ 
  mensaje, 
  onClose, 
  showSpace = true 
}) => {
  if (!mensaje) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert 
        icon={<IconAlertCircle size={16} />}
        title={mensaje.tipo === 'error' ? 'Error' : 'Éxito'}
        color={mensaje.tipo === 'error' ? 'red' : 'green'}
        variant="filled"
        mb="md"
        withCloseButton
        onClose={onClose}
      >
        {mensaje.texto}
      </Alert>
      {showSpace && <Space h="md" />}
    </motion.div>
  );
};

export default StatusMessage;
