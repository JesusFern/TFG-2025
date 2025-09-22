import React from 'react';
import { Badge, Tooltip } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

interface ComingSoonBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'filled' | 'outline' | 'dot' | 'gradient';
  color?: string;
  tooltip?: string;
}

/**
 * Componente de etiqueta "Próximamente" para funcionalidades no implementadas
 */
export const ComingSoonBadge: React.FC<ComingSoonBadgeProps> = ({
  size = 'sm',
  variant = 'light',
  color = 'orange',
  tooltip = 'Esta funcionalidad estará disponible próximamente'
}) => {
  return (
    <Tooltip label={tooltip} position="top" withArrow>
      <Badge
        size={size}
        variant={variant}
        color={color}
        leftSection={<IconClock size={12} />}
        style={{ cursor: 'help' }}
      >
        Próximamente
      </Badge>
    </Tooltip>
  );
};
