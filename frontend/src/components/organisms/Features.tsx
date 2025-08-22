import React from 'react';
import styled from 'styled-components';
import { FeatureCard } from '../molecules/FeatureCard';
import { Heading2 } from '../atoms/Typography';
import { Container, Section } from '../atoms/Container';
import { useMantineColorScheme } from '@mantine/core';

const FeaturesSection = styled(Section)<{ isDark: boolean }>`
  background-color: ${props => props.isDark ? '#1d1e30' : '#f9fcfa'};
  padding: 5rem 0;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled(Heading2)<{ isDark: boolean }>`
  text-align: center;
  margin-bottom: 3rem;
  
  span {
    color: var(--app-accent);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: var(--app-accent);
      border-radius: 2px;
    }
  }
`;

export const Features: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const features = [
    {
      icon: '🥗',
      title: 'Planes de Nutrición Personalizados',
      description: 'Recibe planes de alimentación adaptados a tus necesidades, preferencias y objetivos específicos.'
    },
    {
      icon: '💪',
      title: 'Entrenamientos a Medida',
      description: 'Ejercicios y rutinas diseñadas específicamente para ti, considerando tu nivel de condición física y metas.'
    },
    {
      icon: '📊',
      title: 'Seguimiento de Progreso',
      description: 'Monitorea tus avances con métricas visuales, informes automáticos y estadísticas detalladas.'
    },
    {
      icon: '👨‍⚕️',
      title: 'Asesoramiento Profesional',
      description: 'Comunícate directamente con entrenadores y nutricionistas mediante videollamadas y mensajería.'
    },
    {
      icon: '🏆',
      title: 'Sistema de Gamificación',
      description: 'Mantente motivado con retos, recompensas y competiciones amistosas que hacen más divertido el proceso.'
    },
    {
      icon: '📱',
      title: 'Acceso Multiplataforma',
      description: 'Utiliza Nutroos desde cualquier dispositivo, con una experiencia perfectamente adaptada a móviles, tablets y ordenadores.'
    }
  ];

  return (
    <FeaturesSection id="features" isDark={isDark}>
      <Container>
        <SectionTitle isDark={isDark}>Nuestras <span>Características</span></SectionTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              isDark={isDark}
            />
          ))}
        </FeaturesGrid>
      </Container>
    </FeaturesSection>
  );
};