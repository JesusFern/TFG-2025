import React from "react";
import { Route, Routes } from "react-router-dom";
import App from "../pages/App";
import LoginPage from "../pages/LoginPage";
import LandingPage from "../pages/LandingPage";
import RegisterPage from "../pages/RegisterPage";
import CrearDietaPage from "../pages/CrearDietaPage";

const AppRoutes: React.FC = () => {
  return (
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/landingPage" element={<LandingPage />} />
        <Route path="/crear-dieta/:clienteId" element={<CrearDietaPage />} />

      </Routes>
  );
};

export default AppRoutes;
