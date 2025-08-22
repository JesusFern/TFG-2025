import React from 'react';
import styled from 'styled-components';
import { FAQItem } from '../molecules/FAQItem';
import { Heading2 } from '../atoms/Typography';
import { Container, Section } from '../atoms/Container';
import { useMantineColorScheme } from '@mantine/core';

const FAQSection = styled(Section)<{ isDark: boolean }>`
  background-color: ${props => props.isDark ? '#222436' : '#f0f5f2'};
  padding: 5rem 0;
`;

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
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

export const FAQ: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const faqs = [
    {
      question: "¿Qué es Nutroos?",
      answer: "Nutroos es una aplicación completa para la gestión de dietas y entrenamientos personalizados. Te permite acceder a planes de nutrición y ejercicio adaptados a tus necesidades, realizar un seguimiento de tu progreso y gestionar toda tu información de salud en un solo lugar."
    },
    {
      question: "¿Cómo puedo comenzar con Nutroos?",
      answer: "Para comenzar, simplemente crea una cuenta, completa tu perfil de salud y elige el plan que mejor se adapte a tus objetivos. Uno de nuestros entrenadores te será asignado para personalizar tu experiencia según tus necesidades específicas."
    },
    {
      question: "¿Puedo personalizar mis planes de nutrición y entrenamiento?",
      answer: "¡Absolutamente! Nutroos está diseñado para adaptarse a tus necesidades específicas. Trabajarás con entrenadores profesionales que ajustarán tus planes según tus objetivos, restricciones dietéticas y preferencias personales."
    },
    {
      question: "¿Qué tipo de soporte ofrece Nutroos?",
      answer: "Ofrecemos soporte completo a través de videollamadas con tus entrenadores, mensajería directa, informes automáticos de progreso y un sistema de tickets para resolver cualquier incidencia que puedas tener."
    },
    {
      question: "¿Cómo funciona el sistema de gamificación?",
      answer: "Nuestro sistema de gamificación te recompensa por cumplir tus objetivos y mantener la consistencia. Ganarás puntos, insignias y podrás competir en clasificaciones amistosas con otros usuarios para mantenerte motivado en tu camino hacia una vida más saludable."
    }
  ];

  return (
    <FAQSection id="faq" isDark={isDark}>
      <Container>
        <SectionTitle isDark={isDark}>Preguntas <span>Frecuentes</span></SectionTitle>
        <FAQContainer>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isDark={isDark}
            />
          ))}
        </FAQContainer>
      </Container>
    </FAQSection>
  );
};