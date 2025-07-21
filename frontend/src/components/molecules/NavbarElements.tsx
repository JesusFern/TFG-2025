// src/components/molecules/NavbarElements.tsx
import React from 'react';
import styled from 'styled-components';
import { Button } from '../atoms/ButtonLayout';
import { useNavigate } from 'react-router-dom';

const NavLinksContainer = styled.div`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled.a`
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: color 0.3s;
  
  &:hover {
    color: #2ecc71;
  }
`;

export const NavLinks: React.FC = () => (
  <NavLinksContainer>
    <NavLink href="#features">Características</NavLink>
    <NavLink href="#preview">Vista Previa</NavLink>
    <NavLink href="#faq">FAQ</NavLink>
    <NavLink href="#contact">Contacto</NavLink>
  </NavLinksContainer>
);

const AuthButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

export const AuthButtons: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => navigate('/login');
  const handleRegisterClick = () => navigate('/register');
  
  return (
    <AuthButtonsContainer>
      <Button variant="secondary" size="small" onClick={handleLoginClick}>
        Iniciar Sesión
      </Button>
      <Button size="small" onClick={handleRegisterClick}>
        Registrarse
      </Button>
    </AuthButtonsContainer>
  );
};