import React from 'react';
import { Container, Loader, Alert, Center } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface LoadingErrorStatesProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

const LoadingErrorStates: React.FC<LoadingErrorStatesProps> = ({
  loading,
  error,
  children
}) => {
  if (loading) {
    return (
      <Container py="xl">
        <Center>
          <Loader color="nutroos-green" size="lg" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return <>{children}</>;
};

export default LoadingErrorStates;
