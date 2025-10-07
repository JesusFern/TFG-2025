import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Alert,
  Anchor,
  useMantineTheme,
  Box
} from '@mantine/core';
import {
  IconMail,
  IconArrowLeft,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';

const ForgotPasswordPage: React.FC = () => {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:5000/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Error al solicitar la recuperación de contraseña');
      }
    } catch {
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper p="xl" radius="md" withBorder style={{ width: '100%' }}>
          <Stack gap="lg" align="center">
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: theme.colors.green[1],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconCheck size={40} color={theme.colors.green[7]} />
            </Box>

            <Stack gap="xs" align="center">
              <Title order={2} c={theme.colors.gray[8]}>
                ¡Email Enviado!
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Si el email <strong>{email}</strong> está registrado en nuestro sistema, recibirás un correo con las instrucciones para recuperar tu contraseña.
              </Text>
            </Stack>

            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Revisa tu bandeja de entrada"
              color="blue"
              variant="light"
            >
              <Text size="sm">
                El correo puede tardar unos minutos en llegar. No olvides revisar tu carpeta de spam.
              </Text>
            </Alert>

            <Button
              variant="light"
              color="nutroos-green"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/login')}
              fullWidth
            >
              Volver al Inicio de Sesión
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper p="xl" radius="md" withBorder style={{ width: '100%' }}>
        <Stack gap="lg">
          <Stack gap="xs">
            <Title order={2} c={theme.colors.gray[8]}>
              ¿Olvidaste tu contraseña?
            </Title>
            <Text size="sm" c="dimmed">
              No te preocupes, te enviaremos las instrucciones para recuperarla.
            </Text>
          </Stack>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              variant="light"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftSection={<IconMail size={16} />}
                required
                size="md"
                disabled={isLoading}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                color="nutroos-green"
                loading={isLoading}
              >
                Enviar Instrucciones
              </Button>
            </Stack>
          </form>

          <Stack gap="xs" align="center">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              size="sm"
              onClick={() => navigate('/login')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconArrowLeft size={14} />
              Volver al inicio de sesión
            </Anchor>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;

