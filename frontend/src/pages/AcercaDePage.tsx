import React from 'react';
import styled from 'styled-components';
import { 
  Container, 
  Loader,
  Center,
  Stack,
  useMantineColorScheme
} from '@mantine/core';
import { 
  IconTarget, 
  IconEye,
  IconUsers,
  IconMessages,
  IconChartLine,
  IconStar
} from '@tabler/icons-react';
import Layout from '../components/layout/Layout';
import MarkdownContent from '../components/molecules/MarkdownContent';
import { useMarkdownContent } from '../hooks/useMarkdownContent';

const PageWrapper = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #1d1e30 0%, #263244 100%)' 
    : 'linear-gradient(135deg, #f9fcfa 0%, #e6efe8 100%)'};
  min-height: 100vh;
  padding: 7rem 0 4rem;
`;

const HeroSection = styled.section<{ isDark: boolean }>`
  text-align: center;
  margin-bottom: 5rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: ${props => props.isDark 
      ? 'linear-gradient(90deg, rgba(76, 180, 111, 0.3), rgba(76, 180, 111, 0.8), rgba(76, 180, 111, 0.3))' 
      : 'linear-gradient(90deg, rgba(76, 180, 111, 0.2), var(--app-accent), rgba(76, 180, 111, 0.2))'};
    border-radius: 2px;
  }
`;

const HeroCard = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, rgba(76, 180, 111, 0.08) 0%, rgba(76, 180, 111, 0.12) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(230, 239, 232, 0.95))'};
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2rem;
  border: 1px solid ${props => props.isDark 
    ? 'rgba(76, 180, 111, 0.15)' 
    : 'rgba(76, 180, 111, 0.1)'};
  box-shadow: ${props => props.isDark 
    ? '0 25px 70px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(76, 180, 111, 0.1)' 
    : '0 25px 70px rgba(0, 0, 0, 0.08), 0 10px 30px rgba(76, 180, 111, 0.05)'};
  max-width: 800px;
  margin: 0 auto;
`;

const IconWrapper = styled.div<{ isDark: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, rgba(76, 180, 111, 0.2), rgba(76, 180, 111, 0.3))' 
    : 'linear-gradient(135deg, rgba(76, 180, 111, 0.1), rgba(76, 180, 111, 0.15))'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: ${props => props.isDark 
    ? '0 8px 24px rgba(76, 180, 111, 0.2)' 
    : '0 8px 24px rgba(76, 180, 111, 0.15)'};
  
  svg {
    color: ${props => props.isDark ? '#4CB46F' : 'var(--app-accent)'};
  }
`;

const MisionVisionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, rgba(76, 180, 111, 0.06) 0%, rgba(76, 180, 111, 0.10) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(230, 239, 232, 0.9))'};
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  border: 1px solid ${props => props.isDark 
    ? 'rgba(76, 180, 111, 0.12)' 
    : 'rgba(76, 180, 111, 0.08)'};
  box-shadow: ${props => props.isDark 
    ? '0 15px 40px rgba(0, 0, 0, 0.25)' 
    : '0 15px 40px rgba(0, 0, 0, 0.06)'};
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.isDark 
      ? '0 20px 50px rgba(0, 0, 0, 0.35), 0 5px 20px rgba(76, 180, 111, 0.15)' 
      : '0 20px 50px rgba(0, 0, 0, 0.1), 0 5px 20px rgba(76, 180, 111, 0.1)'};
  }
`;

const FeaturesSection = styled.section`
  margin-bottom: 3rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, rgba(76, 180, 111, 0.05) 0%, rgba(76, 180, 111, 0.08) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(230, 239, 232, 0.85))'};
  backdrop-filter: blur(6px);
  border-radius: 14px;
  padding: 2rem 1.5rem;
  border: 1px solid ${props => props.isDark 
    ? 'rgba(76, 180, 111, 0.1)' 
    : 'rgba(76, 180, 111, 0.06)'};
  box-shadow: ${props => props.isDark 
    ? '0 10px 30px rgba(0, 0, 0, 0.2)' 
    : '0 10px 30px rgba(0, 0, 0, 0.04)'};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.isDark 
      ? '0 15px 40px rgba(0, 0, 0, 0.3)' 
      : '0 15px 40px rgba(0, 0, 0, 0.08)'};
  }
`;

const FeatureIcon = styled.div<{ isDark: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, rgba(76, 180, 111, 0.15), rgba(76, 180, 111, 0.25))' 
    : 'linear-gradient(135deg, rgba(76, 180, 111, 0.08), rgba(76, 180, 111, 0.12))'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: ${props => props.isDark 
    ? '0 4px 16px rgba(76, 180, 111, 0.2)' 
    : '0 4px 16px rgba(76, 180, 111, 0.12)'};
  
  svg {
    color: ${props => props.isDark ? '#4CB46F' : 'var(--app-accent)'};
  }
