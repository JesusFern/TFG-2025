import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ColorSchemeProvider } from './styles/components/ColorSchemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/routes';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles/index.css';
import theme from './styles/mantine/MantineTheme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ColorSchemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ColorSchemeProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);