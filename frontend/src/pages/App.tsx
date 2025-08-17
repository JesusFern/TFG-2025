import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Button, 
  Image, 
  Center,
  Stack
} from '@mantine/core';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import '../styles/App.css';

function App() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/landingPage');
  };

  const goToCreateDiet = () => {
    navigate('/crear-dieta');
  };

  return (
    <Container size="md" py="xl">
      <Center mb="md">
        <Group gap="xl">
          <Image src={viteLogo} w={80} alt="Vite logo" />
          <Image src={reactLogo} w={80} alt="React logo" className="logo react" />
        </Group>
      </Center>
      
      <Title order={1} ta="center" mb="xl">Vite + React + Mantine</Title>
      
      <Text ta="center" c="dimmed" mb="xl">
        Este proyecto está configurado con Vite, React y Mantine para una experiencia de desarrollo moderna.
      </Text>
      
      <Center>
        <Stack gap="md">
          <Button onClick={goToLogin} size="md">
            Iniciar Sesión
          </Button>
          
          <Button onClick={goToCreateDiet} variant="outline" size="md">
            Crear Nueva Dieta
          </Button>
        </Stack>
      </Center>
      
      <Text ta="center" c="dimmed" size="sm" mt="xl">
        Haz clic en los logos de Vite y React para aprender más
      </Text>
    </Container>
  );
}

export default App;