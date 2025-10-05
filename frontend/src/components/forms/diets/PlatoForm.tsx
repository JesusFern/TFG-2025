import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TextInput, 
  Group, 
  Button,
  Box,
  Grid,
  Text,
  useMantineColorScheme,
  Loader,
  Combobox,
  useCombobox,
  InputBase,
  Tabs
} from '@mantine/core';
import { IconSearch, IconX, IconPlus } from '@tabler/icons-react';
import { Plato, Receta, Ingrediente } from '../../../types';
import { buscarRecetas } from '../../../services/dietService';
import { obtenerIngredientes } from '../../../services/ingredienteService';
import CrearIngredienteForm from './CrearIngredienteForm';

interface PlatoFormProps {
  plato: Plato;
  onSave: (plato: Plato) => void;
  onCancel: () => void;
}

const PlatoForm: React.FC<PlatoFormProps> = ({ plato, onSave, onCancel }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [formData, setFormData] = useState<Plato>(plato);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [recetaCompleta, setRecetaCompleta] = useState<Receta | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string | null>('buscar');
  
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  // Asegurar que recetas siempre sea un array válido
  const safeRecetas = useMemo(() => Array.isArray(recetas) ? recetas : [], [recetas]);

  // Función para cargar recetas iniciales al hacer clic
  const fetchInitialRecetas = useCallback(async () => {
    if (hasSearched) return; // No recargar si ya se buscó
    
    try {
      setLoading(true);
      const resultados = await buscarRecetas(''); // Buscar todas las recetas
      setRecetas(resultados.slice(0, 5));
      setHasSearched(true);
    } catch (error) {
      console.error("Error al cargar recetas iniciales:", error);
      setRecetas([]);
    } finally {
      setLoading(false);
    }
  }, [hasSearched]);

  // Función para buscar con término específico
  const fetchRecetas = async (termino: string) => {
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
  };

  // Función para cargar la receta completa si el plato ya tiene una receta
  const cargarRecetaCompleta = async (recetaId: string) => {
    try {
      setLoading(true);
      const todasLasRecetas = await buscarRecetas('');
      const receta = todasLasRecetas.find(r => r._id === recetaId);
      if (receta) {
        setRecetaCompleta(receta);
        setRecetas(todasLasRecetas.slice(0, 5));
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Error al cargar receta completa:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchRecetas(searchTerm);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else if (searchTerm.length === 0 && hasSearched) {
      // Si se borró el término, volver a las recetas iniciales
      fetchInitialRecetas();
    }
  }, [searchTerm, hasSearched, fetchInitialRecetas]);

  const handleChange = <K extends keyof Plato>(key: K, value: Plato[K]) => {
    setFormData({
      ...formData,
      [key]: value
    });
  };

  useEffect(() => {
    setFormData({
      ...plato,
      nombre: plato.nombre || ''
    });
    
    // Si el plato tiene una receta, cargar los datos de la receta
    if (plato.receta && !hasSearched) {
      cargarRecetaCompleta(plato.receta);
    }
    
    // Cargar ingredientes para mostrar los ingredientes del plato
    const cargarIngredientes = async () => {
      try {
        const ingredientesData = await obtenerIngredientes();
        setIngredientes(ingredientesData);
      } catch (error) {
        console.error("Error al cargar ingredientes:", error);
      }
    };
    
    cargarIngredientes();
  }, [plato, hasSearched]);

  const handleSelectReceta = (recetaId: string) => {
    const recetaSeleccionada = safeRecetas.find(r => r._id === recetaId);
    
    if (recetaSeleccionada) {
      setFormData({
        ...formData,
        nombre: recetaSeleccionada.nombreReceta,
        receta: recetaId
      });
    }
  };

  const handleClearReceta = () => {
    setFormData({
      ...formData,
      receta: null,
      nombre: '' // Limpiar también el nombre del plato
    });
  };

  const handleIngredienteCreado = (ingrediente: any) => {
    // Agregar el ingrediente creado a la lista
    setIngredientes(prev => [...prev, ingrediente]);
    
    // Cambiar al tab de buscar para mostrar el ingrediente agregado
    setActiveTab('buscar');
  };

  // Obtener la receta seleccionada para mostrar sus detalles
  const recetaSeleccionada = formData.receta ? 
    (recetaCompleta || safeRecetas.find(r => r._id === formData.receta)) || 
    (plato.receta === formData.receta ? { 
      _id: formData.receta, 
      nombreReceta: formData.nombre || 'Receta seleccionada',
      ingredientes: [],
      tiempoPreparacion: '',
      publica: false
    } : null) : null;

  // Preparar las opciones de manera más robusta - estructura simple para Mantine
  const recetaOptions = React.useMemo(() => {
    try {
      if (safeRecetas.length === 0) {
        return [];
      }
      
      // Crear estructura simple sin grupos para evitar errores de Mantine
      return safeRecetas.map(receta => {
        const label = `${receta.nombreReceta} ${receta.publica ? '(Pública)' : '(Privada)'}`;
        return {
          value: String(receta._id || ''),
          label: String(label)
        };
      }).filter(option => option.value && option.label);
    } catch (error) {
      console.error('Error al preparar opciones de recetas:', error);
      return [];
    }
  }, [safeRecetas]);

  const handleComboboxToggle = () => {
    combobox.toggleDropdown();
    if (!hasSearched) {
      fetchInitialRecetas();
    }
  };

  return (
    <Box>
      <Grid>
        <Grid.Col span={12}>
          <TextInput
            label="Nombre del plato"
            placeholder="Ej: Ensalada de quinoa"
            required
            value={formData.nombre || ''}
            onChange={(e) => handleChange('nombre', e.target.value)}
            disabled={!!formData.receta}
            mb="md"
            description={formData.receta ? "El nombre está bloqueado porque hay una receta seleccionada" : undefined}
          />
        </Grid.Col>
        
        {/* El orden se maneja implícitamente basado en la posición en el array */}
        
        <Grid.Col span={12}>
          <Text size="sm" fw={500} mb={5}>Seleccionar receta (opcional)</Text>
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
                    <Box
                      style={{ 
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--mantine-color-gray-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s ease'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearReceta();
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-3)';
                      }}
                    >
                      <IconX size={14} />
                    </Box>
                  ) : (
                    <IconSearch size={16} />
                  )
                }
                rightSectionPointerEvents="all"
                onClick={handleComboboxToggle}
                mb="md"
                style={{ flexGrow: 1 }}
              >
                {formData.receta ? 
                  safeRecetas.find(r => r._id === formData.receta)?.nombreReceta || 'Seleccionar receta...' 
                  : 'Buscar recetas...'
                }
              </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Search
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                placeholder="Buscar recetas..."
                leftSection={<IconSearch size={16} />}
                rightSection={loading ? <Loader size="xs" /> : undefined}
              />
              <Combobox.Options>
                {recetaOptions.length === 0 ? (
                  <Combobox.Empty>
                    {loading ? 'Cargando...' : 'No se encontraron recetas'}
                  </Combobox.Empty>
                ) : (
                  recetaOptions.map((option) => (
                    <Combobox.Option value={option.value} key={option.value}>
                      {option.label}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </Grid.Col>

        {/* Mostrar información de la receta y ingredientes del plato */}
        {recetaSeleccionada && (
          <Grid.Col span={12}>
            <Box
              p="md"
              style={{
                backgroundColor: isDark ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-blue-0)',
                border: '1px solid var(--mantine-color-blue-3)',
                borderRadius: 'var(--mantine-radius-md)'
              }}
            >
              <Text fw={500} mb="xs" c="blue.6">
                Receta seleccionada: {recetaSeleccionada.nombreReceta}
              </Text>
              
              {recetaSeleccionada.tiempoPreparacion && (
                <Text size="sm" c="dimmed" mb="md">
                  Tiempo: {recetaSeleccionada.tiempoPreparacion}
                </Text>
              )}

              <Text size="xs" c="dimmed" mb="md">
                {recetaSeleccionada.publica ? 'Receta pública' : 'Mi receta privada'}
              </Text>
            </Box>
          </Grid.Col>
        )}

        {/* Mostrar ingredientes del plato */}
        {formData.ingredientesPersonalizados && formData.ingredientesPersonalizados.length > 0 && (
          <Grid.Col span={12}>
            <Box
              p="md"
              style={{
                backgroundColor: isDark ? 'var(--mantine-color-green-9)' : 'var(--mantine-color-green-0)',
                border: '1px solid var(--mantine-color-green-3)',
                borderRadius: 'var(--mantine-radius-md)'
              }}
            >
              <Text fw={500} mb="xs" c="green.6">
                Ingredientes del plato ({formData.ingredientesPersonalizados.length}):
              </Text>
              
              {formData.ingredientesPersonalizados.map((ingredientePlato, index) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ingrediente = ingredientes.find(ing => (ing as any)._id === ingredientePlato.ingrediente);
                return (
                  <Box key={index} mb="xs" p="xs" style={{
                    backgroundColor: isDark ? 'var(--mantine-color-green-8)' : 'var(--mantine-color-green-1)',
                    borderRadius: 'var(--mantine-radius-sm)'
                  }}>
                    <Text size="sm" fw={500}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {ingrediente ? (ingrediente as any).nombre : `Ingrediente ${index + 1}`}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Peso: {ingredientePlato.peso}g
                    </Text>
                    {ingrediente && (
                      <Text size="xs" c="dimmed">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        Calorías: {Math.round(((ingrediente as any).calorias * ingredientePlato.peso) / 100)} kcal
                      </Text>
                    )}
                  </Box>
                );
              })}
              
              <Text size="xs" c="dimmed" mt="xs">
                Este plato está asociado a la receta "{recetaSeleccionada?.nombreReceta || ''}". Puedes modificar los pesos de los ingredientes para este plato específico.
              </Text>
            </Box>
          </Grid.Col>
        )}
      </Grid>
      
      <Group justify="right" mt="lg">
        <Button variant="outline" onClick={onCancel} color={isDark ? "gray" : "dark"}>
          Cancelar
        </Button>
        <Button 
          onClick={() => {
            // Si el nombre está vacío, guardar como null
            const platoToSave = {
              ...formData,
              nombre: formData.nombre && formData.nombre.trim() !== '' ? formData.nombre : null
            };
            onSave(platoToSave);
          }}
          color="nutroos-green"
          // Permitir guardar solo si hay un nombre no vacío
          disabled={!formData.nombre || formData.nombre.trim() === ''}
        >
          Guardar plato
        </Button>
      </Group>
    </Box>
  );
};

export default PlatoForm;