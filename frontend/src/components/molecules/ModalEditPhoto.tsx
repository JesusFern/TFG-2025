import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Button,
  Text,
  Alert,
  Paper,
  Box,
  Avatar,
  useMantineTheme,
  ActionIcon
} from '@mantine/core';
import {
  IconAlertCircle,
  IconUpload,
  IconX,
  IconPhoto,
  IconCheck
} from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';

interface ModalEditPhotoProps {
  opened: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
  currentPhotoUrl?: string | null;
  userName?: string;
}

const ModalEditPhoto: React.FC<ModalEditPhotoProps> = ({
  opened,
  onClose,
  onSave,
  currentPhotoUrl,
  userName = 'Usuario'
}) => {
  const theme = useMantineTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (files: FileWithPath[]) => {
    const file = files[0];
    if (file) {
      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. El tamaño máximo es 10MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona una imagen');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave(selectedFile);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      zIndex={1000} 
      opened={opened}
      onClose={handleClose}
      title="Cambiar Foto de Perfil"
      size="md"
      centered
    >
      <Stack gap="lg">
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

        {/* Vista actual y nueva */}
        <Group justify="center" gap="xl">
          {/* Foto actual */}
          <Stack align="center" gap="xs">
            <Text size="sm" fw={500} c="dimmed">
              Foto actual
            </Text>
            <Avatar
              src={currentPhotoUrl}
              size={100}
              radius="xl"
              color={theme.colors['nutroos-green'][6]}
            >
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Avatar>
          </Stack>

          {/* Flecha o separador */}
          {previewUrl && (
            <>
              <Text size="xl" c="dimmed">→</Text>
              
              {/* Nueva foto */}
              <Stack align="center" gap="xs">
                <Text size="sm" fw={500} c={theme.colors['nutroos-green'][6]}>
                  Nueva foto
                </Text>
                <Box style={{ position: 'relative' }}>
                  <Avatar
                    src={previewUrl}
                    size={100}
                    radius="xl"
                  />
                  <ActionIcon
                    size="sm"
                    variant="filled"
                    color="red"
                    radius="xl"
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                    }}
                    onClick={handleRemoveFile}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Box>
              </Stack>
            </>
          )}
        </Group>

        {/* Dropzone */}
        {!selectedFile ? (
          <Dropzone
            onDrop={handleDrop}
            onReject={() => setError('Archivo no válido')}
            maxSize={10 * 1024 * 1024}
            accept={IMAGE_MIME_TYPE}
            multiple={false}
            style={{
              border: `2px dashed ${theme.colors['nutroos-green'][4]}`,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors['nutroos-green'][0],
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            styles={{
              root: {
                '&:hover': {
                  backgroundColor: theme.colors['nutroos-green'][1],
                  borderColor: theme.colors['nutroos-green'][6],
                },
              },
            }}
          >
            <Stack align="center" gap="md" style={{ minHeight: 180, padding: theme.spacing.xl }}>
              <Dropzone.Accept>
                <IconUpload
                  size={60}
                  stroke={2}
                  color={theme.colors['nutroos-green'][6]}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX
                  size={60}
                  stroke={2}
                  color={theme.colors.red[6]}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto
                  size={60}
                  stroke={2}
                  color={theme.colors['nutroos-green'][5]}
                />
              </Dropzone.Idle>

              <Stack align="center" gap="xs">
                <Text size="xl" fw={600} c={theme.colors['nutroos-green'][7]}>
                  Arrastra una imagen aquí
                </Text>
                <Text size="md" c="dimmed">
                  o haz clic para seleccionar desde tu dispositivo
                </Text>
                <Button
                  variant="light"
                  color="nutroos-green"
                  size="md"
                  leftSection={<IconUpload size={18} />}
                  mt="sm"
                  style={{ pointerEvents: 'none' }}
                >
                  Seleccionar Imagen
                </Button>
                <Text size="xs" c="dimmed" mt="xs">
                  Tamaño máximo: 10MB • Formatos: JPG, PNG, GIF, WebP
                </Text>
              </Stack>
            </Stack>
          </Dropzone>
        ) : (
          <Paper p="md" withBorder style={{ backgroundColor: theme.colors.green[0] }}>
            <Group gap="sm">
              <IconCheck size={20} color={theme.colors.green[7]} />
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {selectedFile.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </div>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={handleRemoveFile}
                disabled={isLoading}
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
          </Paper>
        )}

        {/* Información */}
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Recomendaciones"
          color="blue"
          variant="light"
        >
          <Stack gap={4}>
            <Text size="sm">• Usa una imagen de buena calidad</Text>
            <Text size="sm">• Se recomienda formato cuadrado</Text>
            <Text size="sm">• Formatos: JPG, PNG, GIF, WebP</Text>
            <Text size="sm">• Tamaño máximo: 10MB</Text>
          </Stack>
        </Alert>

        {/* Botones */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="light"
            color="gray"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="filled"
            color="nutroos-green"
            onClick={handleSubmit}
            disabled={!selectedFile}
            loading={isLoading}
            leftSection={<IconUpload size={16} />}
          >
            Subir Foto
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalEditPhoto;

