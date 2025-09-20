import React from 'react';
import { Box, Text } from '@mantine/core';

interface EmptyPlatoCardProps {
  isDark: boolean;
  isMobile?: boolean;
}

const EmptyPlatoCard: React.FC<EmptyPlatoCardProps> = ({ isDark, isMobile = false }) => {
  const minHeight = isMobile ? '40px' : '60px';
  const padding = isMobile ? 'sm' : 'md';
  const borderRadius = isMobile ? '6px' : '8px';
  const textSize = isMobile ? 'xs' : 'sm';

  return (
    <Box 
      p={padding} 
      style={{
        backgroundColor: isDark ? 'rgba(148, 163, 184, 0.02)' : 'rgba(148, 163, 184, 0.01)',
        borderRadius,
        border: '1px dashed rgba(148, 163, 184, 0.15)',
        textAlign: 'center',
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Text 
        size={textSize} 
        c="dimmed" 
        fs="italic"
        opacity={0.5}
      >
        —
      </Text>
    </Box>
  );
};

export default EmptyPlatoCard;
