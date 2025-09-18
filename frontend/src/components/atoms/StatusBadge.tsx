import React from 'react';
import { Badge, BadgeProps } from '@mantine/core';
import { IconCheck, IconClock } from '@tabler/icons-react';
import { useThemeDetection } from '../../hooks/useThemeDetection';

interface StatusBadgeProps extends Omit<BadgeProps, 'color' | 'variant' | 'leftSection'> {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  isActive,
  activeText = 'Activo',
  inactiveText = 'Borrador',
  ...props
}) => {
  const isDark = useThemeDetection();

  return (
    <Badge
      size="sm"
      color={isActive ? 'nutroos-green' : (isDark ? 'gray.6' : 'gray')}
      variant={isActive ? 'filled' : (isDark ? 'light' : 'outline')}
      leftSection={
        isActive 
          ? <IconCheck size={14} stroke={1.5} /> 
          : <IconClock size={14} stroke={1.5} />
      }
      fw={600}
      tt="uppercase"
      {...props}
    >
      {isActive ? activeText : inactiveText}
    </Badge>
  );
};

export default StatusBadge;
