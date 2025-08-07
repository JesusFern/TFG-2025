import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import AppRoutes from './routes/routes';
import { theme } from './styles/mantine/MantineOverride';

import '@mantine/core/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme}>
        <AppRoutes />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);