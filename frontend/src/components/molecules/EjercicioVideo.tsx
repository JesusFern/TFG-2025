import React from 'react';
import {
  Paper,
  Title,
  Box,
  Text
} from '@mantine/core';
import { Ejercicio } from '../../types/training';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface EjercicioVideoProps {
  ejercicio: Ejercicio;
  height?: number;
  showTitle?: boolean;
  title?: string;
}

const EjercicioVideo: React.FC<EjercicioVideoProps> = ({
  ejercicio,
  height = 300,
  showTitle = true,
  title = "Video Demostrativo"
}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  if (!ejercicio.videoDemostrativo) return null;

  return (
    <Paper 
      p="lg" 
      shadow="xs" 
      radius="md" 
      withBorder
      bg={isDark ? "dark.7" : "white"}
      style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
    >
      {showTitle && (
        <Title order={4} mb="md" c="nutroos-green.6">
          {title}
        </Title>
      )}
      
      <Box
        style={{
          position: 'relative',
          width: '100%',
          height: `${height}px`,
          borderRadius: theme.radius.md,
          overflow: 'hidden',
          backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[1]
        }}
      >
        <video
          controls
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: theme.radius.md
          }}
          preload="metadata"
        >
          <source src={ejercicio.videoDemostrativo} type="video/mp4" />
          <source src={ejercicio.videoDemostrativo} type="video/webm" />
          <source src={ejercicio.videoDemostrativo} type="video/ogg" />
          Tu navegador no soporta la reproducción de video.
        </video>
      </Box>
      
      <Text size="xs" c="dimmed" mt="xs" ta="center">
        Video demostrativo del ejercicio
      </Text>
    </Paper>
  );
};

export default EjercicioVideo;
