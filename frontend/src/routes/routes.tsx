import React from "react";
import { Route, Routes } from "react-router-dom";
import App from "../pages/App";
import LoginPage from "../pages/LoginPage";
import CrearDietaPage from "../pages/CrearDietaPage";

const AppRoutes: React.FC = () => {
  return (
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/crear-dieta" element={<CrearDietaPage />} />

      </Routes>
  );
};

export default AppRoutes;
