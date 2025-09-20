import React from 'react';
import { 
  Box, 
  Group, 
  Burger, 
  Text, 
  Button, 
  Drawer, 
  Avatar, 
  ActionIcon, 
  useMantineColorScheme,
  Tooltip,
  Paper,
  rem,
  Menu,
  Stack,
  Container
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  IconUser, 
  IconLogout, 
  IconSettings,
  IconSun, 
  IconMoon
} from '@tabler/icons-react';
import logo from '../../assets/images/Logo-Nutroos.svg';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const [mobileMenuOpened, { close: closeMobileMenu, toggle: toggleMobileMenu }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const isDark = colorScheme === 'dark';
  
  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogin = () => {
    navigate('/login');
    closeMobileMenu();
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    closeMobileMenu();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    closeMobileMenu();
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
    closeMobileMenu();
  };

  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Acerca de', path: '/acerca-de' },
    { label: 'Profesionales', path: '/profesionales' },
    { label: 'Planes', path: '/planes-suscripcion' },
  ];
  
  return (
    <Paper
      component="header"
      p="md"
      radius={0}
      style={{ zIndex: 1000, position: 'sticky', top: 0 }}
      withBorder
    >
      <Container fluid>
        <Group justify="space-between" wrap="nowrap" style={{ width: '100%' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Group gap="xs">
              <Box pos="relative" style={{ width: 40, height: 40 }}>
                <img 
                  src={logo} 
                  alt="Nutroos" 
                  style={{
                    filter: isDark ? 'brightness(1.5)' : 'none',
                    width: '100%',
                    height: '100%'
                  }}
                />
              </Box>
              <Text 
                fw={700} 
                size="md" 
                style={{ 
                  textTransform: 'uppercase',
                  letterSpacing: '-0.5px',
                  color: isDark ? 'white' : 'black'
                }}
              >
                Nutroos
                {user?.role === 'worker' && (
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
          
          <Group gap="lg" visibleFrom="sm" style={{ marginLeft: 'auto' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{ 
                  textDecoration: 'none', 
                  color: isLinkActive(item.path) 
                    ? 'var(--app-accent)'
                    : isDark ? 'var(--mantine-color-gray-3)' : 'var(--app-text)',
                  fontWeight: isLinkActive(item.path) ? 600 : undefined 
                }}
              >
                <Text>{item.label}</Text>
              </Link>
            ))}
            <Tooltip label={isDark ? 'Modo claro' : 'Modo oscuro'} zIndex={1000}>
              <ActionIcon 
                variant="subtle" 
                onClick={() => toggleColorScheme()}
                aria-label="Toggle color scheme"
                color="nutroos-green"
              >
                {isDark ? <IconSun size={rem(18)} /> : <IconMoon size={rem(18)} />}
              </ActionIcon>
            </Tooltip>
            
            {isAuthenticated && user ? (
              <Menu shadow="md" width={200} withArrow position="bottom-end" zIndex={1000}>
                <Menu.Target>
                  <Avatar
                    src={user.profilePicture}
                    alt={user.fullName}
                    size="md"
                    radius="xl"
                    style={{ cursor: 'pointer' }}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </Avatar>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>
                    <Text size="sm" fw={500}>
                      {user.fullName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'worker' ? user.workerType || 'Trabajador' : 'Usuario'}
                    </Text>
                  </Menu.Label>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconUser size={14} />}
                    onClick={handleDashboardClick}
                  >
                    Dashboard
                  </Menu.Item>

                  {user.role === 'worker' && user.workerType === 'nutricionista' && (
                    <Menu.Item
                      leftSection={<IconUser size={14} />}
                      onClick={() => {
                        navigate('/worker/dashboard-clients');
                        closeMobileMenu();
                      }}
                    >
                      Mis Clientes
                    </Menu.Item>
                  )}

                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    onClick={handleProfileClick}
                  >
                    Mi Perfil
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    onClick={handleLogout}
                    color="red"
                  >
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="sm">
                <Button variant="subtle" onClick={handleLogin}>
                  Iniciar Sesión
                </Button>
                <Button color="nutroos-green" onClick={() => navigate('/register')}>
                  Registrarse
                </Button>
              </Group>
            )}
          </Group>
          
          <Burger opened={mobileMenuOpened} onClick={toggleMobileMenu} hiddenFrom="sm" />
        </Group>
      </Container>
      
      <Drawer
        opened={mobileMenuOpened}
        onClose={closeMobileMenu}
        size="xs"
        padding="md"
        title={
          <Group>
            <img 
              src={logo} 
              alt="Nutroos" 
              width={30} 
              height={30} 
              style={{ filter: isDark ? 'brightness(1.5)' : 'none' }}
            />
            <Text fw={700}>NUTROOS</Text>
          </Group>
        }
      >
        <Stack>
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isLinkActive(item.path) ? "light" : "subtle"}
              component={Link}
              to={item.path}
              onClick={closeMobileMenu}
              fullWidth
              color={isLinkActive(item.path) ? "nutroos-green" : "gray"}
            >
              {item.label}
            </Button>
          ))}
          
          {isAuthenticated && user ? (
            <Stack>
              <Text size="sm" fw={500} c="dimmed">
                {user.fullName}
              </Text>
              <Button
                variant="light"
                leftSection={<IconUser size={16} />}
                onClick={handleDashboardClick}
                fullWidth
                color="nutroos-green"
              >
                Dashboard
              </Button>
              
              {user.role === 'worker' && user.workerType === 'nutricionista' && (
                <Button
                  variant="light"
                  leftSection={<IconUser size={16} />}
                  onClick={() => {
                    navigate('/worker/dashboard-clients');
                    closeMobileMenu();
                  }}
                  fullWidth
                  color="nutroos-green"
                >
                  Mis Clientes
                </Button>
              )}
              
              <Button
                variant="light"
                leftSection={<IconSettings size={16} />}
                onClick={handleProfileClick}
                fullWidth
              >
                Mi Perfil
              </Button>
              <Button
                variant="light"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
                color="red"
                fullWidth
              >
                Cerrar Sesión
              </Button>
            </Stack>
          ) : (
            <Group gap="sm">
              <Button variant="light" onClick={handleLogin} fullWidth>
                Iniciar Sesión
              </Button>
              <Button color="nutroos-green" onClick={() => navigate('/register')} fullWidth>
                Registrarse
              </Button>
            </Group>
          )}
        </Stack>
      </Drawer>
    </Paper>
  );
};

export default Header;