// src/components/organisms/Navbar.tsx
import React from 'react';
import styled from 'styled-components';
import { NavLinks, AuthButtons } from '../molecules/NavbarElements';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2ecc71;
`;

export const Navbar: React.FC = () => (
  <NavbarContainer>
    <Logo>Nutroos</Logo>
    <NavLinks />
    <AuthButtons />
  </NavbarContainer>
);