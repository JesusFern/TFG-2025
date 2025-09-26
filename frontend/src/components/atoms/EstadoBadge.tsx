import { Badge } from '@mantine/core';

interface EstadoBadgeProps {
  completado: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'filled' | 'outline';
}

export const EstadoBadge = ({ 
  completado, 
  size = 'sm', 
  variant = 'light' 
}: EstadoBadgeProps) => {
  return (
    <Badge 
      color={completado ? 'green' : 'red'}
      variant={variant}
      size={size}
    >
      {completado ? 'Completado' : 'No completado'}
    </Badge>
  );
};

export default EstadoBadge;
