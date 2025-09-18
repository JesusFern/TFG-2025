import React from 'react';
import { Paper, PaperProps } from '@mantine/core';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface GradientPaperProps extends Omit<PaperProps, 'bg' | 'c' | 'style'> {
  children: React.ReactNode;
  variant?: 'header' | 'content';
}

const GradientPaper: React.FC<GradientPaperProps> = ({ 
  children, 
  variant = 'header',
  ...props 
}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  const getVariantStyles = () => {
    if (variant === 'header') {
      return {
        bg: isDark ? "dark.6" : "gray.0",
        c: isDark ? "gray.0" : "dark.9",
        style: { 
          borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
          background: `linear-gradient(135deg, ${isDark ? theme.colors.dark[6] : theme.colors.gray[0]} 0%, ${isDark ? theme.colors.dark[7] : theme.colors.gray[1]} 100%)`
        }
      };
    } else {
      return {
        bg: isDark ? "dark.7" : "white",
        c: isDark ? "gray.0" : "gray.9",
        style: { 
          borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3]
        }
      };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Paper
      p="lg"
      shadow="xs"
      radius="md"
      mb="xl"
      withBorder
      {...variantStyles}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default GradientPaper;
