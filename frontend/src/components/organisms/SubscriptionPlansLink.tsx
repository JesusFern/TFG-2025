import React from 'react';
import { Box, Container, Title, Text, Button, useMantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useColorScheme } from '@mantine/hooks';

export const SubscriptionPlansLink: React.FC = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Container size="lg" py={80} id="planes-suscripcion-link">
      <Box 
        p="xl" 
        style={{
          borderRadius: theme.radius.md,
          background: isDark 
            ? `linear-gradient(45deg, ${theme.colors['nutroos-green'][8]}, ${theme.colors['nutroos-green'][9]})` 
            : `linear-gradient(45deg, ${theme.colors['nutroos-green'][5]}, ${theme.colors['nutroos-green'][7]})`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 8px 20px rgba(0, 0, 0, 0.5)'
            : '0 8px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Title order={2} mb="md" c="white">
          Descubre nuestros planes de suscripción
        </Title>
        
        <Text mb="xl" size="lg" c={isDark ? theme.colors.dark[0] : theme.white}>
          Encuentra el plan perfecto para alcanzar tus objetivos de salud y bienestar
        </Text>
        
        <Button 
          size="lg" 
          radius="md"
          onClick={() => navigate('/planes-suscripcion')}
          variant={isDark ? 'outline' : 'filled'}
          color="nutroos-green"
          styles={(theme) => ({
            root: {
              fontWeight: 600,
              transition: 'all 0.2s ease',
              borderColor: isDark ? theme.colors['nutroos-green'][5] : undefined,
              '&:hover': {
                backgroundColor: isDark 
                  ? theme.colors['nutroos-green'][8] 
                  : theme.colors['nutroos-green'][5],
                transform: 'translateY(-2px)',
                boxShadow: isDark
                  ? '0 5px 15px rgba(49, 134, 80, 0.5)'
                  : '0 5px 15px rgba(49, 134, 80, 0.3)'
              }
            }
          })}
        >
          Ver todos los planes
        </Button>
      </Box>
    </Container>
  );
};