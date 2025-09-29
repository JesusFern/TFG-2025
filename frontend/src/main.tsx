import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { DatesProvider } from '@mantine/dates';
import { ColorSchemeProvider } from './styles/components/ColorSchemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { VideoProvider } from './contexts/VideoContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRoutes from './routes/routes';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import './styles/index.css';
import theme from './styles/mantine/MantineTheme';
import './utils/axiosInterceptor';
import 'dayjs/locale/es';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications />
          <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
            <ColorSchemeProvider>
              <AuthProvider>
                <VideoProvider>
                  <NotificationProvider>
                    <AppRoutes />
                  </NotificationProvider>
                </VideoProvider>
              </AuthProvider>
            </ColorSchemeProvider>
          </DatesProvider>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);