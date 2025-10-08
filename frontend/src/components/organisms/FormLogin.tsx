import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Text,
  Anchor,
  Stack,
  Alert
} from '@mantine/core';
import { IconAlertCircle, IconShield } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/AuthenticationImage.module.css';

export default function AuthenticationImage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('¡Inicio de sesión exitoso!');
        
        // Guardar en el contexto de autenticación
        login(data.token, data.user);
        
        // Redirigir al dashboard con recarga completa para reiniciar la aplicación con el nuevo contexto
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={styles.title}>
        ¡Bienvenido de vuelta!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        ¿No tienes una cuenta?{' '}
        <Anchor size="sm" onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
          Regístrate aquí
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack>
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              variant="light"
              withCloseButton
              onClose={handleCloseError}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              icon={<IconShield size={16} />}
              title="Éxito"
              color="green"
              variant="light"
              withCloseButton
              onClose={handleCloseSuccess}
            >
              {success}
            </Alert>
          )}

          <TextInput
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            onKeyDown={handleKeyDown}
          />

          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            onKeyDown={handleKeyDown}
          />

          <Text size="sm" ta="right">
            <Anchor size="sm" onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer' }}>
              ¿Olvidaste tu contraseña?
            </Anchor>
          </Text>

          <Button
            fullWidth
            mt="xl"
            onClick={handleLogin}
            loading={isLoading}
            color="nutroos-green"
            leftSection={!isLoading && <IconShield size={16} />}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}