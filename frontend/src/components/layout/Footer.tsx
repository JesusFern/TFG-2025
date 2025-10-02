import { 
  Container, 
  Group, 
  Text, 
  Anchor, 
  Image,
  Stack,
  Divider,
  ActionIcon,
  Paper,
  useMantineColorScheme,
  Box
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';
import logo from '../../assets/images/Logo-Nutroos.svg';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Paper 
      component="footer" 
      p="md" 
      mt="xl" 
      radius={0}
      style={{
        backgroundColor: isDark ? '#1A1B1E' : '#f8f9fa',
        borderTop: `1px solid ${isDark ? '#2C2E33' : '#e9ecef'}`
      }}
    >
      <Container size="xl">
        <Stack>
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Group gap="xs">
                <Box pos="relative" style={{ width: 30, height: 30 }}>
                  <Image 
                    src={logo} 
                    alt="Nutroos" 
                    fit="contain"
                    style={{
                      filter: isDark ? 'brightness(1.5)' : 'none',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </Box>
                <Text fw={700} size="lg">NUTROOS</Text>
              </Group>
              <Text size="sm" c="dimmed" maw={400}>
                Soluciones nutricionales personalizadas para profesionales y clientes.
                Planifica, monitorea y gestiona dietas de manera eficiente.
              </Text>
            </Stack>
            
            <Group gap={50} align="flex-start" visibleFrom="sm">
              <Stack gap="xs">
                <Text fw={500}>Enlaces</Text>
                <Stack gap="xs">
                  <Anchor component={Link} to="/" size="sm" c={isDark ? "blue.3" : "blue.7"}>Inicio</Anchor>
                  <Anchor component={Link} to="/clientes" size="sm" c={isDark ? "blue.3" : "blue.7"}>Clientes</Anchor>
                  <Anchor component={Link} to="/dietas" size="sm" c={isDark ? "blue.3" : "blue.7"}>Dietas</Anchor>
                </Stack>
              </Stack>
              
              <Stack gap="xs">
                <Text fw={500}>Información</Text>
                <Stack gap="xs">
                  <Anchor component={Link} to="/acerca" size="sm" c={isDark ? "blue.3" : "blue.7"}>Acerca de</Anchor>
                  <Anchor component={Link} to="/privacidad" size="sm" c={isDark ? "blue.3" : "blue.7"}>Privacidad</Anchor>
                  <Anchor component={Link} to="/terminos" size="sm" c={isDark ? "blue.3" : "blue.7"}>Términos</Anchor>
                </Stack>
              </Stack>
            </Group>
            
            <Group gap={50} align="flex-start" visibleFrom="sm">
              <Stack gap="xs">
                <Text fw={500}>Síguenos</Text>
                <Group gap="xs">
                  <ActionIcon size="lg" variant="subtle" color={isDark ? "blue.4" : "blue.6"}>
                    <IconBrandTwitter size="1.2rem" />
                  </ActionIcon>
                  <ActionIcon size="lg" variant="subtle" color={isDark ? "blue.4" : "blue.6"}>
                    <IconBrandInstagram size="1.2rem" />
                  </ActionIcon>
                  <ActionIcon size="lg" variant="subtle" color={isDark ? "blue.4" : "blue.6"}>
                    <IconBrandYoutube size="1.2rem" />
                  </ActionIcon>
                </Group>
              </Stack>
              
              <Stack gap="xs">
                <Text fw={500}>Soporte</Text>
                <Text size="sm" c="dimmed">
                  ¿Tienes algún problema con la página?
                </Text>
                <Anchor 
                  component={Link} 
                  to="/incidencias/crear" 
                  size="sm" 
                  c={isDark ? "blue.3" : "blue.7"}
                  fw={500}
                >
                  Crea una incidencia
                </Anchor>
              </Stack>
            </Group>
          </Group>
          
          <Divider my="sm" color={isDark ? "dark.4" : "gray.3"} />
          
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              © {currentYear} Nutroos. Todos los derechos reservados.
            </Text>
            <Group gap="xs" wrap="nowrap">
              <Anchor component={Link} to="/privacidad" size="xs" c="dimmed">Política de privacidad</Anchor>
              <Text size="xs" c="dimmed">•</Text>
              <Anchor component={Link} to="/terminos" size="xs" c="dimmed">Términos de servicio</Anchor>
            </Group>
          </Group>
        </Stack>
      </Container>
    </Paper>
  );
};

export default Footer;