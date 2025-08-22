import { Button, Group } from '@mantine/core';
import React from 'react';

type StepNavigationProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

const StepNavigation: React.FC<StepNavigationProps> = ({
  isFirstStep,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
}) => {
  return (
    <Group justify="space-between" mt="xl" style={{ width: '100%', position: 'absolute', bottom: 32, left: 0, padding: '0 32px' }}>
      <Button variant="default" onClick={onBack} disabled={isFirstStep}>
        Atrás
      </Button>
      <Button onClick={isLastStep ? onSubmit : onNext} disabled={!!isSubmitting}>
        {isSubmitting ? 'Enviando...' : isLastStep ? 'Crear cuenta' : 'Siguiente'}
      </Button>
    </Group>
  );
};

export default StepNavigation;


