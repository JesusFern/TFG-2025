import React, { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
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
  onUpdate?: (plato: Plato) => void;
}

const PlatoFormConIngredientes: React.FC<PlatoFormConIngredientesProps> = ({ 
  plato, 
  onSave, 
  onCancel,
  onUpdate
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
  const [forceRender, setForceRender] = useState<number>(0); // Para forzar re-renders cuando sea necesario
  
  // Ref para evitar múltiples cargas del mismo plato
  const lastProcessedPlatoId = useRef<string | null>(null);
  const isLoadingIngredients = useRef<boolean>(false);
  
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
      const resultados = await buscarRecetas('');
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
  }, []);

  const cargarIngredientesPersonalizados = useCallback(async (ingredientesPersonalizados: Array<{ ingrediente: string | { _id: string; nombre: string; calorias: number; proteinas: number; grasas: number; hidratosCarbono: number; }; peso: number }>) => {
    // Evitar múltiples cargas simultáneas
    if (isLoadingIngredients.current) {
      return;
    }
    
    try {
      isLoadingIngredients.current = true;
      setLoading(true);
      console.log(`🧄 Cargando ${ingredientesPersonalizados.length} ingredientes personalizados`);
      
      const ingredientesCompletos: Ingrediente[] = [];
      
      for (const ingPersonalizado of ingredientesPersonalizados) {
        try {
          const ingredienteId = typeof ingPersonalizado.ingrediente === 'string' 
            ? ingPersonalizado.ingrediente 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : (ingPersonalizado.ingrediente as any)._id || (ingPersonalizado.ingrediente as any).id;
          
          const response = await fetch(`/api/ingredientes/${ingredienteId}`, {
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
          }
        } catch (error) {
          console.error(`❌ Error al cargar ingrediente:`, error);
        }
      }
      
      console.log(`✅ Ingredientes cargados: ${ingredientesCompletos.length}/${ingredientesPersonalizados.length}`);
      setIngredientes(ingredientesCompletos);
    } catch (error) {
      console.error("❌ Error al cargar ingredientes personalizados:", error);
      setIngredientes([]);
    } finally {
      setLoading(false);
      isLoadingIngredients.current = false;
    }
  }, []);

  // Memoizar las propiedades estables del plato para evitar renders innecesarios
  const platoPropiedades = useMemo(() => {
    const recetaId = plato.receta || null;
    return {
      id: plato._id || 'new',
      nombre: plato.nombre || 'unnamed',
      recetaId: recetaId || 'no-recipe',
      numIngredientes: plato.ingredientesPersonalizados?.length || 0,
      tieneIngredientesPersonalizados: !!(plato.ingredientesPersonalizados && plato.ingredientesPersonalizados.length > 0),
      tieneReceta: !!plato.receta,
      // Agregar hash de ingredientes para detectar cambios más específicos
      ingredientesHash: plato.ingredientesPersonalizados?.map(ing => {
        const ingredienteId = typeof ing.ingrediente === 'string' ? ing.ingrediente : (ing.ingrediente && typeof ing.ingrediente === 'object' && '_id' in ing.ingrediente) ? ing.ingrediente._id : 'unknown';
        return `${ingredienteId}-${ing.peso}`;
      }).join(',') || 'empty'
    };
  }, [plato._id, plato.nombre, plato.receta, plato.ingredientesPersonalizados]);

  useEffect(() => {
    // Crear un identificador único usando las propiedades memoizadas incluyendo el hash de ingredientes
    const platoId = `${platoPropiedades.id}-${platoPropiedades.nombre}-${platoPropiedades.recetaId}-${platoPropiedades.ingredientesHash}`;
    
    // No procesar platos con datos por defecto/vacíos
    if (platoPropiedades.nombre === 'unnamed' && platoPropiedades.recetaId === 'no-recipe' && platoPropiedades.numIngredientes === 0) {
      console.log('⏭️ Saltando procesamiento de plato con datos por defecto');
      return;
    }
    
    // Solo procesar si es un plato diferente (pero permitir re-procesamiento si es necesario)
    if (lastProcessedPlatoId.current === platoId) {
      console.log('⚪ Plato ya procesado, saltando:', platoId);
      return;
    }
    
    console.log('🍽️ Procesando plato reactivo:', { 
      nombre: platoPropiedades.nombre, 
      receta: platoPropiedades.recetaId !== 'no-recipe' ? 'Sí' : 'No',
      ingredientes: platoPropiedades.numIngredientes,
      platoId: platoId
    });
    lastProcessedPlatoId.current = platoId;
    
    // Actualizar formData solo cuando realmente cambie
    setFormData({
      ...plato,
      nombre: plato.nombre || '',
      ingredientesPersonalizados: plato.ingredientesPersonalizados || []
    });

    // Cargar ingredientes según prioridad
    if (platoPropiedades.tieneIngredientesPersonalizados && plato.ingredientesPersonalizados) {
      cargarIngredientesPersonalizados(plato.ingredientesPersonalizados);
    } else if (plato.receta) {
      cargarIngredientesDeReceta(plato.receta);
    } else {
      setIngredientes([]);
      setIngredientesReceta([]);
    }
  }, [platoPropiedades]);

  // Limpiar el ref cuando se desmonta el componente
  useEffect(() => {
    return () => {
      console.log('🧹 Limpiando componente PlatoFormConIngredientes');
      lastProcessedPlatoId.current = null;
      isLoadingIngredients.current = false;
    };
  }, []);


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
    console.log('🏋️ Actualizando peso del ingrediente:', { index, nuevoPeso });
    
    // Forzar re-render de la interfaz
    setForceRender(prev => prev + 1);
    
    // Actualizar el array de ingredientes con el nuevo peso
    const newIngredientes = [...ingredientes];
    if (newIngredientes[index]) {
      newIngredientes[index] = {
        ...newIngredientes[index],
        peso: nuevoPeso
      };
      setIngredientes(newIngredientes);
      setIngredientesReceta(newIngredientes);
    }



    console.log('🎯 Peso actualizado localmente:', {
      index,
      nuevoPeso,
      nombreIngrediente: newIngredientes[index]?.nombre
    });
    
    // NOTA: No actualizar reactivamente - solo al guardar
    console.log('📝 Peso actualizado solo localmente - se aplicará al guardar');
  };

  const removeIngredienteReceta = (index: number) => {
    setIngredientesReceta(ingredientesReceta.filter((_, i) => i !== index));
  };

  const handleSelectReceta = (recetaId: string) => {
    // Evitar actualizaciones innecesarias si la receta ya está seleccionada
    if (formData.receta === recetaId) {
      return;
    }
    
    const recetaSeleccionada = recetas.find(r => r._id === recetaId);
    
    if (recetaSeleccionada) {
      console.log(`🎯 Seleccionando receta: "${recetaSeleccionada.nombreReceta}"`);
      
      // Convertir y cargar los ingredientes de la receta
      const ingredientesConvertidos = convertirIngredientesReceta(recetaSeleccionada);
      
      // Crear ingredientes personalizados actualizados
      const ingredientesPersonalizadosActualizados = ingredientesConvertidos
        .filter(ing => ing.id || ing.codigoBarras)
        .map(ing => ({
          ingrediente: ing.id || ing.codigoBarras || '',
          peso: ing.peso || 100
        }));
      
      // Actualizar el formData con todos los cambios de una vez
      const nuevoFormData = {
        ...formData,
        nombre: recetaSeleccionada.nombreReceta,
        receta: recetaId,
        ingredientesPersonalizados: ingredientesPersonalizadosActualizados
      };
      
      // Actualizar todos los estados internos
      setFormData(nuevoFormData);
      setIngredientes(ingredientesConvertidos);
      setIngredientesReceta(ingredientesConvertidos);
      
      // Limpiar el error de validación cuando se selecciona una receta
      if (errors.ingredientes) {
        setErrors(prev => ({
          ...prev,
          ingredientes: ''
        }));
      }
      
      console.log(`✅ Formulario actualizado: "${recetaSeleccionada.nombreReceta}" con ${ingredientesConvertidos.length} ingredientes`);
      
      // Notificar al padre sobre el cambio de receta para vista previa
      if (onUpdate) {
        onUpdate(nuevoFormData);
      }
    }
  };

  const handleClearReceta = () => {
    const nuevoFormData = {
      ...formData,
      receta: null,
      nombre: '', // Limpiar también el nombre del plato
      ingredientesPersonalizados: [] // Limpiar ingredientes del plato
    };
    
    // Actualizar todos los estados de una vez para evitar bucles
    setFormData(nuevoFormData);
    setIngredientesReceta([]);
    setIngredientes([]);
    
    // Notificar al padre sobre el cambio para vista previa
    if (onUpdate) {
      onUpdate(nuevoFormData);
    }
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

            {/* Ingredientes del plato con pesos editables */}
            {ingredientes.length > 0 ? (
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Ingredientes del plato ({ingredientes.length})
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  {formData.receta 
                    ? "Modifica los pesos según las porciones que deseas para este plato. No puedes eliminar ingredientes cuando hay una receta seleccionada."
                    : "Modifica los pesos según las porciones que deseas para este plato."
                  }
                </Text>

                <Stack gap="sm">
                  {ingredientes.map((ingrediente, index) => {
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
                                key={`peso-${index}-${ingrediente.peso}-${ingrediente.id || ingrediente.nombre}-${forceRender}`}
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
                              disabled={!!formData.receta}
                              onClick={() => removeIngredienteReceta(index)}
                              title={formData.receta ? "No se pueden eliminar ingredientes cuando hay una receta seleccionada" : "Eliminar ingrediente"}
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
                {ingredientes.length > 0 && (
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
                        const totales = ingredientes.reduce((acc, ing) => {
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
            ) : (
              <Box>
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No hay ingredientes cargados para este plato.
                </Text>
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

// Comparador personalizado para memo que compara propiedades relevantes
const arePropsEqual = (prevProps: PlatoFormConIngredientesProps, nextProps: PlatoFormConIngredientesProps) => {
  // Comparar plato por propiedades individuales en lugar de referencia del objeto
  const prevPlato = prevProps.plato;
  const nextPlato = nextProps.plato;
  
  const prevRecetaId = prevPlato.receta || null;
  const nextRecetaId = nextPlato.receta || null;
  
  return (
    prevPlato._id === nextPlato._id &&
    prevPlato.nombre === nextPlato.nombre &&
    prevRecetaId === nextRecetaId &&
    (prevPlato.ingredientesPersonalizados?.length || 0) === (nextPlato.ingredientesPersonalizados?.length || 0) &&
    prevProps.onSave === nextProps.onSave &&
    prevProps.onCancel === nextProps.onCancel &&
    prevProps.onUpdate === nextProps.onUpdate
  );
};

export default memo(PlatoFormConIngredientes, arePropsEqual);
