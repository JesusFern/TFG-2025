import { 
  Container, 
  Group, 
  Burger, 
  Image, 
  Text, 
  Button, 
  Drawer, 
  Stack,
  ActionIcon,
  useMantineColorScheme,
  Tooltip,
  Box,
  Paper,
  rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IconSun, IconMoon } from '@tabler/icons-react';
import logo from '../../assets/images/Logo-Nutroos.svg';

const Header: React.FC = () => {
  const [mobileMenuOpened, { toggle: toggleMobileMenu, close: closeMobileMenu }] = useDisclosure(false);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = colorScheme === 'dark';
  
  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };
  
  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogin = () => {
    navigate('/login');
  };

  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Acerca de', path: '/acerca' },
  ];
  
  return (
    <Paper 
      shadow="sm" 
      p="md" 
      radius={0}
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        backgroundColor: 'var(--app-header-bg)',
        borderBottom: '1px solid var(--app-border-color)'
      }}
    >
      <Container size="xl">
        <Group justify="space-between">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Group gap="xs">
              <Box pos="relative" style={{ width: 40, height: 40 }}>
                <Image 
                  src={logo} 
                  alt="Nutroos" 
                  fit="contain"
                  style={{
                    filter: isDark ? 'brightness(1.5)' : 'none',
                    width: '100%',
                    height: '100%'
                  }}
                />
              </Box>
              <Text fw={700} size="xl" c={isDark ? "gray.1" : "gray.8"}>
                NUTROOS
              </Text>
            </Group>
          </Link>
          
          {/* Desktop Navigation */}
          <Group gap="lg" visibleFrom="sm">
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
            <Tooltip label={isDark ? 'Modo claro' : 'Modo oscuro'}>
              <ActionIcon 
                variant="subtle" 
                onClick={toggleColorScheme}
                aria-label="Toggle color scheme"
                color="nutroos-green"
              >
                {isDark ? <IconSun size={rem(18)} /> : <IconMoon size={rem(18)} />}
              </ActionIcon>
            </Tooltip>
            
            <Button onClick={handleLogin} color="nutroos-green">Iniciar sesión</Button>
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
            <Image 
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
              color="nutroos-green"
              onClick={() => {
                navigate(item.path);
                closeMobileMenu();
              }}
              fullWidth
            >
              {item.label}
            </Button>
          ))}
          
          <Box my="xs">
            <Group justify="space-between">
              <Text size="sm">Cambiar tema</Text>
              <ActionIcon 
                variant="subtle" 
                onClick={toggleColorScheme}
                aria-label="Toggle color scheme"
                color="nutroos-green"
              >
                {isDark ? <IconSun size={rem(18)} /> : <IconMoon size={rem(18)} />}
              </ActionIcon>
            </Group>
          </Box>
          
          <Button 
            onClick={() => {
              handleLogin();
              closeMobileMenu();
            }}
            color="nutroos-green"
          >
            Iniciar sesión
          </Button>
        </Stack>
      </Drawer>
    </Paper>
  );
};

export default Header;