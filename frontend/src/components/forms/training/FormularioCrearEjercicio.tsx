import React, { useState } from 'react';
import { 
  Button, 
  Group, 
  NumberInput, 
  Select, 
  Stack, 
  TextInput, 
  Textarea, 
  Switch, 
  Alert, 
  Box
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import trainingService from '../../../services/trainingService';
import type { CrearEjercicioDTO, Ejercicio } from '../../../types/training';

interface FormularioCrearEjercicioProps {
  onSuccess: (ejercicioData: { _id: string }) => void;
  onError: (error: Error) => void;
}

const dificultadOptions = ['Principiante', 'Intermedio', 'Avanzado'].map(v => ({ value: v, label: v }));
const intensidadOptions = ['Baja', 'Media', 'Alta'].map(v => ({ value: v, label: v }));

const FormularioCrearEjercicio: React.FC<FormularioCrearEjercicioProps> = ({ 
  onSuccess, 
  onError
}) => {
  const [form, setForm] = useState<CrearEjercicioDTO>({
    nombre: '',
    descripcion: '',
    grupoMuscular: '',
    equipamiento: '',
    series: 3,
    repeticiones: 10,
    tiempoDescanso: 60,
    nivelDificultad: 'Intermedio',
    nivelIntensidad: 'Media',
    videoDemostrativo: '',
    publico: false,
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof Ejercicio, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
    if (!form.series || form.series < 1) { 
      setFormError('Las series deben ser al menos 1'); 
      return; 
    }
    if (!form.repeticiones || form.repeticiones < 1) { 
      setFormError('Las repeticiones deben ser al menos 1'); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      const payload = { ...form } as CrearEjercicioDTO;
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
        />
        <TextInput 
          label="Equipamiento" 
          value={form.equipamiento} 
          onChange={(e) => handleChange('equipamiento', e.currentTarget.value)} 
        />
        <Group grow>
          <NumberInput 
            label="Series" 
            value={form.series} 
            onChange={(v) => handleChange('series', v || 0)} 
            min={1} 
          />
          <NumberInput 
            label="Repeticiones" 
            value={form.repeticiones} 
            onChange={(v) => handleChange('repeticiones', v || 0)} 
            min={1} 
          />
          <NumberInput 
            label="Descanso (s)" 
            value={form.tiempoDescanso} 
            onChange={(v) => handleChange('tiempoDescanso', v || 0)} 
            min={0} 
          />
        </Group>
        <Group grow>
          <Select 
            label="Dificultad" 
            data={dificultadOptions} 
            value={form.nivelDificultad} 
            onChange={(v) => handleChange('nivelDificultad', v || 'Intermedio')} 
          />
          <Select 
            label="Intensidad" 
            data={intensidadOptions} 
            value={form.nivelIntensidad} 
            onChange={(v) => handleChange('nivelIntensidad', v || 'Media')} 
          />
        </Group>
        <TextInput 
          label="Video demostrativo (URL)" 
          value={form.videoDemostrativo || ''} 
          onChange={(e) => handleChange('videoDemostrativo', e.currentTarget.value)} 
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
