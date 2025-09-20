import React, { useState, useEffect } from 'react';
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
  InputBase
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Plato, Receta } from '../../../types';
import { buscarRecetas } from '../../../services/dietService';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  // Asegurar que recetas siempre sea un array válido
  const safeRecetas = Array.isArray(recetas) ? recetas : [];

  // Función para cargar recetas iniciales al hacer clic
  const fetchInitialRecetas = async () => {
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
  };

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
  }, [searchTerm, hasSearched]);

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
      fetchInitialRecetas();
    }
  }, [plato]);

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

  // Obtener la receta seleccionada para mostrar sus detalles
  const recetaSeleccionada = formData.receta ? 
    safeRecetas.find(r => r._id === formData.receta) || 
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

        {/* Mostrar detalles de la receta seleccionada */}
        {recetaSeleccionada && (
          <Grid.Col span={12}>
            <Box
              p="md"
              style={{
                backgroundColor: 'var(--mantine-color-gray-0)',
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: 'var(--mantine-radius-md)'
              }}
            >
              <Text fw={500} mb="xs" c="nutroos-green.6">
                Receta seleccionada: {recetaSeleccionada.nombreReceta}
              </Text>
              
              {recetaSeleccionada.ingredientes && recetaSeleccionada.ingredientes.length > 0 && (
                <Box mb="xs">
                  <Text size="sm" fw={500} mb={4}>
                    Ingredientes ({recetaSeleccionada.ingredientes.length}):
                  </Text>
                  <Text size="sm" c="dimmed">
                    {recetaSeleccionada.ingredientes.slice(0, 3).join(', ')}
                    {recetaSeleccionada.ingredientes.length > 3 && '...'}
                  </Text>
                </Box>
              )}

              {recetaSeleccionada.tiempoPreparacion && (
                <Text size="sm" c="dimmed">
                  Tiempo: {recetaSeleccionada.tiempoPreparacion}
                </Text>
              )}

              <Text size="xs" c="dimmed" mt="xs">
                {recetaSeleccionada.publica ? 'Receta pública' : 'Mi receta privada'}
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