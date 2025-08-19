import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Alert,
} from '@mantine/core';
import classes from '../../styles/AuthenticationImage.module.css';

export function AuthenticationImage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLogin = async () => {
    setSubmitError(null);
    if (!email || !password) {
      setSubmitError('Email y contraseña son obligatorios');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || 'Credenciales incorrectas';
        setSubmitError(msg);
        return;
      }
      const storage = remember ? localStorage : sessionStorage;
      if (data?.token) storage.setItem('token', data.token);
      navigate('/');
    } catch (e) {
      setSubmitError('No se pudo conectar con el servidor');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          ¡Bienvenido de nuevo a Nutroos!
        </Title>

        {submitError && (
          <Alert color="red" variant="light" style={{ marginBottom: 12 }}>
            {submitError}
          </Alert>
        )}

        <TextInput
          label="Correo electrónico"
          placeholder="usuario@correo.com"
          size="md"
          radius="md"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <PasswordInput
          label="Contraseña"
          placeholder="Tu contraseña"
          mt="md"
          size="md"
          radius="md"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
        />
        <Checkbox
          label="Mantener sesión iniciada"
          mt="xl"
          size="md"
          checked={remember}
          onChange={(e) => setRemember(e.currentTarget.checked)}
        />
        <Button fullWidth mt="xl" size="md" radius="md" onClick={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
        </Button>

        <Text ta="center" mt="md">
          ¿No tienes cuenta?{' '}
          <Anchor fw={500} onClick={() => navigate('/register')}>
            Regístrate
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}

export default AuthenticationImage;