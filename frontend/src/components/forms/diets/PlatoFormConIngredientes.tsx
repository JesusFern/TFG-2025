import React, { useState, useEffect, useCallback } from 'react';
import { 
  TextInput, 
  Group, 
  Button,
  Box,
  Text,
  useMantineColorScheme,
  Alert,
  Paper,
  Divider,
  NumberInput,
  ActionIcon,
  Stack,
  Combobox,
  useCombobox,
  InputBase,
  Loader
} from '@mantine/core';
import { IconTrash, IconAlertCircle, IconSearch, IconX, IconChefHat } from '@tabler/icons-react';
import { Plato, Ingrediente, Receta } from '../../../types/diets';
import BuscadorIngredientes from '../../molecules/BuscadorIngredientes';
import { buscarRecetas } from '../../../services/dietService';

interface PlatoFormConIngredientesProps {
  plato: Plato;
  onSave: (plato: Plato) => void;
  onCancel: () => void;
}

const PlatoFormConIngredientes: React.FC<PlatoFormConIngredientesProps> = ({ 
  plato, 
  onSave, 
  onCancel 
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [formData, setFormData] = useState<Plato>(plato);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [ingredientesReceta, setIngredientesReceta] = useState<Ingrediente[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState<boolean>(false);
  
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const obtenerInfoNutricional = (ingrediente: Ingrediente) => {
    if ('informacionNutricional' in ingrediente) {
      const info = ingrediente.informacionNutricional;
      return {
        calorias: Number(info.calorias) || 0,
        proteinas: Number(info.proteinas) || 0,
        carbohidratos: Number(info.carbohidratos) || 0,
        grasas: Number(info.grasas) || 0,
        fibra: Number(info.fibra) || 0,
        azucares: Number(info.azucares) || 0,
        sal: Number(info.sal) || 0,
        sodio: Number(info.sodio) || 0
      };
    }
    return { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0, azucares: 0, sal: 0, sodio: 0 };
  };

  const convertirIngredientesReceta = (receta: Receta): Ingrediente[] => {
    return receta.ingredientes.map((ing, index) => {
      if (typeof ing === 'string') {
        return {
          nombre: `Ingrediente ${index + 1}`,
          peso: 100,
          informacionNutricional: { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 },
          id: null
        };
      }
      
      if ('ingrediente' in ing) {
        return {
          nombre: ing.ingrediente.nombre,
          peso: Number(ing.peso) || 100,
          informacionNutricional: {
            calorias: Number(ing.ingrediente.calorias) || 0,
            proteinas: Number(ing.ingrediente.proteinas) || 0,
            carbohidratos: Number(ing.ingrediente.hidratosCarbono) || 0,
            grasas: Number(ing.ingrediente.grasas) || 0,
            fibra: Number(ing.ingrediente.fibra) || 0,
            azucares: Number(ing.ingrediente.azucares) || 0,
            sal: Number(ing.ingrediente.sal) || 0,
            sodio: Number(ing.ingrediente.sodio) || 0
          },
          marca: ing.ingrediente.marca,
          imagenIngrediente: ing.ingrediente.imagenIngrediente,
          fuente: ing.ingrediente.fuente,
          id: ing.ingrediente._id
        };
      }
      
      return ing;
    });
  };

  const fetchInitialRecetas = useCallback(async () => {
    if (hasSearched) return;
    
    try {
      setLoading(true);
      const resultados = await buscarRecetas('');
      setRecetas(resultados.slice(0, 5));
      setHasSearched(true);
    } catch (error) {
      console.error("Error al cargar recetas iniciales:", error);
      setRecetas([]);
    } finally {
      setLoading(false);
    }
  }, [hasSearched]);

  const fetchRecetas = useCallback(async (termino: string) => {
    try {
      setLoading(true);
      const resultados = await buscarRecetas(termino);
      setRecetas(resultados.slice(0, 5));
      setHasSearched(true);
    } catch (error) {
      console.error("Error al buscar recetas:", error);
      setRecetas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarIngredientesDeReceta = useCallback(async (recetaId: string) => {
    try {
      setLoading(true);
      const resultados = await buscarRecetas(''); // Obtener todas las recetas
      const recetaEncontrada = resultados.find(r => r._id === recetaId);
      
      if (recetaEncontrada) {
        console.log('Receta encontrada para cargar ingredientes:', recetaEncontrada);
        let ingredientesConvertidos = convertirIngredientesReceta(recetaEncontrada);
        
        if (plato.ingredientesPersonalizados && plato.ingredientesPersonalizados.length > 0) {
          console.log('Plato tiene ingredientes personalizados, aplicando pesos:', plato.ingredientesPersonalizados);
          
          ingredientesConvertidos = ingredientesConvertidos.map(ingredienteReceta => {
            const ingredientePersonalizado = plato.ingredientesPersonalizados?.find(
              ing => ing.ingrediente === ingredienteReceta.id
            );
            
            if (ingredientePersonalizado) {
              console.log(`Aplicando peso personalizado ${ingredientePersonalizado.peso}g a ${ingredienteReceta.nombre}`);
              return {
                ...ingredienteReceta,
                peso: ingredientePersonalizado.peso
              };
            }
            
            return ingredienteReceta;
          });
        }
        
        console.log('Ingredientes finales para edición:', ingredientesConvertidos);
        setIngredientesReceta(ingredientesConvertidos);
        
        setRecetas(prev => {
          const existe = prev.some(r => r._id === recetaId);
          if (!existe) {
            return [recetaEncontrada, ...prev];
          }
          return prev;
        });
      } else {
        console.warn('No se encontró la receta con ID:', recetaId);
        setIngredientesReceta([]);
      }
    } catch (error) {
      console.error("Error al cargar ingredientes de la receta:", error);
      setIngredientesReceta([]);
    } finally {
      setLoading(false);
    }
  }, [plato.ingredientesPersonalizados]);

  const cargarIngredientesPersonalizados = useCallback(async (ingredientesPersonalizados: Array<{ ingrediente: string; peso: number }>) => {
    try {
      setLoading(true);
      console.log('Cargando ingredientes personalizados del plato:', ingredientesPersonalizados);
      
      const ingredientesCompletos: Ingrediente[] = [];
      
      for (const ingPersonalizado of ingredientesPersonalizados) {
        try {
          const response = await fetch(`/api/ingredientes/${ingPersonalizado.ingrediente}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (response.ok) {
            const ingredienteData = await response.json();
            const ingredienteCompleto: Ingrediente = {
              nombre: ingredienteData.nombre,
              peso: ingPersonalizado.peso,
              informacionNutricional: {
                calorias: ingredienteData.calorias || 0,
                proteinas: ingredienteData.proteinas || 0,
                carbohidratos: ingredienteData.hidratosCarbono || 0,
                grasas: ingredienteData.grasas || 0,
                fibra: ingredienteData.fibra || 0,
                azucares: ingredienteData.azucares || 0,
                sal: ingredienteData.sal || 0,
                sodio: ingredienteData.sodio || 0
              },
              marca: ingredienteData.marca,
              imagenIngrediente: ingredienteData.imagenIngrediente,
              fuente: ingredienteData.fuente,
              id: ingredienteData._id
            };
            ingredientesCompletos.push(ingredienteCompleto);
          } else {
            console.warn(`No se pudo cargar el ingrediente con ID: ${ingPersonalizado.ingrediente}`);
          }
        } catch (error) {
          console.error(`Error al cargar ingrediente ${ingPersonalizado.ingrediente}:`, error);
        }
      }
      
      console.log('Ingredientes personalizados cargados:', ingredientesCompletos);
      setIngredientes(ingredientesCompletos);
    } catch (error) {
      console.error("Error al cargar ingredientes personalizados:", error);
      setIngredientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setFormData({
      ...plato,
      nombre: plato.nombre || '',
      ingredientesPersonalizados: plato.ingredientesPersonalizados || []
    });

    // Si el plato tiene una receta asociada, cargar sus ingredientes
    if (plato.receta) {
      cargarIngredientesDeReceta(plato.receta);
    } else if (plato.ingredientesPersonalizados && plato.ingredientesPersonalizados.length > 0) {
      // Si no hay receta pero hay ingredientes personalizados, cargarlos
      cargarIngredientesPersonalizados(plato.ingredientesPersonalizados);
    }
  }, [plato, cargarIngredientesDeReceta, cargarIngredientesPersonalizados]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchRecetas(searchTerm);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else if (searchTerm.length === 0 && hasSearched) {
      const timeoutId = setTimeout(() => {
        fetchInitialRecetas();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, fetchRecetas, fetchInitialRecetas, hasSearched]);

  const handleInputChange = (field: keyof Plato, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores cuando el usuario modifica el campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addIngrediente = (ingrediente: Ingrediente) => {
    // Verificar si el ingrediente ya existe
    const existe = ingredientes.some(ing => 
      ing.nombre.toLowerCase() === ingrediente.nombre.toLowerCase()
    );
    
    if (existe) {
      setErrors(prev => ({
        ...prev,
        ingredientes: 'Este ingrediente ya ha sido añadido'
      }));
      setTimeout(() => {
        setErrors(prev => ({
          ...prev,
          ingredientes: ''
        }));
      }, 3000);
      return;
    }

    const nuevoIngrediente = {
      ...ingrediente,
      peso: ingrediente.peso || 100 // Peso por defecto
    };
    
    setIngredientes([...ingredientes, nuevoIngrediente]);
    
    // Limpiar el error de validación cuando se añade un ingrediente
    if (errors.ingredientes && errors.ingredientes !== 'Este ingrediente ya ha sido añadido') {
      setErrors(prev => ({
        ...prev,
        ingredientes: ''
      }));
    }
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

  const updateIngredienteRecetaPeso = (index: number, nuevoPeso: number) => {
    const newIngredientes = [...ingredientesReceta];
    newIngredientes[index] = {
      ...newIngredientes[index],
      peso: nuevoPeso
    };
    setIngredientesReceta(newIngredientes);
  };

  const removeIngredienteReceta = (index: number) => {
    setIngredientesReceta(ingredientesReceta.filter((_, i) => i !== index));
  };

  const handleSelectReceta = (recetaId: string) => {
    const recetaSeleccionada = recetas.find(r => r._id === recetaId);
    
    if (recetaSeleccionada) {
      console.log('Receta seleccionada:', recetaSeleccionada);
      console.log('Ingredientes de la receta:', recetaSeleccionada.ingredientes);
      
      setFormData({
        ...formData,
        nombre: recetaSeleccionada.nombreReceta,
        receta: recetaId
      });
      
      // Convertir y cargar los ingredientes de la receta
      const ingredientesConvertidos = convertirIngredientesReceta(recetaSeleccionada);
      console.log('Ingredientes convertidos:', ingredientesConvertidos);
      setIngredientesReceta(ingredientesConvertidos);
      
      // Limpiar ingredientes personalizados cuando se selecciona una receta
      setIngredientes([]);
      
      // Limpiar el error de validación cuando se selecciona una receta
      if (errors.ingredientes) {
        setErrors(prev => ({
          ...prev,
          ingredientes: ''
        }));
      }
    }
  };

  const handleClearReceta = () => {
    setFormData({
      ...formData,
      receta: null,
      nombre: '' // Limpiar también el nombre del plato
    });
    // Limpiar ingredientes de la receta
    setIngredientesReceta([]);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre del plato es obligatorio';
    }

    if (!formData.receta && ingredientes.length === 0) {
      newErrors.ingredientes = 'Debe asignar una receta o añadir al menos un ingrediente';
    }

    if (formData.receta && ingredientesReceta.length === 0) {
      newErrors.ingredientes = 'La receta seleccionada no tiene ingredientes válidos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasTriedSubmit(true);
    
    if (!validateForm()) {
      return;
    }

    let ingredientesPersonalizados;

    if (formData.receta) {
      // Si hay una receta seleccionada, usar los ingredientes de la receta con pesos modificados
      ingredientesPersonalizados = ingredientesReceta
        .filter(ing => ing.id || ing.codigoBarras) // Solo ingredientes con ID válido
        .map(ing => ({
          ingrediente: ing.id || ing.codigoBarras || '', // Usar el ID del ingrediente
          peso: ing.peso || 100
        }));
    } else {
      // Si no hay receta, usar ingredientes personalizados
      ingredientesPersonalizados = ingredientes
        .filter(ing => ing.id || ing.codigoBarras) // Solo ingredientes con ID válido
        .map(ing => ({
          ingrediente: ing.id || ing.codigoBarras || '', // Usar el ID del ingrediente
          peso: ing.peso || 100
        }));
    }

    const platoActualizado: Plato = {
      ...formData,
      ingredientesPersonalizados: ingredientesPersonalizados.length > 0 ? ingredientesPersonalizados : undefined
    };

    onSave(platoActualizado);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack gap="sm">
        <TextInput
          label="Nombre del plato"
          placeholder="Ej: Ensalada César"
          value={formData.nombre || ''}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
          error={errors.nombre}
          required
          size="sm"
        />

        {/* Buscador de recetas */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Seleccionar receta (opcional)
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            Puedes seleccionar una receta existente para cargar automáticamente su nombre e ingredientes al plato.
          </Text>

          <Combobox
            store={combobox}
            onOptionSubmit={(value) => {
              handleSelectReceta(value);
              combobox.closeDropdown();
            }}
          >
            <Combobox.Target>
              <InputBase
                component="button"
                type="button"
                pointer
                rightSection={
                  formData.receta ? (
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearReceta();
                      }}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  ) : (
                    <IconSearch size={16} />
                  )
                }
                rightSectionPointerEvents={formData.receta ? "auto" : "none"}
                onClick={() => {
                  combobox.toggleDropdown();
                  if (!hasSearched) {
                    fetchInitialRecetas();
                  }
                }}
                size="sm"
              >
                {formData.receta ? recetas.find(r => r._id === formData.receta)?.nombreReceta || 'Receta seleccionada' : 'Buscar receta...'}
              </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown style={{ zIndex: 2100 }}>
              <Combobox.Search
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                placeholder="Buscar receta..."
                leftSection={<IconSearch size={16} />}
              />
              <Combobox.Options>
                {loading ? (
                  <Combobox.Empty>
                    <Group justify="center" gap="xs">
                      <Loader size="xs" />
                      <Text size="sm">Buscando recetas...</Text>
                    </Group>
                  </Combobox.Empty>
                ) : recetas.length > 0 ? (
                  recetas.map((receta) => (
                    <Combobox.Option value={receta._id || ''} key={receta._id}>
                      <Group gap="xs">
                        <IconChefHat size={16} />
                        <Box>
                          <Text size="sm" fw={500}>{receta.nombreReceta}</Text>
                          {receta.ingredientes && (
                            <Text size="xs" c="dimmed">
                              {Array.isArray(receta.ingredientes) ? receta.ingredientes.length : 0} ingredientes
                            </Text>
                          )}
                        </Box>
                      </Group>
                    </Combobox.Option>
                  ))
                ) : (
                  <Combobox.Empty>No se encontraron recetas</Combobox.Empty>
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </Box>

        {!formData.receta && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Ingredientes del plato
            </Text>
            <Text size="xs" c="dimmed" mb="sm">
              Busca ingredientes para añadirlos al plato. Cada plato debe tener al menos un ingrediente.
            </Text>

            {/* Buscador de ingredientes */}
            <BuscadorIngredientes 
              onSeleccionar={addIngrediente}
              placeholder="Buscar ingrediente (ej: manzana, pollo, arroz...)"
              ingredientesAgregados={ingredientes}
              onEliminarIngrediente={removeIngrediente}
              onActualizarPeso={updateIngredientePeso}
            />
            
            {errors.ingredientes && hasTriedSubmit && (
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                color="red" 
                variant="light" 
                mt="sm"
              >
                {errors.ingredientes}
              </Alert>
            )}
          </Box>
        )}

        {formData.receta && (
          <Box>
            <Alert color="blue" variant="light" icon={<IconChefHat size={16} />} mb="md">
              <Text size="sm" fw={500} mb="xs">Receta seleccionada</Text>
              <Text size="sm">
                Este plato está asociado a la receta "{recetas.find(r => r._id === formData.receta)?.nombreReceta}". 
                Puedes modificar los pesos de los ingredientes para este plato específico.
              </Text>
            </Alert>

            {/* Ingredientes de la receta con pesos editables */}
            {ingredientesReceta.length > 0 && (
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Ingredientes de la receta
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  Modifica los pesos según las porciones que deseas para este plato.
                </Text>

                <Stack gap="sm">
                  {ingredientesReceta.map((ingrediente, index) => {
                    const infoNutricional = obtenerInfoNutricional(ingrediente);
                    const caloriasPorPeso = Math.round((infoNutricional.calorias * ingrediente.peso) / 100);
                    const proteinasPorPeso = ((infoNutricional.proteinas * ingrediente.peso) / 100).toFixed(1);
                    const carbohidratosPorPeso = ((infoNutricional.carbohidratos * ingrediente.peso) / 100).toFixed(1);
                    const grasasPorPeso = ((infoNutricional.grasas * ingrediente.peso) / 100).toFixed(1);

                    return (
                      <Paper
                        key={index}
                        p="sm"
                        style={{
                          backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
                          border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`
                        }}
                      >
                        <Group justify="space-between" align="flex-start">
                          <Box style={{ flex: 1 }}>
                            <Group gap="xs" mb="xs">
                              <Text size="sm" fw={500}>
                                {ingrediente.nombre}
                              </Text>
                              {ingrediente.marca && (
                                <Text size="xs" c="dimmed">
                                  ({ingrediente.marca})
                                </Text>
                              )}
                            </Group>
                            
                            <Text size="xs" c={isDark ? "gray.3" : "gray.6"} mb="xs">
                              📊 Para {ingrediente.peso}g: 🔥 {caloriasPorPeso} kcal | 💪 {proteinasPorPeso}g proteínas | 🍞 {carbohidratosPorPeso}g carbohidratos | 🧈 {grasasPorPeso}g grasas
                            </Text>
                          </Box>

                          <Group gap="xs" align="flex-end">
                            <Box>
                              <Text size="xs" c="dimmed" mb={4}>
                                Peso (g)
                              </Text>
                              <NumberInput
                                value={ingrediente.peso}
                                onChange={(value) => updateIngredienteRecetaPeso(index, Number(value) || 0)}
                                min={1}
                                max={10000}
                                size="xs"
                                style={{ width: 80 }}
                              />
                            </Box>
                            
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              size="sm"
                              onClick={() => removeIngredienteReceta(index)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>

                {/* Resumen nutricional total */}
                {ingredientesReceta.length > 0 && (
                  <Box
                    mt="md"
                    p="sm"
                    style={{
                      backgroundColor: isDark ? 'var(--mantine-color-nutroos-green-9)' : 'var(--mantine-color-nutroos-green-0)',
                      border: `1px solid ${isDark ? 'var(--mantine-color-nutroos-green-8)' : 'var(--mantine-color-nutroos-green-2)'}`,
                      borderRadius: 'var(--mantine-radius-sm)'
                    }}
                  >
                    <Text size="sm" fw={500} mb="xs" c={isDark ? "nutroos-green.1" : "nutroos-green.8"}>
                      📊 Información nutricional total del plato:
                    </Text>
                    <Text size="xs" c={isDark ? "nutroos-green.2" : "nutroos-green.7"}>
                      {(() => {
                        const totales = ingredientesReceta.reduce((acc, ing) => {
                          const info = obtenerInfoNutricional(ing);
                          const factor = ing.peso / 100;
                          return {
                            calorias: acc.calorias + (info.calorias * factor),
                            proteinas: acc.proteinas + (info.proteinas * factor),
                            carbohidratos: acc.carbohidratos + (info.carbohidratos * factor),
                            grasas: acc.grasas + (info.grasas * factor)
                          };
                        }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });

                        return `🔥 ${Math.round(totales.calorias)} kcal | 💪 ${totales.proteinas.toFixed(1)}g proteínas | 🍞 ${totales.carbohidratos.toFixed(1)}g carbohidratos | 🧈 ${totales.grasas.toFixed(1)}g grasas`;
                      })()}
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        <Divider />

        <Group justify="flex-end" gap="sm">
          <Button
            variant="outline"
            onClick={onCancel}
            color="gray"
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="nutroos-green"
            size="sm"
          >
            {plato._id ? 'Actualizar Plato' : 'Crear Plato'}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
};

export default PlatoFormConIngredientes;
