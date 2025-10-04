import React, { useState, useRef } from 'react';
import { 
  Button, 
  Textarea, 
  Stack, 
  Title, 
  Paper, 
  Group, 
  Alert, 
  Container,
  Image,
  Grid,
  Text,
  ActionIcon,
  Box,
  rem
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IncidentService, CrearIncidenciaData } from '../services/incidentService';
import { IconX, IconPhoto } from '@tabler/icons-react';

const CrearIncidenciaPage: React.FC = () => {
  const [descripcion, setDescripcion] = useState('');
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: File[] | null | FileList) => {
    if (!files) return;
    
    const newFiles = Array.isArray(files) ? files : Array.from(files);
    const totalFiles = imagenes.length + newFiles.length;
    
    if (totalFiles > 5) {
      setError('No se pueden subir más de 5 imágenes');
      return;
    }
    
    setError(null);
    const updatedImagenes = [...imagenes, ...newFiles];
    setImagenes(updatedImagenes);
    
    // Crear URLs de preview
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    const updatedImagenes = imagenes.filter((_, i) => i !== index);
    const updatedPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revocar URL de preview para liberar memoria
    URL.revokeObjectURL(previewUrls[index]);
    
    setImagenes(updatedImagenes);
    setPreviewUrls(updatedPreviewUrls);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!descripcion.trim()) {
      setError('La descripción es obligatoria');
      return;
    }
    
    try {
      setLoading(true);
      const data: CrearIncidenciaData = {
        descripcion: descripcion.trim(),
        imagenes: imagenes.length > 0 ? imagenes : undefined
      };
      
      await IncidentService.crearIncidencia(data);
      navigate('/mis-incidencias');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear la incidencia');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container size="lg" py="md">
      <Paper p="xl" withBorder>
        <Stack gap="lg">
          <Title order={2}>Crear incidencia</Title>
          
          {error && (
            <Alert color="red" variant="light">{error}</Alert>
          )}
          
          <Alert color="blue" variant="light">
            Un administrador resolverá tu incidencia lo más pronto posible.
          </Alert>

          <Textarea
            label="Descripción"
            placeholder="Describe el problema con el mayor detalle posible"
            autosize
            minRows={10}
            maxRows={20}
            value={descripcion}
            onChange={(e) => setDescripcion(e.currentTarget.value)}
            withAsterisk
            size="md"
          />
          
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Imágenes adjuntas (máximo 5)
            </Text>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e.target.files)}
              style={{ display: 'none' }}
            />

            <Paper
              withBorder
              p="xl"
              radius="md"
              onClick={() => fileInputRef.current?.click()}
              style={{
                cursor: imagenes.length >= 5 ? 'not-allowed' : 'pointer',
                borderStyle: 'dashed',
                opacity: imagenes.length >= 5 ? 0.6 : 1
              }}
            >
              <Group justify="center" align="center">
                <ActionIcon variant="light" color="gray" size="lg">
                  <IconPhoto size={rem(18)} />
                </ActionIcon>
                <Stack gap={0}>
                  <Text fw={500}>Seleccionar imágenes</Text>
                  <Text size="xs" c="dimmed">Haz clic para elegir (máximo 5)</Text>
                </Stack>
              </Group>
            </Paper>
            
            {imagenes.length > 0 && (
              <Text size="xs" c="dimmed" mt="xs">
                {imagenes.length}/5 imágenes seleccionadas
              </Text>
            )}
            
            {previewUrls.length > 0 && (
              <Grid mt="md">
                {previewUrls.map((url, index) => (
                  <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                    <Box pos="relative" style={{ borderRadius: 8, overflow: 'hidden' }}>
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        height={200}
                        fit="cover"
                      />
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="sm"
                        pos="absolute"
                        top={8}
                        right={8}
                        onClick={() => removeImage(index)}
                      >
                        <IconX size={rem(12)} />
                      </ActionIcon>
                    </Box>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Box>
          
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={() => navigate(-1)} disabled={loading} size="md">
              Cancelar
            </Button>
            <Button color="nutroos-green" onClick={handleSubmit} loading={loading} size="md">
              Crear incidencia
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default CrearIncidenciaPage;


