import { Alert } from '@mantine/core';
import React from 'react';

type FormErrorAlertProps = {
  message?: string | null;
};

const FormErrorAlert: React.FC<FormErrorAlertProps> = ({ message }) => {
  if (!message) return null;
  return (
    <Alert color="red" variant="light" style={{ marginBottom: 12 }}>
      {message}
    </Alert>
  );
};

export default FormErrorAlert;


