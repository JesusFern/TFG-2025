import React, { useState, useEffect } from 'react';
import {
  Modal,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Rating,
  Box,
  LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconChefHat, IconBarbell } from '@tabler/icons-react';
import { 
  Valoracion, 
  CrearValoracionDTO, 
  ActualizarValoracionDTO, 
  TipoTrabajador,
  TipoTrabajadorDisponible
} from '../../types/valoraciones';
import { ValoracionService } from '../../services/valoracionService';

interface ValoracionFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: (valoracion: Valoracion) => void;
  trabajadorId: string;
  trabajadorName: string;
  valoracion?: Valoracion; // Si está presente, es edición
  tiposDisponibles?: TipoTrabajadorDisponible[];
}

const ValoracionForm: React.FC<ValoracionFormProps> = ({
  opened,
  onClose,
  onSuccess,
  trabajadorId,
  trabajadorName,
  valoracion,
  tiposDisponibles = []
}) => {
  const isEditing = !!valoracion;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CrearValoracionDTO>({
    initialValues: {
      trabajadorId,
      calificacion: valoracion?.calificacion || 5,
      descripcion: valoracion?.descripcion || '',
      tipoTrabajador: valoracion?.tipoTrabajador || 'Nutricionista',
      fechaValoracion: new Date().toISOString() // Siempre fecha actual
    },
    validate: {
      calificacion: (value) => (value < 1 || value > 5 ? 'La calificación debe estar entre 1 y 5' : null),
      descripcion: (value) => {
        if (!value || value.trim().length < 10) {
          return 'La descripción debe tener al menos 10 caracteres';
        }
        if (value.length > 500) {
          return 'La descripción no puede tener más de 500 caracteres';
        }
        return null;
      },
      tipoTrabajador: (value) => (!value ? 'Debe seleccionar un tipo de trabajador' : null)
    }
  });

  // Filtrar tipos disponibles que se pueden valorar
  const tiposValorables = tiposDisponibles.filter(tipo => tipo.puedeValorar);
  
  console.log('ValoracionForm - tiposDisponibles:', tiposDisponibles);
  console.log('ValoracionForm - tiposValorables:', tiposValorables);

  useEffect(() => {
    if (opened) {
      form.reset();
      // Establecer fecha actual automáticamente
      form.setFieldValue('fechaValoracion', new Date().toISOString());
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleSubmit = async (values: CrearValoracionDTO) => {
    try {
      setLoading(true);
      setError(null);

      let result: Valoracion;
      
      if (isEditing) {
        const updateData: ActualizarValoracionDTO = {
          calificacion: values.calificacion,
          descripcion: values.descripcion,
          fechaValoracion: values.fechaValoracion
        };
        result = await ValoracionService.actualizarValoracion(valoracion._id, updateData);
      } else {
        result = await ValoracionService.crearValoracion(values);
      }

      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la valoración');
    } finally {
      setLoading(false);
    }
  };

  const getTipoTrabajadorIcon = (tipo: TipoTrabajador) => {
    return tipo === 'Nutricionista' ? IconChefHat : IconBarbell;
  };


  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text size="lg" fw={600}>
            {isEditing ? 'Editar Valoración' : 'Nueva Valoración'}
          </Text>
          <Text size="sm" c="dimmed">
            para {trabajadorName}
          </Text>
        </Group>
      }
      size="md"
      centered
    >
      <Box pos="relative">
        <LoadingOverlay visible={loading} />
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
                variant="light"
              >
                {error}
              </Alert>
            )}

            {/* Tipo de trabajador */}
            <Select
              label="Tipo de trabajador"
              placeholder="Selecciona el tipo de trabajo a valorar"
              data={tiposValorables.map(tipo => ({
                value: tipo.tipo,
                label: tipo.tipo,
                disabled: tipo.yaValorado
              }))}
              leftSection={React.createElement(getTipoTrabajadorIcon(form.values.tipoTrabajador), { size: 16 })}
              {...form.getInputProps('tipoTrabajador')}
              disabled={isEditing} // No se puede cambiar el tipo al editar
              comboboxProps={{ zIndex: 3000 }}
            />

            {/* Calificación */}
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Calificación
              </Text>
              <Group gap="md" align="center">
                <Rating
                  value={form.values.calificacion}
                  onChange={(value) => form.setFieldValue('calificacion', value || 5)}
                  size="lg"
                  color="yellow"
                />
                <Text size="sm" c="dimmed">
                  {form.values.calificacion}/5
                </Text>
              </Group>
            </Box>


            {/* Descripción */}
            <Textarea
              label="Descripción"
              placeholder="Describe tu experiencia con este profesional..."
              minRows={4}
              maxRows={6}
              {...form.getInputProps('descripcion')}
              description={`${form.values.descripcion.length}/500 caracteres`}
            />

            {/* Botones */}
            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={!form.isValid()}
              >
                {isEditing ? 'Actualizar' : 'Crear'} Valoración
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default ValoracionForm;
