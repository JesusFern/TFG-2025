import React, { useState, useEffect } from 'react';
import { 
  TextInput, 
  Group, 
  Button, 
  Select, 
  Box,
  Grid,
  Text,
  useMantineColorScheme,
  Loader
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
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

  useEffect(() => {
    const fetchRecetas = async () => {
      if (searchTerm.length < 2) return;
      
      try {
        setLoading(true);
        const resultados = await buscarRecetas(searchTerm);
        setRecetas(resultados);
      } catch (error) {
        console.error("Error al buscar recetas:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchRecetas();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

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
  }, [plato]);

  const handleSelectReceta = (recetaId: string) => {
    const recetaSeleccionada = recetas.find(r => r._id === recetaId);
    
    if (recetaSeleccionada) {
      setFormData({
        ...formData,
        nombre: recetaSeleccionada.nombreReceta,
        receta: recetaId
      });
    }
  };

  const recetaOptions = recetas.map(receta => ({
    value: receta._id || '',
    label: receta.nombreReceta,
    group: receta.ingredientes?.length ? `${receta.ingredientes.length} ingredientes` : 'Sin ingredientes'
  }));

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
            mb="md"
          />
        </Grid.Col>
        
        {/* El orden se maneja implícitamente basado en la posición en el array */}
        
        <Grid.Col span={12}>
          <Text size="sm" fw={500} mb={5}>Seleccionar receta (opcional)</Text>
          <Select
            placeholder="Buscar recetas..."
            searchable
            clearable
            error={searchTerm.length >= 2 && recetas.length === 0 ? "No se encontraron recetas" : searchTerm.length > 0 && searchTerm.length < 2 ? "Escribe al menos 2 caracteres" : undefined}
            onSearchChange={setSearchTerm}
            data={recetaOptions}
            value={formData.receta || null}
            onChange={(value) => value && handleSelectReceta(value)}
            leftSection={<IconSearch size={16} />}
            mb="md"
            style={{ flexGrow: 1 }}
            rightSection={loading ? <Loader size="xs" /> : undefined}
          />
        </Grid.Col>
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