import { createTheme, MantineColorsTuple, MantineTheme as DefaultMantineTheme } from '@mantine/core';

// Define el tipo extendido que incluye la propiedad 'dark' que está disponible en tiempo de ejecución
type MantineTheme = DefaultMantineTheme & { dark: boolean };

// Define los verdes personalizados para ambos modos
const nutroos_green: MantineColorsTuple = [
  '#e3fcef', // 0
  '#d4f2e2', // 1
  '#b5e2c7', // 2
  '#93d2aa', // 3
  '#75c490', // 4
  '#5fba7d', // 5
  '#4cb46f', // 6 - Color principal
  '#3d9d5d', // 7
  '#318650', // 8
  '#1f7041'  // 9
];

// Define la extensión del tema
const theme = createTheme({
  // Personaliza las fuentes
  fontFamily: 'Rubik, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: { fontFamily: 'Rubik, sans-serif' },
  
  // Define colores personalizados
  colors: {
    // Añade tu color verde personalizado
    'nutroos-green': nutroos_green,
    
    // Personalizando colores para modo oscuro
    dark: [
      '#d5d7e0', // 0: Texto más claro
      '#acaebf', // 1: Texto secundario
      '#8c8fa3', // 2: Texto terciario
      '#666980', // 3: Texto inactivo
      '#4d4f66', // 4: Bordes oscuros
      '#34354a', // 5: Fondos de inputs
      '#2b2c3d', // 6: Fondos de paneles
      '#1d1e30', // 7: Fondos principales
      '#0c0d21', // 8: Fondos modales
      '#01010a'  // 9: Fondo de página
    ],
    
    // Personalizando colores para modo claro - con más influencia de verde
    gray: [
      '#f9fcfa', // 0: Casi blanco con toque verde
      '#f0f5f2', // 1: Blanco hueso con toque verde
      '#e6efe8', // 2: Fondo muy claro
      '#dbe5de', // 3: Bordes sutiles
      '#c2d3c7', // 4: Bordes más notables
      '#9fb5a6', // 5: Texto inactivo
      '#748a7b', // 6: Texto secundario
      '#5c6f61', // 7: Texto principal
      '#3d4940', // 8: Texto resaltado
      '#1e2922'  // 9: Texto fuerte
    ]
  },
  
  // Establece colores por defecto para componentes
  primaryColor: 'nutroos-green',
  
  // Personaliza componentes específicos
  components: {
    Button: {
      defaultProps: {
        color: 'nutroos-green.6',
      },
      styles: {
        root: (theme: MantineTheme) => ({
          '&:hover': {
            backgroundColor: theme.colors['nutroos-green'][theme.dark ? 8 : 4],
          },
        }),
      },
    },
    ActionIcon: {
      defaultProps: {
        color: 'nutroos-green.6',
      }
    },
    Anchor: {
      defaultProps: {
        color: 'nutroos-green.7',
      }
    },
    Paper: {
      styles: {
        root: (theme: MantineTheme) => ({
          backgroundColor: theme.dark ? theme.colors.dark[6] : theme.white,
          borderColor: theme.dark ? theme.colors.dark[4] : theme.colors.gray[3],
        }),
      },
    },
    Card: {
      styles: {
        root: (theme: MantineTheme) => ({
          backgroundColor: theme.dark ? theme.colors.dark[6] : theme.white,
          borderColor: theme.dark ? theme.colors.dark[4] : theme.colors.gray[3],
        }),
      },
    },
  },
  
  // Otros ajustes generales
  white: '#FFFFFF',
  black: '#1A1B1E',
  
  // Ajustes específicos
  defaultRadius: 'md',
  focusRing: 'auto',
});

export default theme;