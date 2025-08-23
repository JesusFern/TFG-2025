import React, { useState } from 'react';
import { 
  Box, 
  Group, 
  Burger, 
  Drawer, 
  NavLink, 
  Avatar, 
  Text, 
  ActionIcon, 
  useMantineColorScheme,
  Image,
  Button
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IconHome, 
  IconUser, 
  IconLogout, 
  IconSettings,
  IconSun, 
  IconMoonStars
} from '@tabler/icons-react';
import { logout } from '../../services/authService';
import nutroosLogoPng from '../../assets/images/LogoNutroos.png';

const Header: React.FC = () => {
  const [opened, setOpened] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const isDark = colorScheme === 'dark';
  
  // Obtener datos del usuario desde localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isUserLoggedIn = Boolean(localStorage.getItem('authToken'));
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpened(false);
  };
  
  const userRole = userData.role || '';
  const isWorker = userRole === 'worker' || userRole === 'admin';
  
  return (
    <Box
      component="header"
      p="md"
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: `1px solid var(--mantine-color-default-border)`,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Group justify="space-between">
        <Group>
          {isUserLoggedIn && (
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              hiddenFrom="md"
            />
          )}
          
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Group gap="xs">
              <Box 
                style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%',
                  backgroundColor: '#f5f2e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <Image 
                  src={nutroosLogoPng}
                  alt="Nutroos"
                  width={28}
                  height={28}
                />
              </Box>
              <Text 
                fw={700} 
                size="md" 
                style={{ 
                  textTransform: 'uppercase',
                  letterSpacing: '-0.5px',
                  color: isDark ? 'white' : 'inherit'
                }}
              >
                Nutroos
                {isWorker && (
                  <Text 
                    component="span" 
                    c="nutroos-green.6" 
                    fw={700} 
                    ml={5}
                  >
                    Pro
                  </Text>
                )}
              </Text>
            </Group>
          </Link>
        </Group>

        <Group>
          {/* Botón de logout visible */}
          {isUserLoggedIn && (
            <Button
              variant="outline"
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
              size="xs"
              visibleFrom="sm"
            >
              Cerrar sesión
            </Button>
          )}
          
          <ActionIcon
            variant="outline"
            color={isDark ? 'yellow' : 'blue'}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
          >
            {isDark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
          </ActionIcon>
          
          {isUserLoggedIn && (
            <Group visibleFrom="md">
              <Box style={{ textAlign: 'right' }}>
                <Text size="sm" fw={500} lineClamp={1} style={{ maxWidth: '150px' }}>
                  {userData.fullName || 'Usuario'}
                </Text>
                <Text size="xs" c="dimmed">
                  {isWorker ? (userData.workerType || 'Profesional') : 'Cliente'}
                </Text>
              </Box>
              <Avatar 
                src={userData.profilePicture} 
                alt={userData.fullName} 
                radius="xl" 
                color="nutroos-green"
                onClick={() => navigate('/profile')}
                style={{ cursor: 'pointer' }}
              >
                {userData.fullName ? userData.fullName.charAt(0) : '?'}
              </Avatar>
            </Group>
          )}
        </Group>
      </Group>

      {isUserLoggedIn && (
        <Drawer
          opened={opened}
          onClose={() => setOpened(false)}
          title={
            <Group>
              <Avatar 
                src={userData.profilePicture} 
                radius="xl" 
                color="nutroos-green"
              >
                {userData.fullName ? userData.fullName.charAt(0) : '?'}
              </Avatar>
              <Box>
                <Text fw={500}>{userData.fullName}</Text>
                <Text size="xs" c="dimmed">{isWorker ? 'Profesional' : 'Cliente'}</Text>
              </Box>
            </Group>
          }
          padding="md"
          size="xs"
        >
          <Box mt="md">
            <NavLink
              label="Inicio"
              leftSection={<IconHome size={16} />}
              component={Link}
              to="/"
              active
              onClick={() => setOpened(false)}
            />
            
            <NavLink
              label="Mi Perfil"
              leftSection={<IconUser size={16} />}
              component={Link}
              to="/profile"
              onClick={() => setOpened(false)}
            />
            
            <NavLink
              label="Configuración"
              leftSection={<IconSettings size={16} />}
              component={Link}
              to="/settings"
              onClick={() => setOpened(false)}
            />
            
            <NavLink
              label="Cerrar Sesión"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
              color="red"
            />
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Header;