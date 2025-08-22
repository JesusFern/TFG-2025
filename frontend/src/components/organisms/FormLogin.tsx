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
  LoadingOverlay,
  Box,
} from '@mantine/core';
import classes from '../../styles/AuthenticationImage.module.css';
import GlobalErrorOverlay from '../atoms/GlobalErrorOverlay';
import GlobalSuccessOverlay from '../atoms/GlobalSuccessOverlay';
import { apiRequest } from '../../services/api';
import { IconAt, IconLock } from '@tabler/icons-react';

export function AuthenticationImage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleLogin = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    
    if (!email || !password) {
      setSubmitError('Email y contraseña son obligatorios');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const msg = data?.message || 'Credenciales incorrectas';
        setSubmitError(msg);
        return;
      }
      
      // Login exitoso
      setSubmitSuccess('¡Inicio de sesión exitoso! Redirigiendo en unos segundos...');
      
      const storage = remember ? localStorage : sessionStorage;
      if (data?.token) {
        storage.setItem('token', data.token);
      }
      
      // Mantener el loader visible durante el mensaje de éxito y la redirección
      setTimeout(() => {
        setIsSubmitting(false); // Ocultar el loader
        navigate('/');
      }, 1500);
      
    } catch (e) {
      setSubmitError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      console.error('Error en login:', e);
      setIsSubmitting(false); // Solo ocultar el loader en caso de error
    }
  };

  const handleCloseError = () => {
    setSubmitError(null);
  };

  const handleCloseSuccess = () => {
    setSubmitSuccess(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleLogin();
    }
  };

  const iconEmail = <IconAt size={16} />;
  const iconLock = <IconLock size={16} />;
  
  return (
    <div className={classes.wrapper}>
      <Box pos="relative">
        <LoadingOverlay 
          visible={isSubmitting} 
          zIndex={1000} 
          overlayProps={{ radius: "sm", blur: 2 }} 
        />
        <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          ¡Bienvenido de nuevo a Nutroos!
        </Title>

        <GlobalErrorOverlay 
          message={submitError}
          onClose={handleCloseError}
          title="Error en el inicio de sesión"
        />

        <GlobalSuccessOverlay 
          message={submitSuccess}
          onClose={handleCloseSuccess}
          title="¡Bienvenido!"
        />

        <TextInput
          leftSectionPointerEvents="none"
          leftSection={iconEmail}
          label="Correo electrónico"
          placeholder="usuario@correo.com"
          size="md"
          radius="md"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          required
        />
        
        <PasswordInput
          label="Contraseña"
          leftSectionPointerEvents="none"
          leftSection={iconLock}
          placeholder="Tu contraseña"
          mt="md"
          size="md"
          radius="md"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          required
        />
        
        <Checkbox
          label="Mantener sesión iniciada"
          mt="xl"
          size="md"
          checked={remember}
          onChange={(e) => setRemember(e.currentTarget.checked)}
          disabled={isSubmitting}
        />
        
        <Button 
          fullWidth 
          mt="xl" 
          size="md" 
          radius="md" 
          onClick={handleLogin} 
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
        </Button>

        <Text ta="center" mt="md">
          ¿No tienes cuenta?{' '}
          <Anchor fw={500} onClick={() => navigate('/register')}>
            Regístrate
          </Anchor>
        </Text>
      </Paper>
    </Box>
    </div>
  );
}

export default AuthenticationImage;