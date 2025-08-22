import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import "./styles/index.css";
import AppRoutes from "./routes/routes";
import "react-datepicker/dist/react-datepicker.css";
import theme from './styles/mantine/MantineTheme';
import { ColorSchemeProvider } from './styles/components/ColorSchemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript defaultColorScheme="dark" />
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
    >
      <ColorSchemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ColorSchemeProvider>
    </MantineProvider>
  </React.StrictMode>
);