import { useNavigate } from 'react-router-dom';
import { 
  Title, 
  Text, 
  Group, 
  Button, 
  Image, 
  Stack,
  Paper,
  Box,
  useMantineColorScheme
} from '@mantine/core';
import logo from '../assets/images/Logo-Nutroos.svg';

function App() {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const goToLogin = () => {
    navigate('/login');
  };

  const goToLandingPage = () => {
    navigate('/landingPage');
  };

  return (
    <Stack align="center" justify="center" py="xl" gap="xl">
      <Box pos="relative" style={{ width: 150, height: 150 }}>
        <Image 
          src={logo} 
          alt="Nutroos logo" 
          fit="contain"
          style={{
            filter: isDark ? 'brightness(1.5)' : 'none',
            width: '100%',
            height: '100%'
          }}
        />
      </Box>
      
      <Title order={1} ta="center" c={isDark ? "gray.0" : "gray.8"}>
        Bienvenido a Nutroos
      </Title>
      
      <Text ta="center" c="dimmed" size="lg" style={{ maxWidth: 600 }}>
        Tu plataforma de gestión nutricional profesional.
        Planifica, monitorea y gestiona dietas de manera eficiente.
      </Text>
      
      <Group mt="xl">
        <Button size="lg" onClick={goToLogin} color="nutroos-green">
          Iniciar Sesión
        </Button>
        <Button 
          size="lg" 
          variant={isDark ? "outline" : "light"} 
          onClick={goToLandingPage} 
          color="nutroos-green"
        >
          Conocer más
        </Button>
      </Group>
      
      <Paper 
        p="xl" 
        mt="xl" 
        radius="md" 
        withBorder
        style={{ 
          backgroundColor: 'var(--app-paper-bg)',
          borderColor: 'var(--app-border-color)'
        }}
      >
        <Title order={3} mb="md" c={isDark ? "gray.0" : "gray.8"}>Características principales</Title>
        
        <Stack>
          <Text c="var(--app-text)">✓ Creación de dietas personalizadas</Text>
          <Text c="var(--app-text)">✓ Seguimiento de progreso de clientes</Text>
          <Text c="var(--app-text)">✓ Gestión eficiente de pacientes</Text>
          <Text c="var(--app-text)">✓ Informes detallados y estadísticas</Text>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default App;