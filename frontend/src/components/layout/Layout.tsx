import React from 'react';
import { Box, Container } from '@mantine/core';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'var(--app-background)',
      color: 'var(--app-text)'
    }}>
      <Header />
      
      <Box component="main" style={{ flex: 1 }} py="md">
        <Container size="xl">
          {children}
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;