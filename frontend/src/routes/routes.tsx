import React from "react";
import { Route, Routes } from "react-router-dom";
import App from "../pages/App";
import LoginPage from "../pages/LoginPage";

const AppRoutes: React.FC = () => {
  return (
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
  );
};

export default AppRoutes;
