import { useMemo } from 'react';
import { useThemeDetection } from './useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface UseCardStylesProps {
  isActive?: boolean;
  variant?: 'plan' | 'default';
}

export const useCardStyles = ({ isActive = true, variant = 'plan' }: UseCardStylesProps = {}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  const styles = useMemo(() => {
    const baseStyles = {
      borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      overflow: 'hidden',
    };

    if (variant === 'plan') {
      return {
        ...baseStyles,
        borderLeftWidth: 4,
        borderLeftStyle: 'solid' as const,
        borderLeftColor: isActive 
          ? (isDark ? theme.colors["nutroos-green"][5] : theme.colors["nutroos-green"][6])
          : (isDark ? theme.colors.dark[3] : theme.colors.gray[4]),
        boxShadow: isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      };
    }

    return baseStyles;
  }, [isDark, theme, isActive, variant]);

  const hoverStyles = useMemo(() => {
    if (variant === 'plan') {
      return {
        boxShadow: isDark ? '0 8px 16px rgba(0, 0, 0, 0.6)' : theme.shadows.xl,
        transform: 'translateY(-2px)',
        borderLeftColor: isActive 
          ? (isDark ? theme.colors["nutroos-green"][4] : theme.colors["nutroos-green"][5])
          : undefined
      };
    }

    return {
      boxShadow: isDark ? '0 8px 16px rgba(0, 0, 0, 0.6)' : theme.shadows.xl,
      transform: 'translateY(-2px)',
    };
  }, [isDark, theme, isActive, variant]);

  const resetStyles = useMemo(() => {
    if (variant === 'plan') {
      return {
        boxShadow: isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : theme.shadows.md,
        transform: 'translateY(0)',
        borderLeftColor: isActive 
          ? (isDark ? theme.colors["nutroos-green"][5] : theme.colors["nutroos-green"][6])
          : (isDark ? theme.colors.dark[3] : theme.colors.gray[4])
      };
    }

    return {
      boxShadow: isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : theme.shadows.md,
      transform: 'translateY(0)',
    };
  }, [isDark, theme, isActive, variant]);

  return {
    styles,
    hoverStyles,
    resetStyles,
    isDark,
    theme
  };
};
