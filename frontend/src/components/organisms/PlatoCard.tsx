import React from 'react';
import { Group, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconChefHat, IconLeaf, IconExternalLink } from '@tabler/icons-react';

interface PlatoCardProps {
  plato: {
    nombre?: string | null;
    receta?: string | null | { _id: string; nombreReceta?: string; [key: string]: unknown };
  };
  isDark: boolean;
  isMobile?: boolean;
  onVerReceta: (recetaId: string) => void;
}

const PlatoCard: React.FC<PlatoCardProps> = ({ plato, isDark, isMobile = false, onVerReceta }) => {
  const hasReceta = !!plato.receta;
  const recetaId = typeof plato.receta === 'string' ? plato.receta : plato.receta?._id;
  const size = isMobile ? 'xs' : 'sm';
  const iconSize = isMobile ? 10 : 14;
  const externalIconSize = isMobile ? 8 : 12;
  const padding = isMobile ? 'xs' : 'sm';

  const baseStyles = {
    backgroundColor: hasReceta 
      ? (isDark ? 'rgba(76, 175, 80, 0.06)' : 'rgba(76, 175, 80, 0.04)')
      : (isDark ? 'rgba(148, 163, 184, 0.05)' : 'rgba(148, 163, 184, 0.02)'),
    borderRadius: isMobile ? '6px' : '8px',
    border: hasReceta 
      ? '1px solid rgba(76, 175, 80, 0.15)' 
      : '1px solid rgba(148, 163, 184, 0.1)',
    cursor: hasReceta ? 'pointer' : 'default',
    transition: hasReceta ? 'all 0.2s ease' : 'none',
    boxShadow: hasReceta ? (isMobile ? '0 1px 3px rgba(76, 175, 80, 0.08)' : '0 2px 4px rgba(76, 175, 80, 0.08)') : 'none'
  };

  const hoverEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasReceta) {
      e.currentTarget.style.backgroundColor = isDark ? 'rgba(76, 175, 80, 0.12)' : 'rgba(76, 175, 80, 0.06)';
      e.currentTarget.style.borderColor = 'rgba(76, 175, 80, 0.25)';
      e.currentTarget.style.boxShadow = isMobile ? '0 2px 6px rgba(76, 175, 80, 0.15)' : '0 4px 8px rgba(76, 175, 80, 0.15)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }
  };

  const hoverLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasReceta) {
      e.currentTarget.style.backgroundColor = isDark ? 'rgba(76, 175, 80, 0.06)' : 'rgba(76, 175, 80, 0.04)';
      e.currentTarget.style.borderColor = 'rgba(76, 175, 80, 0.15)';
      e.currentTarget.style.boxShadow = isMobile ? '0 1px 3px rgba(76, 175, 80, 0.08)' : '0 2px 4px rgba(76, 175, 80, 0.08)';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <Group 
      gap={isMobile ? "xs" : "sm"}
      align="center"
      p={padding}
      style={baseStyles}
      onClick={() => hasReceta && recetaId && onVerReceta(recetaId)}
      onMouseEnter={hoverEnter}
      onMouseLeave={hoverLeave}
    >
      <ThemeIcon 
        size={size} 
        color={hasReceta ? "nutroos-green" : "gray"}
        variant={hasReceta ? "filled" : "light"}
        radius="xl"
      >
        {hasReceta ? <IconChefHat size={iconSize} /> : <IconLeaf size={iconSize} />}
      </ThemeIcon>
      
      <Text 
        size={size} 
        fw={500}
        lineClamp={isMobile ? 1 : undefined}
        style={{ 
          flex: 1,
          color: hasReceta 
            ? 'rgba(76, 175, 80, 0.9)' 
            : (isDark ? 'var(--mantine-color-gray-2)' : 'var(--mantine-color-gray-7)'),
          textDecoration: hasReceta ? 'underline' : 'none',
          textDecorationStyle: 'dotted' as const
        }}
      >
        {plato.nombre || 'Plato sin nombre'}
        {hasReceta && !isMobile && (
          <Text component="span" size="xs" ml="xs" style={{ color: 'rgba(76, 175, 80, 0.8)' }}>
            (Receta disponible)
          </Text>
        )}
      </Text>
      
      {hasReceta && (
        <Tooltip label="Ver detalles de la receta">
          <ThemeIcon 
            size={size} 
            color="green" 
            variant="light"
            radius="xl"
            style={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}
          >
            <IconExternalLink size={externalIconSize} />
          </ThemeIcon>
        </Tooltip>
      )}
    </Group>
  );
};

export default PlatoCard;
