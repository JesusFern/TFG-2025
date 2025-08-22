import React from 'react';
import styled from 'styled-components';
import { Button } from '../atoms/ButtonLayout';
import { Container } from '../atoms/Container';
import { useMantineColorScheme } from '@mantine/core';

// Estilos dinámicos basados en el tema
const HeroContainer = styled.section<{ isDark: boolean }>`
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #1d1e30 0%, #263244 100%)' 
    : 'linear-gradient(135deg, #f9fcfa 0%, #e6efe8 100%)'};
  padding: 7rem 0 5rem;
`;

const Content = styled.div`
  flex: 1;
  padding-right: 2rem;
  
  @media (max-width: 768px) {
    padding-right: 0;
    text-align: center;
  }
`;

const HeroTitle = styled.h1<{ isDark: boolean }>`
  font-size: 3rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: ${props => props.isDark ? '#e0e0e5' : 'var(--app-text)'};
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroParagraph = styled.p<{ isDark: boolean }>`
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  color: ${props => props.isDark ? '#c0c0c5' : 'var(--app-text-secondary)'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const ImageWrapper = styled.div<{ isDark: boolean }>`
  flex: 1;
  display: flex;
  justify-content: center;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: ${props => props.isDark 
      ? '0 10px 30px rgba(0, 0, 0, 0.4)' 
      : '0 10px 30px rgba(0, 0, 0, 0.1)'};
    filter: ${props => props.isDark ? 'brightness(0.85)' : 'none'};
  }
  
  @media (max-width: 768px) {
    margin-top: 2rem;
  }
`;

const Highlight = styled.span<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#4CB46F' : 'var(--app-accent)'};
  font-weight: 700;
  text-shadow: ${props => props.isDark ? '0px 0px 8px rgba(76, 180, 111, 0.3)' : 'none'};
`;

// Contenido responsivo
const ResponsiveLayout = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Hero: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <HeroContainer isDark={isDark}>
      <Container>
        <ResponsiveLayout>
          <Content>
            <HeroTitle isDark={isDark}>
              Tu camino hacia<br /> 
              una vida <Highlight isDark={isDark}>saludable</Highlight><br />
              comienza aquí
            </HeroTitle>
            <HeroParagraph isDark={isDark}>
              Nutroos te ofrece planes de nutrición y entrenamiento personalizados,
              seguimiento de progreso y apoyo profesional para alcanzar tus objetivos de salud.
            </HeroParagraph>
            <ButtonGroup>
              <Button primary={true}>Comenzar Ahora</Button>
              <Button>Saber Más</Button>
            </ButtonGroup>
          </Content>
          <ImageWrapper isDark={isDark}>
            <img src="/images/nutroos-app-preview.jpg" alt="Nutroos App Preview" />
          </ImageWrapper>
        </ResponsiveLayout>
      </Container>
    </HeroContainer>
  );
};