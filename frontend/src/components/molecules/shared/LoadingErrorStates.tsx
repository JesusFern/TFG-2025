import React from 'react';
import { Center, Loader, Alert, Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

interface LoadingStateProps {
  py?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ py = "xl" }) => {
  return (
    <Center py={py}>
      <Loader size="lg" />
    </Center>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  emptyStateComponent?: React.ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  emptyStateComponent 
}) => {
  if (error.includes('No hay datos') && emptyStateComponent) {
    return <>{emptyStateComponent}</>;
  }
  
  return (
    <Alert color="red" title="Error" icon={<IconRefresh size={16} />}>
      {error}
      <Button 
        variant="light" 
        size="sm" 
        mt="sm" 
        onClick={onRetry}
      >
        Reintentar
      </Button>
    </Alert>
  );
};
