// src/components/organisms/Hero.tsx
import React from 'react';
import styled from 'styled-components';
import { Heading1, Paragraph } from '../atoms/Typography';
import { Button } from '../atoms/ButtonLayout';
import { Container } from '../atoms/Container';

const HeroContainer = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f9f9f9 0%, #e9f7ef 100%);
  padding: 7rem 0 5rem;
`;

const Content = styled.div`
  flex: 1;
  padding-right: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ImageWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

export const Hero: React.FC = () => (
  <HeroContainer>
    <Container>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Content>
          <Heading1>
            Tu camino hacia una vida <span>saludable</span> comienza aquí
          </Heading1>
          <Paragraph>
            Nutroos te ofrece planes de nutrición y entrenamiento personalizados,
            seguimiento de progreso y apoyo profesional para alcanzar tus objetivos de salud.
          </Paragraph>
          <ButtonGroup>
            <Button>Comenzar Ahora</Button>
            <Button variant="secondary">Saber Más</Button>
          </ButtonGroup>
        </Content>
        <ImageWrapper>
          <img src="/api/placeholder/500/400" alt="Nutroos App Preview" />
        </ImageWrapper>
      </div>
    </Container>
  </HeroContainer>
);