import { ReactNode, useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import theme from '../mantine/MantineTheme';

interface ColorSchemeProviderProps {
  children: ReactNode;
}

export function ColorSchemeProvider({ children }: ColorSchemeProviderProps) {
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    // Actualizar colores de fondo y texto según el modo
    const isDark = colorScheme === 'dark';
    
    // Colores personalizados para modo oscuro: gris oscuro con verde
    // Colores personalizados para modo claro: blanco con verde
    
    // Fondos
    const backgroundColor = isDark ? '#1d1e30' : '#f9fcfa'; // Fondo principal
    const paperBgColor = isDark ? '#2b2c3d' : '#ffffff';    // Fondo de tarjetas/paneles
    
    // Bordes
    const borderColor = isDark ? '#4d4f66' : '#dbe5de';     // Color de bordes
    
    // Acentos y destacados
    const accentColor = theme.colors?.['nutroos-green']?.[isDark ? 6 : 5] || '#4cb46f';
    const accentLightColor = theme.colors?.['nutroos-green']?.[isDark ? 4 : 2] || '#b5e2c7';
    
    // Texto
    const textColor = isDark ? '#d5d7e0' : '#5c6f61';       // Color de texto principal
    const textSecondaryColor = isDark ? '#acaebf' : '#748a7b'; // Texto secundario
    
    // Aplicar colores al cuerpo
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = textColor;
    
    // Aplicar variables CSS personalizadas
    document.documentElement.style.setProperty('--app-background', backgroundColor);
    document.documentElement.style.setProperty('--app-paper-bg', paperBgColor);
    document.documentElement.style.setProperty('--app-border-color', borderColor);
    document.documentElement.style.setProperty('--app-accent', accentColor);
    document.documentElement.style.setProperty('--app-accent-light', accentLightColor);
    document.documentElement.style.setProperty('--app-header-bg', isDark ? '#2b2c3d' : '#ffffff');
    document.documentElement.style.setProperty('--app-footer-bg', isDark ? '#0c0d21' : '#f0f5f2');
    document.documentElement.style.setProperty('--app-text', textColor);
    document.documentElement.style.setProperty('--app-text-secondary', textSecondaryColor);
    
    // Definir colores para componentes específicos
    document.documentElement.style.setProperty('--app-card-bg', paperBgColor);
    document.documentElement.style.setProperty('--app-sidebar-bg', isDark ? '#2b2c3d' : '#f9fcfa');
    document.documentElement.style.setProperty('--app-hover-bg', isDark ? '#34354a' : '#e6efe8');
  }, [colorScheme]);

  return <>{children}</>;
}