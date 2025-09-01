import React from 'react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  font-family: 'Poppins', sans-serif;
  color: #333;
`;

interface LandingLayoutProps {
  children: React.ReactNode;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => (
  <LayoutContainer>
    {children}
  </LayoutContainer>
);
