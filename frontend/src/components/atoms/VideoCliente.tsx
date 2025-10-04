import React from 'react';
import {
  Paper,
  Title,
  Box,
  Text
} from '@mantine/core';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface VideoClienteProps {
  videoUrl: string;
  height?: number;
  showTitle?: boolean;
  title?: string;
}

const VideoCliente: React.FC<VideoClienteProps> = ({
  videoUrl,
  height = 250,
  showTitle = true,
  title = "Video del Cliente"
}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  if (!videoUrl) return null;

  // Determinar si es una URL externa o un video local
  const isExternalUrl = videoUrl.startsWith('http://') || 
                       videoUrl.startsWith('https://');
  
  // Si es una URL externa, usar iframe para YouTube/Vimeo, sino usar video tag
  const isYouTube = isExternalUrl && (
    videoUrl.includes('youtube.com') || 
    videoUrl.includes('youtu.be')
  );
  
  const isVimeo = isExternalUrl && videoUrl.includes('vimeo.com');

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
        {isYouTube ? (
          <iframe
            src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: theme.radius.md
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video del cliente"
          />
        ) : isVimeo ? (
          <iframe
            src={videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: theme.radius.md
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Video del cliente"
          />
        ) : (
          <video
            controls
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: theme.radius.md
            }}
            preload="metadata"
            crossOrigin="anonymous"
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            <source src={videoUrl} type="video/quicktime" />
            <source src={videoUrl} type="video/x-msvideo" />
            <p>Tu navegador no soporta el elemento video. 
              <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                Descargar video
              </a>
            </p>
          </video>
        )}
      </Box>
      
      <Text size="xs" c="dimmed" mt="xs" ta="center">
        Video grabado por el cliente
      </Text>
    </Paper>
  );
};

export default VideoCliente;
