import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { ColorSchemeProvider } from './styles/components/ColorSchemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/routes';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './styles/index.css';
import theme from './styles/mantine/MantineTheme';
import './utils/axiosInterceptor';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications />
          <ColorSchemeProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ColorSchemeProvider>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);