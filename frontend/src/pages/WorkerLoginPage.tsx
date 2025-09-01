import React, { useState } from 'react';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper, 
  Title, 
  Group, 
  Anchor, 
  Divider, 
  Text, 
  Alert, 
  Box,
  Image,
  Stack
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconLock, IconMail, IconLeaf, IconWeight } from '@tabler/icons-react';
import { login } from '../services/authService';
import axios from 'axios';
import { motion } from 'framer-motion';
import nutroosLogoPng from '../assets/images/LogoNutroos.png';

interface WorkerLoginFormValues {
  email: string;
  password: string;
}

const WorkerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WorkerLoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Correo electrónico inválido';
      },
      password: (value: string) => (value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null),
    },
  });

  const handleSubmit = async (values: WorkerLoginFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await login({
        email: values.email,
        password: values.password
      });
      
      if (!response.user) {
        try {
          const userResponse = await axios.get('/api/users/me', {
            headers: {
              Authorization: `Bearer ${response.token}`
            }
          });
          
          if (userResponse.data) {
            if (userResponse.data.role !== 'worker' && userResponse.data.role !== 'admin') {
              setError('Esta cuenta no tiene permisos de trabajador');
              return;
            }
            
            // Guardar token y datos de usuario en localStorage
            localStorage.setItem('userData', JSON.stringify(userResponse.data));
            
            navigate('/worker/dashboard');
          } else {
            setError('No se pudieron obtener los datos del usuario');
          }
        } catch (userError) {
          setError('Error al obtener información del usuario');
          console.error('Error fetching user data:', userError);
        }
      } else {
        if (response.user.role !== 'worker' && response.user.role !== 'admin') {
          setError('Esta cuenta no tiene permisos de trabajador');
          return;
        }
        
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        navigate('/worker/dashboard');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      } else {
        setError('Error desconocido al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderDecorations = () => (
    <>
      <Box 
        style={{ 
          position: 'absolute', 
          top: '3rem', 
          left: '3rem', 
          opacity: 0.07,
          zIndex: 0
        }}
      >
        <IconLeaf size={100} stroke={1.5} color="#38b87c" />
      </Box>
      
      <Box 
        style={{ 
          position: 'absolute', 
          bottom: '3rem', 
          right: '3rem', 
          opacity: 0.07,
          zIndex: 0
        }}
      >
        <IconWeight size={100} stroke={1.5} color="#38b87c" />
      </Box>
      
      <Box 
        style={{ 
          position: 'absolute',
          top: '30%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 184, 124, 0.05) 0%, rgba(56, 184, 124, 0) 70%)',
          zIndex: 0
        }} 
      />
      <Box 
        style={{ 
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 184, 124, 0.03) 0%, rgba(56, 184, 124, 0) 70%)',
          zIndex: 0
        }} 
      />
    </>
  );

  const LogoContainer = () => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
    >
      <Box
        style={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          backgroundColor: '#f5f2e9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        <Image 
          src={nutroosLogoPng}
          alt="Nutroos Logo"
          width={120}
          style={{ objectFit: 'contain' }}
        />
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), transparent 60%)',
            pointerEvents: 'none'
          }}
        />
      </Box>
    </motion.div>
  );

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1b25',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {renderDecorations()}
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ zIndex: 1, width: '100%', maxWidth: '400px' }}
      >
        <Stack align="center" mb={20}>
          <LogoContainer />
        </Stack>

        <Paper
          radius="md"
          p="xl"
          withBorder
          shadow="md"
          style={{
            backgroundColor: 'rgba(33, 34, 52, 0.95)',
            borderColor: '#2c2e3f',
            backdropFilter: 'blur(12px)',
            position: 'relative'
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Title order={2} ta="center" mb="lg" c="#38b87c" size="h3">
              Acceso para Profesionales
            </Title>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="Error de autenticación" 
                  color="red" 
                  mb="md"
                  variant="filled"
                  withCloseButton
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Correo electrónico"
                placeholder="tu@email.com"
                required
                leftSection={<IconMail size={16} color="#38b87c" />}
                styles={() => ({
                  input: {
                    '&:focus': {
                      borderColor: '#38b87c',
                    },
                  },
                })}
                {...form.getInputProps('email')}
                mb="md"
              />

              <PasswordInput
                label="Contraseña"
                placeholder="Tu contraseña"
                required
                leftSection={<IconLock size={16} color="#38b87c" />}
                styles={() => ({
                  input: {
                    '&:focus': {
                      borderColor: '#38b87c',
                    },
                  },
                })}
                {...form.getInputProps('password')}
                mb="xl"
              />

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  fullWidth 
                  type="submit" 
                  style={{
                    backgroundColor: '#38b87c',
                    transition: 'all 0.3s ease',
                  }}
                  loading={loading}
                >
                  Iniciar sesión como profesional
                </Button>
              </motion.div>

              <Divider 
                label="O" 
                labelPosition="center" 
                my="lg"
                styles={{
                  label: {
                    color: '#8c8fa3',
                    backgroundColor: 'rgba(33, 34, 52, 0.95)',
                  }
                }}
              />

              <Group justify="center">
                <Text size="sm" c="#8c8fa3">
                  ¿Eres cliente?
                </Text>
                <Anchor 
                  component={Link} 
                  to="/login" 
                  size="sm" 
                  c="#38b87c"
                  style={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      textDecoration: 'none',
                      color: '#2ca36b'
                    }
                  }}
                >
                  Acceso para clientes
                </Anchor>
              </Group>
            </form>
          </motion.div>
        </Paper>

        <Text c="#8c8fa3" size="xs" ta="center" mt="lg" style={{ opacity: 0.8 }}>
          © {new Date().getFullYear()} Nutroos. Todos los derechos reservados.
        </Text>
      </motion.div>
    </Box>
  );
};

export default WorkerLoginPage;