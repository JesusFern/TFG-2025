import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';
import { Container } from '../atoms/Container';
import { Button } from '../atoms/ButtonLayout';

const SubscriptionSection = styled.section<{ isDark: boolean }>`
  padding: 6rem 0;
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #1d1e30 0%, #263244 100%)' 
    : 'linear-gradient(135deg, #f9fcfa 0%, #e6efe8 100%)'};
  position: relative;
  overflow: hidden;

  /* Decorative elements */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: ${props => props.isDark 
      ? 'radial-gradient(circle, rgba(76, 180, 111, 0.08) 0%, transparent 70%)' 
      : 'radial-gradient(circle, rgba(76, 180, 111, 0.1) 0%, transparent 70%)'};
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: ${props => props.isDark 
      ? 'radial-gradient(circle, rgba(76, 180, 111, 0.06) 0%, transparent 70%)' 
      : 'radial-gradient(circle, rgba(76, 180, 111, 0.08) 0%, transparent 70%)'};
    pointer-events: none;
  }
`;

const ContentCard = styled.div<{ isDark: boolean }>`
  position: relative;
  padding: 4rem 3rem;
  border-radius: 20px;
  text-align: center;
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, rgba(76, 180, 111, 0.15) 0%, rgba(76, 180, 111, 0.25) 100%)' 
    : 'linear-gradient(135deg, rgba(76, 180, 111, 0.08) 0%, rgba(76, 180, 111, 0.15) 100%)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.isDark 
    ? 'rgba(76, 180, 111, 0.25)' 
    : 'rgba(76, 180, 111, 0.2)'};
  box-shadow: ${props => props.isDark 
    ? '0 30px 80px rgba(0, 0, 0, 0.4), 0 10px 40px rgba(76, 180, 111, 0.15)' 
    : '0 30px 80px rgba(0, 0, 0, 0.1), 0 10px 40px rgba(76, 180, 111, 0.1)'};
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.isDark 
      ? '0 40px 100px rgba(0, 0, 0, 0.5), 0 15px 50px rgba(76, 180, 111, 0.2)' 
      : '0 40px 100px rgba(0, 0, 0, 0.15), 0 15px 50px rgba(76, 180, 111, 0.15)'};
  }

  @media (max-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const IconWrapper = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 12px rgba(76, 180, 111, 0.3));
`;

const Title = styled.h2<{ isDark: boolean }>`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${props => props.isDark ? '#ffffff' : 'var(--app-text)'};
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p<{ isDark: boolean }>`
  font-size: 1.15rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  color: ${props => props.isDark ? '#d0d0d5' : 'var(--app-text-secondary)'};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Highlight = styled.span<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#4CB46F' : 'var(--app-accent)'};
  font-weight: 700;
  text-shadow: ${props => props.isDark ? '0px 0px 10px rgba(76, 180, 111, 0.4)' : 'none'};
`;

export const SubscriptionPlansLink: React.FC = () => {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <SubscriptionSection isDark={isDark} id="planes-suscripcion-link">
      <Container>
        <ContentCard isDark={isDark}>
          <IconWrapper>🎯</IconWrapper>
          <Title isDark={isDark}>
            Descubre nuestros <Highlight isDark={isDark}>planes</Highlight>
          </Title>
          <Description isDark={isDark}>
            Encuentra el plan perfecto para alcanzar tus objetivos de salud y bienestar. 
            Desde planes básicos hasta asesoramiento personalizado completo.
          </Description>
          <ButtonWrapper>
            <Button primary={true} onClick={() => navigate('/planes-suscripcion')}>
              Ver todos los planes
            </Button>
            <Button onClick={() => navigate('/register')}>
              Comenzar gratis
            </Button>
          </ButtonWrapper>
        </ContentCard>
      </Container>
    </SubscriptionSection>
  );
};