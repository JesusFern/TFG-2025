import React from 'react';
import { Container, Box, Loader, Alert, Button } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface TrainingPageContainerProps {
  loading?: boolean;
  error?: string | null;
  onErrorClose?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

const TrainingPageContainer: React.FC<TrainingPageContainerProps> = ({
  loading = false,
  error = null,
  onErrorClose,
  onBack,
  children
}) => {
  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader color="nutroos-green" size="lg" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          withCloseButton
          onClose={onErrorClose}
        >
          {error}
        </Alert>
        {onBack && (
          <Button 
            mt="lg" 
            color="nutroos-green"
            onClick={onBack}
          >
            Volver
          </Button>
        )}
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" px="md">
      {children}
    </Container>
  );
};

export default TrainingPageContainer;
