import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ColorSchemeProvider } from './styles/components/ColorSchemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/routes';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles/index.css';
import theme from './styles/mantine/MantineTheme';
import './utils/axiosInterceptor';
import 'dayjs/locale/es';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
          <ColorSchemeProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ColorSchemeProvider>
        </DatesProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);