// src/components/organisms/Features.tsx
import React from 'react';
import styled from 'styled-components';
import { FeatureCard } from '../molecules/FeatureCard';
import { Heading2 } from '../atoms/Typography';
import { Container, Section } from '../atoms/Container';

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

export const Features: React.FC = () => {
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
    <Section id="features">
      <Container>
        <Heading2>Nuestras <span>Características</span></Heading2>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </FeaturesGrid>
      </Container>
    </Section>
  );
};