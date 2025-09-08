import React from 'react';
import { Box } from '@mantine/core';
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
      
      {/* Main content - ahora ocupa todo el ancho */}
      <Box 
        component="main" 
        style={{ 
          flex: 1,
          width: '100%' 
        }} 
        p="md"
      >
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;