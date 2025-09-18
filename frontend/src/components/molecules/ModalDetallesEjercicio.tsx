import React from 'react';
import {
  Modal,
  Title,
  Group,
  Stack,
  Text,
  Paper,
  List,
  ThemeIcon,
  useMantineTheme
} from '@mantine/core';
import {
  IconBarbell,
  IconCheck
} from '@tabler/icons-react';
import { Ejercicio } from '../../types/training';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import EjercicioHeader from './EjercicioHeader';
import EjercicioParametros from './EjercicioParametros';
import EjercicioVideo from './EjercicioVideo';

interface ModalDetallesEjercicioProps {
  opened: boolean;
  onClose: () => void;
  ejercicio: Ejercicio | null;
}

const ModalDetallesEjercicio: React.FC<ModalDetallesEjercicioProps> = ({
  opened,
  onClose,
  ejercicio
}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();


  if (!ejercicio) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="md">
          <IconBarbell size={24} color={theme.colors["nutroos-green"][6]} />
          <Text fw={600} size="lg">
            {ejercicio.nombre}
          </Text>
        </Group>
      }
      size="xl"
      centered
      zIndex={1000}
      styles={{
        header: {
          backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
          borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        },
        body: {
          backgroundColor: isDark ? theme.colors.dark[8] : 'white',
        }
      }}
    >
      <Stack gap="xl">
        {/* Header con información básica */}
        <EjercicioHeader 
          ejercicio={ejercicio}
          showBackButton={false}
          showDescription={true}
        />

        {/* Parámetros del ejercicio */}
        <EjercicioParametros 
          ejercicio={ejercicio}
          title="Parámetros del Ejercicio"
        />

        {/* Video demostrativo */}
        <EjercicioVideo 
          ejercicio={ejercicio}
          height={250}
        />

        {/* Consejos de ejecución */}
        <Paper 
          p="lg" 
          radius="md" 
          withBorder
          bg={isDark ? "dark.7" : "gray.0"}
          style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
        >
          <Title order={4} mb="md" c="nutroos-green.6">
            Consejos de Ejecución
          </Title>
          
          <List spacing="sm" size="sm">
            <List.Item
              icon={
                <ThemeIcon color="nutroos-green" size={24} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              Mantén una postura correcta durante todo el ejercicio
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="nutroos-green" size={24} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              Realiza el movimiento de forma controlada, sin rebotes
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="nutroos-green" size={24} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              Respira correctamente: exhala en el esfuerzo, inhala en la relajación
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="nutroos-green" size={24} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              Si sientes dolor, detén el ejercicio inmediatamente
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="nutroos-green" size={24} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              Calienta antes de realizar el ejercicio
            </List.Item>
          </List>
        </Paper>
      </Stack>
    </Modal>
  );
};

export default ModalDetallesEjercicio;
