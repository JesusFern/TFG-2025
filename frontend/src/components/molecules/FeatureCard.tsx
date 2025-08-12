// src/components/molecules/FeatureCard.tsx
import React from 'react';
import styled from 'styled-components';
import { Heading3, Paragraph } from '../atoms/Typography';

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const Icon = styled.div`
  font-size: 2.5rem;
  color: #2ecc71;
  margin-bottom: 1rem;
`;

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card>
    <Icon>{icon}</Icon>
    <Heading3>{title}</Heading3>
    <Paragraph>{description}</Paragraph>
  </Card>
);