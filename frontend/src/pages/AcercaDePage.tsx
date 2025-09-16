import React from 'react';
import { 
  Container, 
  Text, 
  Stack, 
  Paper,
  Avatar,
  Grid,
  Card,
  ThemeIcon,
  Loader,
  Center
} from '@mantine/core';
import { 
  IconHeart, 
  IconTarget, 
  IconChefHat
} from '@tabler/icons-react';
import Layout from '../components/layout/Layout';
import MarkdownContent from '../components/molecules/MarkdownContent';
import { useMarkdownContent } from '../hooks/useMarkdownContent';

const AcercaDePage: React.FC = () => {
  const heroContent = useMarkdownContent('/content/acerca-de/hero.md');
  const misionContent = useMarkdownContent('/content/acerca-de/mision.md');
  const visionContent = useMarkdownContent('/content/acerca-de/vision.md');
  const caracteristicasContent = useMarkdownContent('/content/acerca-de/caracteristicas.md');
  const contactoContent = useMarkdownContent('/content/acerca-de/contacto.md');

  // Mostrar loading si algún contenido está cargando
  if (!heroContent || !misionContent || !visionContent || !caracteristicasContent || !contactoContent) {
    return (
      <Layout>
        <Container size="xl" py="xl">
          <Center style={{ height: '50vh' }}>
            <Stack align="center" gap="md">
              <Loader size="lg" color="nutroos-green" />
              <Text>Cargando contenido...</Text>
            </Stack>
          </Center>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Hero Section */}
          <Paper 
            p="xl" 
            radius="md" 
            withBorder
            style={{ 
              backgroundColor: 'var(--app-paper-bg)', 
              borderColor: 'var(--app-border-color)' 
            }}
          >
            <Stack align="center" gap="lg">
              <Avatar 
                size="xl" 
                color="nutroos-green" 
                radius="xl"
              >
                <IconChefHat size="2rem" />
              </Avatar>
              
              <MarkdownContent
                title={heroContent.title}
                content={heroContent.content}
                titleOrder={1}
                textSize="lg"
                textAlign="center"
                titleColor="nutroos-green.6"
                textColor="dimmed"
              />
            </Stack>
          </Paper>

          {/* Misión y Visión */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card 
                p="xl" 
                radius="md" 
                withBorder
                style={{ 
                  backgroundColor: 'var(--app-paper-bg)', 
                  borderColor: 'var(--app-border-color)' 
                }}
              >
                <Stack align="center" gap="md">
                  <ThemeIcon color="nutroos-green" size="xl" radius="xl">
                    <IconTarget size="2rem" />
                  </ThemeIcon>
                  <MarkdownContent
                    title={misionContent.title}
                    content={misionContent.content}
                    titleOrder={3}
                    textAlign="center"
                    textColor="dimmed"
                  />
                </Stack>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card 
                p="xl" 
                radius="md" 
                withBorder
                style={{ 
                  backgroundColor: 'var(--app-paper-bg)', 
                  borderColor: 'var(--app-border-color)' 
                }}
              >
                <Stack align="center" gap="md">
                  <ThemeIcon color="nutroos-green" size="xl" radius="xl">
                    <IconHeart size="2rem" />
                  </ThemeIcon>
                  <MarkdownContent
                    title={visionContent.title}
                    content={visionContent.content}
                    titleOrder={3}
                    textAlign="center"
                    textColor="dimmed"
                  />
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Características */}
          <Paper 
            p="xl" 
            radius="md" 
            withBorder
            style={{ 
              backgroundColor: 'var(--app-paper-bg)', 
              borderColor: 'var(--app-border-color)' 
            }}
          >
            <MarkdownContent
              title={caracteristicasContent.title}
              content={caracteristicasContent.content}
              titleOrder={2}
              textAlign="center"
              titleColor="nutroos-green.6"
              textColor="dimmed"
            />
          </Paper>

          {/* Contacto */}
          <Paper 
            p="xl" 
            radius="md" 
            withBorder
            style={{ 
              backgroundColor: 'var(--app-paper-bg)', 
              borderColor: 'var(--app-border-color)' 
            }}
          >
            <Stack align="center" gap="md">
              <MarkdownContent
                title={contactoContent.title}
                content={contactoContent.content}
                titleOrder={2}
                textAlign="center"
                titleColor="nutroos-green.6"
                textColor="dimmed"
              />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Layout>
  );
};

export default AcercaDePage;
