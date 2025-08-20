import React from 'react';
import styled from 'styled-components';

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  isDark?: boolean;
}

const Card = styled.div<{ isDark?: boolean }>`
  background-color: ${props => props.isDark ? 'var(--app-paper-bg)' : 'white'};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: ${props => props.isDark 
    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
    : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--app-border-color);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.isDark 
      ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
      : '0 8px 24px rgba(0, 0, 0, 0.1)'};
  }
`;

const IconContainer = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Title = styled.h3<{ isDark?: boolean }>`
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: ${props => props.isDark ? 'var(--mantine-color-gray-0)' : 'var(--app-text)'};
  font-weight: 600;
`;

const Description = styled.p<{ isDark?: boolean }>`
  font-size: 1rem;
  line-height: 1.6;
  color: ${props => props.isDark ? 'var(--mantine-color-gray-3)' : 'var(--app-text-secondary)'};
`;

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, isDark }) => (
  <Card isDark={isDark}>
    <IconContainer>{icon}</IconContainer>
    <Title isDark={isDark}>{title}</Title>
    <Description isDark={isDark}>{description}</Description>
  </Card>
);