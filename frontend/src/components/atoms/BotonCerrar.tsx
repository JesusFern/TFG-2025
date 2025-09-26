import { Group, Button } from '@mantine/core';

interface BotonCerrarProps {
  onClose: () => void;
  variant?: 'light' | 'filled' | 'outline';
  mt?: string | number;
}

export const BotonCerrar = ({ 
  onClose, 
  variant = 'light',
  mt = 'md'
}: BotonCerrarProps) => {
  return (
    <Group justify="flex-end" mt={mt}>
      <Button variant={variant} onClick={onClose}>
        Cerrar
      </Button>
    </Group>
  );
};

export default BotonCerrar;
