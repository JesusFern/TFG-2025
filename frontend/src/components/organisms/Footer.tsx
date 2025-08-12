// src/components/organisms/Footer.tsx
import React from 'react';
import styled from 'styled-components';
import { Container } from '../atoms/Container';

const FooterContainer = styled.footer`
  background: #1a1a1a;
  color: #ccc;
  padding: 4rem 0 2rem;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  margin-bottom: 2rem;
`;

const FooterColumn = styled.div``;

const FooterTitle = styled.h4`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
`;

const FooterLink = styled.a`
  display: block;
  color: #aaa;
  margin-bottom: 0.7rem;
  text-decoration: none;
  transition: color 0.3s;
  
  &:hover {
    color: #2ecc71;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #333;
`;

export const Footer: React.FC = () => (
  <FooterContainer id="contact">
    <Container>
      <FooterContent>
        <FooterColumn>
          <FooterTitle>Nutroos</FooterTitle>
          <FooterLink href="#">Sobre Nosotros</FooterLink>
          <FooterLink href="#">Nuestro Equipo</FooterLink>
          <FooterLink href="#">Blog</FooterLink>
          <FooterLink href="#">Testimonios</FooterLink>
        </FooterColumn>
        
        <FooterColumn>
          <FooterTitle>Servicios</FooterTitle>
          <FooterLink href="#">Planes de Nutrición</FooterLink>
          <FooterLink href="#">Entrenamiento Personal</FooterLink>
          <FooterLink href="#">Asesoramiento</FooterLink>
          <FooterLink href="#">Para Profesionales</FooterLink>
        </FooterColumn>
        
        <FooterColumn>
          <FooterTitle>Soporte</FooterTitle>
          <FooterLink href="#">Centro de Ayuda</FooterLink>
          <FooterLink href="#">Contacto</FooterLink>
          <FooterLink href="#">Política de Privacidad</FooterLink>
          <FooterLink href="#">Términos de Uso</FooterLink>
        </FooterColumn>
        
        <FooterColumn>
          <FooterTitle>Contacto</FooterTitle>
          <FooterLink href="mailto:info@nutroos.com">info@nutroos.com</FooterLink>
          <FooterLink href="tel:+34900000000">+34 900 000 000</FooterLink>
          <FooterLink href="#">Redes Sociales</FooterLink>
        </FooterColumn>
      </FooterContent>
      
      <FooterBottom>
        <p>© {new Date().getFullYear()} Nutroos. Todos los derechos reservados.</p>
      </FooterBottom>
    </Container>
  </FooterContainer>
);