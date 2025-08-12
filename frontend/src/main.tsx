import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import "./styles/index.css";
import AppRoutes from "./routes/routes";
import "react-datepicker/dist/react-datepicker.css";
import { theme } from './styles/mantine/MantineOverride';
import '@mantine/core/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <MantineProvider
    theme={{
      /* otros ajustes */
    }}
    defaultColorScheme="dark"
  >
    <BrowserRouter>
      <MantineProvider theme={theme}>
        <AppRoutes />
      </MantineProvider>
    </BrowserRouter>
  </MantineProvider>
  </React.StrictMode>
);