`;

const FeatureTitle = styled.h3<{ isDark: boolean }>`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: ${props => props.isDark ? '#ffffff' : 'var(--app-text)'};
`;

const FeatureDescription = styled.p<{ isDark: boolean }>`
  font-size: 0.95rem;
  line-height: 1.5;
  color: ${props => props.isDark ? '#c0c0c5' : 'var(--app-text-secondary)'};
  margin: 0;
`;

const AcercaDePage: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const heroContent = useMarkdownContent('/content/acerca-de/hero.md');
  const misionContent = useMarkdownContent('/content/acerca-de/mision.md');
  const visionContent = useMarkdownContent('/content/acerca-de/vision.md');
  const caracteristicasContent = useMarkdownContent('/content/acerca-de/caracteristicas.md');
  const contactoContent = useMarkdownContent('/content/acerca-de/contacto.md');

  const features = [
    { icon: IconUsers, title: 'Planes Personalizados', description: 'Dietas y entrenamientos diseñados para ti' },
    { icon: IconMessages, title: 'Comunicación Directa', description: 'Chat y videollamadas con profesionales' },
    { icon: IconChartLine, title: 'Seguimiento Inteligente', description: 'Visualiza tu evolución en tiempo real' },
    { icon: IconStar, title: 'Flexibilidad Total', description: 'Planes adaptados a tu presupuesto' }
  ];

  // Mostrar loading si algún contenido está cargando
  if (!heroContent || !misionContent || !visionContent || !caracteristicasContent || !contactoContent) {
    return (
      <Layout>
        <PageWrapper isDark={isDark}>
          <Container size="xl">
            <Center style={{ minHeight: '60vh' }}>
              <Stack align="center" gap="md">
                <Loader size="lg" color="nutroos-green" />
              </Stack>
            </Center>
          </Container>
        </PageWrapper>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageWrapper isDark={isDark}>
        <Container size="xl">
          {/* Hero Section */}
          <HeroSection isDark={isDark}>
            <HeroCard isDark={isDark}>
              <IconWrapper isDark={isDark}>
                <IconStar size={36} stroke={2} />
              </IconWrapper>
              <MarkdownContent
                title={heroContent.title}
                content={heroContent.content}
                titleOrder={1}
                textSize="lg"
                textAlign="center"
                titleColor={isDark ? undefined : "nutroos-green.6"}
                textColor="dimmed"
              />
            </HeroCard>
          </HeroSection>

          {/* Misión y Visión */}
          <MisionVisionGrid>
            <Card isDark={isDark}>
              <IconWrapper isDark={isDark}>
                <IconTarget size={32} stroke={2} />
              </IconWrapper>
              <MarkdownContent
                title={misionContent.title}
                content={misionContent.content}
                titleOrder={3}
                textAlign="center"
                textColor="dimmed"
              />
            </Card>
            
            <Card isDark={isDark}>
              <IconWrapper isDark={isDark}>
                <IconEye size={32} stroke={2} />
              </IconWrapper>
              <MarkdownContent
                title={visionContent.title}
                content={visionContent.content}
                titleOrder={3}
                textAlign="center"
                textColor="dimmed"
              />
            </Card>
          </MisionVisionGrid>

          {/* Características */}
          <FeaturesSection>
            <HeroCard isDark={isDark}>
              <MarkdownContent
                title={caracteristicasContent.title}
                content=""
                titleOrder={2}
                textAlign="center"
                titleColor={isDark ? undefined : "nutroos-green.6"}
              />
            </HeroCard>
            
            <FeaturesGrid>
              {features.map((feature, index) => (
                <FeatureCard key={index} isDark={isDark}>
                  <FeatureIcon isDark={isDark}>
                    <feature.icon size={28} stroke={2} />
                  </FeatureIcon>
                  <FeatureTitle isDark={isDark}>{feature.title}</FeatureTitle>
                  <FeatureDescription isDark={isDark}>
                    {feature.description}
                  </FeatureDescription>
                </FeatureCard>
              ))}
            </FeaturesGrid>
          </FeaturesSection>

          {/* Contacto */}
          <HeroCard isDark={isDark} style={{ marginTop: '3rem' }}>
            <MarkdownContent
              title={contactoContent.title}
              content={contactoContent.content}
              titleOrder={2}
              textAlign="center"
              titleColor={isDark ? undefined : "nutroos-green.6"}
              textColor="dimmed"
            />
          </HeroCard>
        </Container>
      </PageWrapper>
    </Layout>
  );
};

export default AcercaDePage;
