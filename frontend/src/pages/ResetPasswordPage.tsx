import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  Text,
  PasswordInput,
  Button,
  Stack,
  Alert,
  useMantineTheme,
  Box,
  Loader
} from '@mantine/core';
import {
  IconLock,
  IconCheck,
  IconAlertCircle,
  IconX
} from '@tabler/icons-react';

const ResetPasswordPage: React.FC = () => {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setError('Token no proporcionado');
      setIsVerifying(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/verify-reset-token/${token}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setIsValidToken(true);
      } else {
        setError('El enlace de recuperación es inválido o ha expirado');
      }
    } catch {
      setError('Error al verificar el token');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Error al restablecer la contraseña');
      }
    } catch {
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper p="xl" radius="md" withBorder style={{ width: '100%' }}>
          <Stack gap="lg" align="center">
            <Loader size="lg" color="nutroos-green" />
            <Text c="dimmed">Verificando enlace...</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!isValidToken) {
    return (
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper p="xl" radius="md" withBorder style={{ width: '100%' }}>
          <Stack gap="lg" align="center">
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: theme.colors.red[1],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconX size={40} color={theme.colors.red[7]} />
            </Box>

            <Stack gap="xs" align="center">
              <Title order={2} c={theme.colors.gray[8]}>
                Enlace Inválido
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                El enlace de recuperación es inválido o ha expirado.
              </Text>
            </Stack>

            <Button
              variant="filled"
              color="nutroos-green"
              onClick={() => navigate('/forgot-password')}
              fullWidth
            >
              Solicitar Nuevo Enlace
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

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
                ¡Contraseña Restablecida!
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión...
              </Text>
            </Stack>

            <Loader size="sm" color="nutroos-green" />
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
              Restablecer Contraseña
            </Title>
            <Text size="sm" c="dimmed">
              Ingresa tu nueva contraseña
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

          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Requisitos de seguridad"
            color="blue"
            variant="light"
          >
            <Stack gap={4}>
              <Text size="sm">• La contraseña debe tener al menos 6 caracteres</Text>
              <Text size="sm">• Usa una combinación de letras, números y símbolos</Text>
            </Stack>
          </Alert>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <PasswordInput
                label="Nueva Contraseña"
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftSection={<IconLock size={16} />}
                required
                size="md"
                disabled={isLoading}
                error={newPassword.length > 0 && newPassword.length < 6 ? 'Mínimo 6 caracteres' : null}
              />

              <PasswordInput
                label="Confirmar Contraseña"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftSection={<IconLock size={16} />}
                required
                size="md"
                disabled={isLoading}
                error={
                  confirmPassword.length > 0 && confirmPassword !== newPassword
                    ? 'Las contraseñas no coinciden'
                    : null
                }
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                color="nutroos-green"
                loading={isLoading}
                leftSection={<IconCheck size={16} />}
              >
                Restablecer Contraseña
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;

