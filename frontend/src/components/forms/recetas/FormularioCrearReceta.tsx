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
  Image,
  NumberInput
} from '@mantine/core';
import { 
  IconCheck, 
  IconChefHat, 
  IconClock, 
  IconPlus,
  IconTrash,
  IconPhoto,
  IconAlertCircle,
  IconUpload,
  IconX
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { crearReceta, actualizarReceta, CrearRecetaDTO, ApiRecetaResponse, RecetaResponse } from '../../../services/recetaService';
import { Ingrediente, IngredientePoblado } from '../../../types/diets';
import { guardarIngredientesOpenFoodFacts } from '../../../services/ingredientesService';
import { useThemeDetection } from '../../../hooks/useThemeDetection';
import BuscadorIngredientes from '../../molecules/BuscadorIngredientes';

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
  const isDark = useThemeDetection();
  
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [nombreReceta, setNombreReceta] = useState('');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [pasosPreparacion, setPasosPreparacion] = useState<string[]>(['']);
  const [tiempoPreparacion, setTiempoPreparacion] = useState('');
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
      // Convertir ingredientes del formato anterior al nuevo formato
      if (recetaInicial.ingredientes && Array.isArray(recetaInicial.ingredientes)) {
        if (typeof recetaInicial.ingredientes[0] === 'string') {
          // Formato anterior (string[])
          const ingredientesConvertidos: Ingrediente[] = (recetaInicial.ingredientes as string[]).map(nombre => ({
            nombre,
            peso: 100, // Peso por defecto
            informacionNutricional: {
              calorias: 0,
              proteinas: 0,
              carbohidratos: 0,
              grasas: 0
            }
          }));
          setIngredientes(ingredientesConvertidos);
        } else if (recetaInicial.ingredientes[0] && typeof recetaInicial.ingredientes[0] === 'object' && 'ingrediente' in recetaInicial.ingredientes[0]) {
          // Formato IngredientePoblado (desde BD)
          const ingredientesConvertidos: Ingrediente[] = (recetaInicial.ingredientes as unknown as IngredientePoblado[]).map(item => ({
            nombre: item.ingrediente.nombre,
            peso: item.peso,
            informacionNutricional: {
              calorias: item.ingrediente.calorias,
              proteinas: item.ingrediente.proteinas,
              carbohidratos: item.ingrediente.hidratosCarbono,
              grasas: item.ingrediente.grasas
            },
            marca: item.ingrediente.marca,
            imagenIngrediente: item.ingrediente.imagenIngrediente,
            fuente: item.ingrediente.fuente
          }));
          setIngredientes(ingredientesConvertidos);
        } else {
          // Formato Ingrediente (formulario)
          setIngredientes(recetaInicial.ingredientes as Ingrediente[]);
        }
      }
      setPasosPreparacion(recetaInicial.pasosPreparacion.length > 0 ? recetaInicial.pasosPreparacion : ['']);
      setTiempoPreparacion(recetaInicial.tiempoPreparacion || '');
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
        if (ingredientes.length === 0) {
          newErrors.ingredientes = 'Debe agregar al menos un ingrediente';
        }
        break;
      }
      case 2:
        // Los pasos de preparación son opcionales, no validamos
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(active)) {
      setActive((current) => (current < 3 ? current + 1 : current));
    }
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const addIngrediente = (ingrediente: Ingrediente) => {
    setIngredientes([...ingredientes, ingrediente]);
  };

  const removeIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const updateIngredientePeso = (index: number, nuevoPeso: number) => {
    const newIngredientes = [...ingredientes];
    newIngredientes[index] = {
      ...newIngredientes[index],
      peso: nuevoPeso
    };
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

  // Función auxiliar para obtener información nutricional según el tipo de ingrediente
  const obtenerInfoNutricional = (ingrediente: Ingrediente | IngredientePoblado | string) => {
    if (typeof ingrediente === 'string') {
      // Ingrediente como string (formato antiguo)
      return { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };
    } else if ('ingrediente' in ingrediente && ingrediente.ingrediente) {
      // IngredientePoblado (desde BD)
      return {
        calorias: ingrediente.ingrediente.calorias,
        proteinas: ingrediente.ingrediente.proteinas,
        carbohidratos: ingrediente.ingrediente.hidratosCarbono,
        grasas: ingrediente.ingrediente.grasas
      };
    } else if ('informacionNutricional' in ingrediente) {
      // Ingrediente (formulario)
      return ingrediente.informacionNutricional;
    }
    return { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };
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
        ingredientes: ingredientes,
        pasosPreparacion: pasosPreparacion.filter(paso => paso.trim() !== ''),
        tiempoPreparacion: tiempoPreparacion.trim() || undefined,
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
        
        // Después de crear la receta exitosamente, guardar ingredientes de OpenFoodFacts
        try {
          const resultadoGuardado = await guardarIngredientesOpenFoodFacts(ingredientes);
          if (resultadoGuardado.guardados > 0) {
            console.log(`Se guardaron ${resultadoGuardado.guardados} ingredientes de OpenFoodFacts en la base de datos local`);
          }
          if (resultadoGuardado.errores > 0) {
            console.warn(`Hubo ${resultadoGuardado.errores} errores al guardar algunos ingredientes de OpenFoodFacts`);
          }
        } catch (error) {
          console.error('Error al guardar ingredientes de OpenFoodFacts:', error);
          // No fallar la creación de la receta por este error
        }
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
                Ingredientes con Información Nutricional
              </Group>
            </Title>
            
            <Text size="sm" c="dimmed">
              Busca ingredientes para obtener automáticamente su información nutricional
            </Text>

            {/* Buscador de ingredientes */}
            <BuscadorIngredientes 
              onSeleccionar={addIngrediente}
              placeholder="Buscar ingrediente (ej: manzana, pollo, arroz...)"
            />
            
            {/* Lista de ingredientes seleccionados */}
            {ingredientes.length > 0 && (
              <Paper p="md" withBorder>
                <Text size="sm" fw={500} mb="sm">
                  Ingredientes agregados ({ingredientes.length}):
                </Text>
                
                <Stack gap="sm">
                  {ingredientes.map((ingrediente, index) => (
                    <Paper 
                      key={index} 
                      p="sm" 
                      withBorder 
                      style={{ 
                        backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
                        borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <Group gap="sm" style={{ flex: 1 }}>
                          {ingrediente.imagenIngrediente && (
                            <Image
                              src={ingrediente.imagenIngrediente}
                              alt={ingrediente.nombre}
                              w={40}
                              h={40}
                              radius="sm"
                              fallbackSrc="/api/placeholder/40/40"
                            />
                          )}
                          
                          <Box style={{ flex: 1 }}>
                            <Group justify="space-between" align="flex-start">
                              <Box>
                                <Text size="sm" fw={500} c={isDark ? "gray.0" : "dark.8"}>
                                  {ingrediente.nombre}
                                </Text>
                                {ingrediente.marca && (
                                  <Text size="xs" c="dimmed">
                                    {ingrediente.marca}
                                  </Text>
                                )}
                              </Box>
                              
                              <Group gap="xs">
                                <NumberInput
                                  size="xs"
                                  w={80}
                                  value={ingrediente.peso}
                                  onChange={(value) => updateIngredientePeso(index, Number(value) || 0)}
                                  min={1}
                                  max={5000}
                                  step={10}
                                  placeholder="Peso"
                                />
                                <ActionIcon
                                  color="red"
                                  variant="light"
                                  onClick={() => removeIngrediente(index)}
                                  size="sm"
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                            </Group>
                            
                            <Text size="xs" c="dimmed" mt="xs" ta="center">
                              📊 Para {typeof ingrediente === 'object' && 'peso' in ingrediente ? ingrediente.peso : 100}g: 
                              {(() => {
                                const infoNutricional = obtenerInfoNutricional(ingrediente);
                                const peso = typeof ingrediente === 'object' && 'peso' in ingrediente ? ingrediente.peso : 100;
                                return (
                                  <>
                                    <Text component="span" c={isDark ? "orange.3" : "orange.6"} fw={500}>🔥 {Math.round(infoNutricional.calorias * peso / 100)} kcal</Text> | 
                                    <Text component="span" c={isDark ? "green.3" : "green.6"} fw={500}>💪 {((infoNutricional.proteinas * peso) / 100).toFixed(1)}g proteínas</Text> | 
                                    <Text component="span" c={isDark ? "yellow.3" : "yellow.6"} fw={500}>🍞 {((infoNutricional.carbohidratos * peso) / 100).toFixed(1)}g carbohidratos</Text> | 
                                    <Text component="span" c={isDark ? "red.3" : "red.6"} fw={500}>🧈 {((infoNutricional.grasas * peso) / 100).toFixed(1)}g grasas</Text>
                                  </>
                                );
                              })()}
                            </Text>
                          </Box>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>

                {/* Resumen nutricional total */}
                <Divider my="sm" />
                <Box 
                  p="xs" 
                  style={{ 
                    backgroundColor: isDark ? 'var(--mantine-color-nutroos-green-9)' : 'var(--mantine-color-nutroos-green-0)',
                    borderRadius: 4,
                    border: `1px solid ${isDark ? 'var(--mantine-color-nutroos-green-7)' : 'var(--mantine-color-nutroos-green-2)'}`
                  }}
                >
                  <Text size="sm" fw={500} c={isDark ? "nutroos-green.2" : "nutroos-green.7"}>
                    Información nutricional total:
                  </Text>
                  <Text size="sm" c={isDark ? "nutroos-green.1" : "dark.8"}>
                    Calorías: {ingredientes.reduce((total, ing) => {
                      const infoNutricional = obtenerInfoNutricional(ing);
                      const peso = typeof ing === 'object' && 'peso' in ing ? ing.peso : 100;
                      return total + Math.round((infoNutricional.calorias * peso) / 100);
                    }, 0)} kcal | 
                    Proteínas: {ingredientes.reduce((total, ing) => {
                      const infoNutricional = obtenerInfoNutricional(ing);
                      const peso = typeof ing === 'object' && 'peso' in ing ? ing.peso : 100;
                      return total + ((infoNutricional.proteinas * peso) / 100);
                    }, 0).toFixed(1)}g | 
                    Carbohidratos: {ingredientes.reduce((total, ing) => {
                      const infoNutricional = obtenerInfoNutricional(ing);
                      const peso = typeof ing === 'object' && 'peso' in ing ? ing.peso : 100;
                      return total + ((infoNutricional.carbohidratos * peso) / 100);
                    }, 0).toFixed(1)}g | 
                    Grasas: {ingredientes.reduce((total, ing) => {
                      const infoNutricional = obtenerInfoNutricional(ing);
                      const peso = typeof ing === 'object' && 'peso' in ing ? ing.peso : 100;
                      return total + ((infoNutricional.grasas * peso) / 100);
                    }, 0).toFixed(1)}g
                  </Text>
                </Box>
              </Paper>
            )}
            
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
            
            <TextInput
              label="Tiempo de preparación"
              placeholder="Ej: 30 minutos"
              value={tiempoPreparacion}
              onChange={(e) => setTiempoPreparacion(e.target.value)}
              leftSection={<IconClock size={16} />}
              size="md"
            />
            
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
          description="Pasos y tiempo"
          icon={<IconChefHat size={18} />}
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

        {active < 3 ? (
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
