import React, { useState } from 'react';
import { 
  Button, 
  Group,  
  Select, 
  Stack, 
  TextInput, 
  Textarea, 
  Switch, 
  Alert, 
  Box,
  Text
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import trainingService from '../../../services/trainingService';
import type { CrearEjercicioDTO, Ejercicio } from '../../../types/training';
import { useExerciseOptions, generateSlugFromName } from '../../../hooks/useExerciseOptions';

interface FormularioCrearEjercicioProps {
  onSuccess: (ejercicioData: { _id: string }) => void;
  onError: (error: Error) => void;
}

const FormularioCrearEjercicio: React.FC<FormularioCrearEjercicioProps> = ({ 
  onSuccess, 
  onError
}) => {
  // Usar el hook para las opciones de los Selects
  const { nivelesDificultad, tiposEjercicio } = useExerciseOptions();
  const [form, setForm] = useState<CrearEjercicioDTO>({
    nombre: '',
    slug: '',
    descripcion: '',
    grupoMuscular: '',
    equipamiento: '',
    nivelDificultad: 'Intermedio',
    tipoEjercicio: 'Fuerza',
    instrucciones: '',
    videoDemostrativo: '',
    publico: false,
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof Ejercicio, value: unknown) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Si cambia el nombre, generar el slug automáticamente
      if (field === 'nombre' && typeof value === 'string') {
        newForm.slug = generateSlugFromName(value);
      }
      
      return newForm;
    });
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!form.nombre.trim()) { 
      setFormError('El nombre del ejercicio es obligatorio'); 
      return; 
    }
    if (!form.grupoMuscular.trim()) { 
      setFormError('El grupo muscular es obligatorio'); 
      return; 
    }
    if (!form.tipoEjercicio.trim()) { 
      setFormError('El tipo de ejercicio es obligatorio'); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      const payload = { 
        ...form, 
        slug: generateSlugFromName(form.nombre) 
      } as CrearEjercicioDTO;
      const data = await trainingService.crearEjercicio(payload);
      onSuccess({ _id: data._id || '' });
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      {formError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error" 
            color="red" 
            mb="md" 
            withCloseButton 
            onClose={() => setFormError(null)} 
            variant="filled"
          >
            {formError}
          </Alert>
        </motion.div>
      )}

      <Stack gap="sm">
        <TextInput 
          label="Nombre" 
          value={form.nombre} 
          onChange={(e) => handleChange('nombre', e.currentTarget.value)} 
          required 
        />
        {form.nombre && (
          <Text size="sm" c="dimmed">
            <strong>Slug generado:</strong> {generateSlugFromName(form.nombre)}
          </Text>
        )}
        <Textarea 
          label="Descripción" 
          value={form.descripcion} 
          onChange={(e) => handleChange('descripcion', e.currentTarget.value)} 
          minRows={3} 
        />
        <TextInput 
          label="Grupo muscular" 
          value={form.grupoMuscular} 
          onChange={(e) => handleChange('grupoMuscular', e.currentTarget.value)} 
          required
        />
        <TextInput 
          label="Equipamiento" 
          value={form.equipamiento} 
          onChange={(e) => handleChange('equipamiento', e.currentTarget.value)} 
        />
        <Group grow>
          <Select 
            label="Dificultad" 
            data={nivelesDificultad} 
            value={form.nivelDificultad} 
            onChange={(v) => handleChange('nivelDificultad', v || 'Intermedio')} 
          />
          <Select 
            label="Tipo de ejercicio" 
            data={tiposEjercicio} 
            value={form.tipoEjercicio} 
            onChange={(v) => handleChange('tipoEjercicio', v || 'Fuerza')} 
            required
          />
        </Group>
        <Textarea 
          label="Instrucciones" 
          value={form.instrucciones || ''} 
          onChange={(e) => handleChange('instrucciones', e.currentTarget.value)} 
          minRows={3}
          placeholder="Instrucciones detalladas para realizar el ejercicio..."
        />
        <TextInput 
          label="Video demostrativo (URL)" 
          value={form.videoDemostrativo || ''} 
          onChange={(e) => handleChange('videoDemostrativo', e.currentTarget.value)} 
          placeholder="https://www.youtube.com/embed/..."
        />
        <Switch 
          label="Público" 
          checked={(form as unknown as { publico?: boolean }).publico || false} 
          onChange={(e) => handleChange('publico' as unknown as keyof Ejercicio, e.currentTarget.checked)} 
        />
        
        <Group justify="flex-end" mt="md">
          <Button 
            variant="default" 
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => void handleSubmit()}
            loading={isSubmitting}
            color="nutroos-green"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
};

export default FormularioCrearEjercicio;
