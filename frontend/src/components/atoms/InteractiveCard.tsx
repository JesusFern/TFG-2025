import React from 'react';
import { Card, CardProps } from '@mantine/core';
import { useCardStyles } from '../../hooks/useCardStyles';

interface InteractiveCardProps extends Omit<CardProps, 'style' | 'onMouseOver' | 'onMouseOut'> {
  children: React.ReactNode;
  isActive?: boolean;
  variant?: 'plan' | 'default';
  onClick?: () => void;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  isActive = true,
  variant = 'plan',
  onClick,
  ...props
}) => {
  const { styles, hoverStyles, resetStyles, isDark } = useCardStyles({ isActive, variant });

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    Object.assign(element.style, hoverStyles);
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    Object.assign(element.style, resetStyles);
  };

  return (
    <Card
      withBorder
      shadow="md"
      p="lg"
      radius="md"
      bg={isDark ? 'dark.7' : 'white'}
      c={isDark ? 'gray.0' : 'gray.9'}
      style={styles}
      onClick={onClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    >
      {children}
    </Card>
  );
};

export default InteractiveCard;
