import React, { useState, useEffect } from 'react';
import { 
  TextInput, 
  Textarea, 
  Button, 
  Group, 
  Checkbox, 
  Text,
  Box,
  Card,
  Stepper,
  Title,
  rem,
  ActionIcon,
  Alert,
  Paper,
  FileInput,
  Stack,
  Divider,
  Badge,
  Image
} from '@mantine/core';
import { 
  IconCheck, 
  IconChefHat, 
  IconClock, 
  IconInfoCircle,
  IconPlus,
  IconTrash,
  IconPhoto,
  IconAlertCircle,
  IconUpload,
  IconX
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { crearReceta, actualizarReceta, CrearRecetaDTO, ApiRecetaResponse, RecetaResponse } from '../../../services/recetaService';

interface FormularioCrearRecetaProps {
  onSuccess: (recetaData: ApiRecetaResponse) => void;
  onError: (error: Error) => void;
  modoEdicion?: boolean;
  recetaInicial?: RecetaResponse;
}

const FormularioCrearReceta: React.FC<FormularioCrearRecetaProps> = ({ 
  onSuccess, 
  onError,
  modoEdicion = false,
  recetaInicial
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [nombreReceta, setNombreReceta] = useState('');
  const [ingredientes, setIngredientes] = useState<string[]>(['']);
  const [pasosPreparacion, setPasosPreparacion] = useState<string[]>(['']);
  const [tiempoPreparacion, setTiempoPreparacion] = useState('');
  const [informacionNutricional, setInformacionNutricional] = useState('');
  const [publica, setPublica] = useState(false);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [imagenesExistentes, setImagenesExistentes] = useState<string[]>([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState<string[]>([]);
  
  // Estados de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar campos cuando esté en modo edición
  useEffect(() => {
    if (modoEdicion && recetaInicial) {
      setNombreReceta(recetaInicial.nombreReceta);
      setIngredientes(recetaInicial.ingredientes.length > 0 ? recetaInicial.ingredientes : ['']);
      setPasosPreparacion(recetaInicial.pasosPreparacion.length > 0 ? recetaInicial.pasosPreparacion : ['']);
      setTiempoPreparacion(recetaInicial.tiempoPreparacion || '');
      setInformacionNutricional(recetaInicial.informacionNutricional || '');
      setPublica(recetaInicial.publica);
      setImagenesExistentes(recetaInicial.imagenes || []);
    }
  }, [modoEdicion, recetaInicial]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!nombreReceta.trim()) {
          newErrors.nombreReceta = 'El nombre de la receta es obligatorio';
        }
        break;
      case 1: {
        const ingredientesValidos = ingredientes.filter(ing => ing.trim() !== '');
        if (ingredientesValidos.length === 0) {
          newErrors.ingredientes = 'Debe agregar al menos un ingrediente';
        }
        break;
      }
      case 2:
        // Los pasos de preparación son opcionales, no validamos
        break;
      case 3:
        // Información adicional es opcional, no validamos
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(active)) {
      setActive((current) => (current < 4 ? current + 1 : current));
    }
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const addIngrediente = () => {
    setIngredientes([...ingredientes, '']);
  };

  const removeIngrediente = (index: number) => {
    if (ingredientes.length > 1) {
      setIngredientes(ingredientes.filter((_, i) => i !== index));
    }
  };

  const updateIngrediente = (index: number, value: string) => {
    const newIngredientes = [...ingredientes];
    newIngredientes[index] = value;
    setIngredientes(newIngredientes);
  };

  const addPaso = () => {
    setPasosPreparacion([...pasosPreparacion, '']);
  };

  const removePaso = (index: number) => {
    if (pasosPreparacion.length > 1) {
      setPasosPreparacion(pasosPreparacion.filter((_, i) => i !== index));
    }
  };

  const updatePaso = (index: number, value: string) => {
    const newPasos = [...pasosPreparacion];
    newPasos[index] = value;
    setPasosPreparacion(newPasos);
  };

  const eliminarImagenExistente = (imagenPath: string) => {
    setImagenesExistentes(imagenesExistentes.filter(img => img !== imagenPath));
    setImagenesAEliminar([...imagenesAEliminar, imagenPath]);
  };

  const restaurarImagenExistente = (imagenPath: string) => {
    setImagenesExistentes([...imagenesExistentes, imagenPath]);
    setImagenesAEliminar(imagenesAEliminar.filter(img => img !== imagenPath));
  };

  const getImageUrl = (imagePath: string) => {
    return `${import.meta.env.VITE_BACKEND_HOST || 'http://localhost:5000'}${imagePath}`;
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      setActive(0);
      return;
    }

    setLoading(true);
    
    try {
      const recetaData: CrearRecetaDTO = {
        nombreReceta: nombreReceta.trim(),
        ingredientes: ingredientes.filter(ing => ing.trim() !== ''),
        pasosPreparacion: pasosPreparacion.filter(paso => paso.trim() !== ''),
        tiempoPreparacion: tiempoPreparacion.trim() || undefined,
        informacionNutricional: informacionNutricional.trim() || undefined,
        publica
      };

      const imagenesValidas = imagenes.filter(img => img);
      
      let response: ApiRecetaResponse;
      
      if (modoEdicion && recetaInicial) {
        response = await actualizarReceta(
          recetaInicial._id, 
          recetaData, 
          imagenesValidas.length > 0 ? imagenesValidas : undefined,
          imagenesAEliminar.length > 0 ? imagenesAEliminar : undefined
        );
      } else {
        response = await crearReceta(recetaData, imagenesValidas.length > 0 ? imagenesValidas : undefined);
      }
      
      onSuccess(response);
    } catch (error) {
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (active) {
      case 0:
        return (
          <Stack gap="md">
            <Title order={3} c="nutroos-green.6">
              <Group gap="xs">
                <IconChefHat size={20} />
                Información Básica
              </Group>
            </Title>
            
            <TextInput
              label="Nombre de la receta"
              placeholder="Ej: Ensalada César"
              value={nombreReceta}
              onChange={(e) => setNombreReceta(e.target.value)}
              error={errors.nombreReceta}
              required
              size="md"
            />
            
            <Checkbox
              label="Hacer receta pública"
              description="Las recetas públicas pueden ser vistas por todos los usuarios"
              checked={publica}
              onChange={(e) => setPublica(e.currentTarget.checked)}
              color="nutroos-green"
            />
          </Stack>
        );

      case 1:
        return (
          <Stack gap="md">
            <Title order={3} c="nutroos-green.6">
              <Group gap="xs">
                <IconChefHat size={20} />
                Ingredientes
              </Group>
            </Title>
            
            {ingredientes.map((ingrediente, index) => (
              <Group key={index} gap="sm">
                <TextInput
                  placeholder={`Ingrediente ${index + 1}`}
                  value={ingrediente}
                  onChange={(e) => updateIngrediente(index, e.target.value)}
                  style={{ flex: 1 }}
                  size="md"
                />
                {ingredientes.length > 1 && (
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removeIngrediente(index)}
                    size="lg"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            ))}
            
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addIngrediente}
              color="nutroos-green"
            >
              Agregar ingrediente
            </Button>
            
            {errors.ingredientes && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                {errors.ingredientes}
              </Alert>
            )}
          </Stack>
        );

      case 2:
        return (
          <Stack gap="md">
            <Title order={3} c="nutroos-green.6">
              <Group gap="xs">
                <IconChefHat size={20} />
                Pasos de Preparación
              </Group>
            </Title>
            
            <Text size="sm" c="dimmed">
              Agrega los pasos para preparar la receta (opcional)
            </Text>
            
            {pasosPreparacion.map((paso, index) => (
              <Group key={index} gap="sm" align="flex-start">
                <Badge color="nutroos-green" variant="light" size="lg">
                  {index + 1}
                </Badge>
                <Textarea
                  placeholder={`Paso ${index + 1}`}
                  value={paso}
                  onChange={(e) => updatePaso(index, e.target.value)}
                  style={{ flex: 1 }}
                  minRows={2}
                  size="md"
                />
                {pasosPreparacion.length > 1 && (
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removePaso(index)}
                    size="lg"
                    mt="xs"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            ))}
            
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addPaso}
              color="nutroos-green"
            >
              Agregar paso
            </Button>
          </Stack>
        );

      case 3:
        return (
          <Stack gap="md">
            <Title order={3} c="nutroos-green.6">
              <Group gap="xs">
                <IconInfoCircle size={20} />
                Información Adicional
              </Group>
            </Title>
            
            <TextInput
              label="Tiempo de preparación"
              placeholder="Ej: 30 minutos"
              value={tiempoPreparacion}
              onChange={(e) => setTiempoPreparacion(e.target.value)}
              leftSection={<IconClock size={16} />}
              size="md"
            />
            
            <Textarea
              label="Información nutricional"
              placeholder="Ej: 350 calorías, 15g proteína, 25g carbohidratos..."
              value={informacionNutricional}
              onChange={(e) => setInformacionNutricional(e.target.value)}
              minRows={3}
              size="md"
            />
          </Stack>
        );

      case 4:
        return (
          <Stack gap="md">
            <Title order={3} c="nutroos-green.6">
              <Group gap="xs">
                <IconPhoto size={20} />
                Imágenes (Opcional)
              </Group>
            </Title>
            
            <Text size="sm" c="dimmed">
              Puedes agregar hasta 5 imágenes de la receta
            </Text>

            {/* Imágenes existentes (solo en modo edición) */}
            {modoEdicion && imagenesExistentes.length > 0 && (
              <Paper p="md" withBorder>
                <Text size="sm" fw={500} mb="xs">
                  Imágenes actuales ({imagenesExistentes.length}):
                </Text>
                <Group gap="xs">
                  {imagenesExistentes.map((imagen, index) => (
                    <Box key={index} style={{ position: 'relative' }}>
                      <Image
                        src={getImageUrl(imagen)}
                        height={80}
                        width={80}
                        radius="md"
                        style={{ objectFit: 'cover' }}
                      />
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="sm"
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                        }}
                        onClick={() => eliminarImagenExistente(imagen)}
                      >
                        <IconX size={12} />
                      </ActionIcon>
                    </Box>
                  ))}
                </Group>
              </Paper>
            )}

            {/* Imágenes eliminadas (solo en modo edición) */}
            {modoEdicion && imagenesAEliminar.length > 0 && (
              <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-red-0)' }}>
                <Text size="sm" fw={500} mb="xs" c="red">
                  Imágenes marcadas para eliminar ({imagenesAEliminar.length}):
                </Text>
                <Group gap="xs">
                  {imagenesAEliminar.map((imagen, index) => (
                    <Box key={index} style={{ position: 'relative', opacity: 0.5 }}>
                      <Image
                        src={getImageUrl(imagen)}
                        height={80}
                        width={80}
                        radius="md"
                        style={{ objectFit: 'cover' }}
                      />
                      <ActionIcon
                        color="green"
                        variant="filled"
                        size="sm"
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                        }}
                        onClick={() => restaurarImagenExistente(imagen)}
                      >
                        <IconCheck size={12} />
                      </ActionIcon>
                    </Box>
                  ))}
                </Group>
              </Paper>
            )}
            
            <FileInput
              label="Agregar nuevas imágenes"
              placeholder="Selecciona imágenes"
              accept="image/*"
              multiple
              value={imagenes}
              onChange={setImagenes}
              leftSection={<IconUpload size={16} />}
              size="md"
            />
            
            {imagenes.length > 0 && (
              <Paper p="md" withBorder>
                <Text size="sm" fw={500} mb="xs">
                  Nuevas imágenes seleccionadas ({imagenes.length}):
                </Text>
                <Group gap="xs">
                  {imagenes.map((imagen, index) => (
                    <Badge key={index} variant="light" color="nutroos-green">
                      {imagen.name}
                    </Badge>
                  ))}
                </Group>
              </Paper>
            )}
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Card withBorder radius="md" p="lg">
      <Stepper 
        active={active} 
        onStepClick={setActive}
        size={isMobile ? "sm" : "md"}
        styles={{
          stepBody: {
            display: 'none',
          },
          step: {
            padding: 0,
          },
        }}
      >
        <Stepper.Step 
          label="Información básica" 
          description="Nombre y visibilidad"
          icon={<IconChefHat size={18} />}
        />
        <Stepper.Step 
          label="Ingredientes" 
          description="Lista de ingredientes"
          icon={<IconChefHat size={18} />}
        />
        <Stepper.Step 
          label="Preparación" 
          description="Pasos de cocción"
          icon={<IconChefHat size={18} />}
        />
        <Stepper.Step 
          label="Información adicional" 
          description="Tiempo y nutrición"
          icon={<IconInfoCircle size={18} />}
        />
        <Stepper.Step 
          label="Imágenes" 
          description="Fotos de la receta"
          icon={<IconPhoto size={18} />}
        />
      </Stepper>

      <Divider my="xl" />

      <Box style={{ minHeight: rem(400) }}>
        {renderStepContent()}
      </Box>

      <Group justify="space-between" mt="xl">
        <Button
          variant="default"
          onClick={prevStep}
          disabled={active === 0}
          leftSection={<IconChefHat size={16} />}
        >
          Anterior
        </Button>

        {active < 4 ? (
          <Button
            onClick={nextStep}
            color="nutroos-green"
            rightSection={<IconChefHat size={16} />}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={loading}
            color="nutroos-green"
            leftSection={<IconCheck size={16} />}
            size="md"
          >
            {modoEdicion ? 'Actualizar Receta' : 'Crear Receta'}
          </Button>
        )}
      </Group>
    </Card>
  );
};

export default FormularioCrearReceta;
