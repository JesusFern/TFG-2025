import React, { useState } from 'react';
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  LoadingOverlay,
  Box
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../../hooks/useAuth';
import { Ingrediente } from '../../../types/diets';

interface CrearIngredienteFormProps {
  onIngredienteCreado: (ingrediente: Ingrediente) => void;
  onCancel?: () => void;
}

const CrearIngredienteForm: React.FC<CrearIngredienteFormProps> = ({
  onIngredienteCreado,
  onCancel
}) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    calorias: 0,
    proteinas: 0,
    grasas: 0,
    hidratosCarbono: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario modifica
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del ingrediente es obligatorio';
    }

    if (formData.calorias < 0 || formData.calorias > 10000) {
      newErrors.calorias = 'Las calorías deben estar entre 0 y 10000 kcal por 100g';
    }

    if (formData.proteinas < 0 || formData.proteinas > 100) {
      newErrors.proteinas = 'Las proteínas deben estar entre 0 y 100g por 100g';
    }

    if (formData.grasas < 0 || formData.grasas > 100) {
      newErrors.grasas = 'Las grasas deben estar entre 0 y 100g por 100g';
    }

    if (formData.hidratosCarbono < 0 || formData.hidratosCarbono > 100) {
      newErrors.hidratosCarbono = 'Los hidratos de carbono deben estar entre 0 y 100g por 100g';
    }

    // Verificar que la suma de macronutrientes no exceda 100%
    const sumaMacronutrientes = formData.proteinas + formData.grasas + formData.hidratosCarbono;
    if (sumaMacronutrientes > 100) {
      newErrors.macronutrientes = 'La suma de proteínas, grasas e hidratos de carbono no puede exceder 100g por 100g';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Iniciando creación de ingrediente...');
    
    if (!validateForm()) {
      console.log('❌ Validación falló');
      return;
    }

    if (!user?._id) {
      console.log('❌ Usuario no identificado');
      setErrors({ general: 'No se pudo identificar al usuario' });
      return;
    }

    console.log('📝 Datos del formulario:', formData);
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/ingredientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...formData,
          fuente: 'Trabajador',
          creador: user._id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ingrediente creado exitosamente:', data);
        setSuccessMessage('Ingrediente creado exitosamente');
        
        // Convertir el ingrediente al formato esperado por el PlatoForm
        const ingredienteFormateado: Ingrediente = {
          nombre: data.ingrediente.nombre,
          peso: 100, // Peso por defecto
          informacionNutricional: {
            calorias: data.ingrediente.calorias,
            proteinas: data.ingrediente.proteinas,
            carbohidratos: data.ingrediente.hidratosCarbono,
            grasas: data.ingrediente.grasas,
            fibra: 0,
            azucares: 0,
            sal: 0,
            sodio: 0
          },
          marca: '',
          imagenIngrediente: '',
          fuente: 'Trabajador',
          id: String(data.ingrediente._id)
        };

        console.log('📦 Ingrediente formateado:', ingredienteFormateado);

        setTimeout(() => {
          console.log('🔄 Llamando a onIngredienteCreado...');
          onIngredienteCreado(ingredienteFormateado);
          // Resetear formulario
          setFormData({
            nombre: '',
            calorias: 0,
            proteinas: 0,
            grasas: 0,
            hidratosCarbono: 0
          });
          setSuccessMessage('');
        }, 1500);
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Error al crear el ingrediente' });
      }
    } catch (error) {
      console.error('Error al crear ingrediente:', error);
      setErrors({ general: 'Error de conexión al crear el ingrediente' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      
      {successMessage && (
        <Alert
          icon={<IconCheck size={16} />}
          title="¡Éxito!"
          color="green"
          mb="md"
        >
          {successMessage}
        </Alert>
      )}

      {errors.general && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
        >
          {errors.general}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" fw={500} mb="xs">
            Información nutricional por 100g
          </Text>
          
          <TextInput
            label="Nombre del ingrediente"
            placeholder="Ej: Pechuga de pollo"
            required
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            error={errors.nombre}
          />

          <NumberInput
            label="Calorías (kcal)"
            placeholder="0"
            min={0}
            max={10000}
            value={formData.calorias}
            onChange={(value) => handleInputChange('calorias', Number(value) || 0)}
            error={errors.calorias}
            rightSection={<Text size="xs" c="dimmed">kcal</Text>}
          />

          <NumberInput
            label="Proteínas (g)"
            placeholder="0"
            min={0}
            max={100}
            value={formData.proteinas}
            onChange={(value) => handleInputChange('proteinas', Number(value) || 0)}
            error={errors.proteinas}
            rightSection={<Text size="xs" c="dimmed">g</Text>}
          />

          <NumberInput
            label="Grasas (g)"
            placeholder="0"
            min={0}
            max={100}
            value={formData.grasas}
            onChange={(value) => handleInputChange('grasas', Number(value) || 0)}
            error={errors.grasas}
            rightSection={<Text size="xs" c="dimmed">g</Text>}
          />

          <NumberInput
            label="Hidratos de carbono (g)"
            placeholder="0"
            min={0}
            max={100}
            value={formData.hidratosCarbono}
            onChange={(value) => handleInputChange('hidratosCarbono', Number(value) || 0)}
            error={errors.hidratosCarbono}
            rightSection={<Text size="xs" c="dimmed">g</Text>}
          />

          {errors.macronutrientes && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="orange"
              variant="light"
            >
              {errors.macronutrientes}
            </Alert>
          )}

          <Group justify="flex-end" gap="sm" mt="md">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                color="gray"
                size="sm"
                type="button"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              color="nutroos-green"
              size="sm"
              loading={loading}
              onClick={handleSubmit}
            >
              Crear ingrediente
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
};

export default CrearIngredienteForm;
