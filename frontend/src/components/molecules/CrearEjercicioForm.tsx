import React, { useState } from 'react';
import {
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Switch,
  Button,
  Stack,
  Text,
  Alert,
  Group,
  Grid,
  Divider,
  Checkbox
} from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import type { Ejercicio, CrearEjercicioDTO } from '../../types/training';
import type { EjercicioSesion, OpcionesProgresion } from '../../types/trainingCommon';
import { trainingService } from '../../services/trainingService';
import { useExerciseOptions } from '../../hooks/useExerciseOptions';
import { OPCIONES_PROGRESION_DEFAULT } from '../../constants/training';

interface CrearEjercicioFormProps {
  onEjercicioCreado: (ejercicio: Ejercicio) => void;
  onAddEjercicio: (ejercicio: EjercicioSesion) => void;
  siguienteOrden: number;
}

const CrearEjercicioForm: React.FC<CrearEjercicioFormProps> = ({ 
  onEjercicioCreado, 
  onAddEjercicio, 
  siguienteOrden 
}) => {
  const [nuevoEjercicio, setNuevoEjercicio] = useState<CrearEjercicioDTO>({
    nombre: '',
    descripcion: '',
    grupoMuscular: 'Pecho',
    equipamiento: 'Mancuernas',
    series: 3,
    repeticiones: 10,
    tiempoDescanso: 60,
    nivelDificultad: 'Intermedio',
    nivelIntensidad: 'Media',
    publico: false
  });
  const [creandoEjercicio, setCreandoEjercicio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados adicionales para la sesión
  const [peso, setPeso] = useState<number | undefined>(undefined);
  const [tiempoDescanso, setTiempoDescanso] = useState<number>(60);
  const [opcionesProgresion, setOpcionesProgresion] = useState<OpcionesProgresion>(OPCIONES_PROGRESION_DEFAULT);

  // Usar el hook para las opciones de los Selects
  const { gruposMusculares, equipamientos, nivelesDificultad, nivelesIntensidad } = useExerciseOptions();

  const handleCrearEjercicio = async () => {
    if (!nuevoEjercicio.nombre.trim()) {
      setError('El nombre del ejercicio es obligatorio');
      return;
    }

    setCreandoEjercicio(true);
    setError(null);

    try {
      const ejercicioCreado = await trainingService.crearEjercicio(nuevoEjercicio);
      onEjercicioCreado(ejercicioCreado);
      
      // Crear ejercicio para la sesión con las opciones de progresión
      const ejercicioSesion: EjercicioSesion = {
        ejercicio: ejercicioCreado._id || '',
        orden: siguienteOrden,
        series: nuevoEjercicio.series,
        repeticiones: nuevoEjercicio.repeticiones,
        peso,
        tiempoDescanso,
        ejerciciosAlternativos: [],
        opcionesProgresion
      };

      onAddEjercicio(ejercicioSesion);
      
      // Reset form
      setNuevoEjercicio({
        nombre: '',
        descripcion: '',
        grupoMuscular: 'Pecho',
        equipamiento: 'Mancuernas',
        series: 3,
        repeticiones: 10,
        tiempoDescanso: 60,
        nivelDificultad: 'Intermedio',
        nivelIntensidad: 'Media',
        publico: false
      });
      setPeso(undefined);
      setTiempoDescanso(60);
      setOpcionesProgresion(OPCIONES_PROGRESION_DEFAULT);
    } catch (error) {
      setError('Error al crear el ejercicio: ' + (error as Error).message);
    } finally {
      setCreandoEjercicio(false);
    }
  };

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Crea un nuevo ejercicio para agregarlo a la sesión
      </Text>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <TextInput
        label="Nombre del Ejercicio"
        placeholder="Ej: Press de banca"
        value={nuevoEjercicio.nombre}
        onChange={(e) => setNuevoEjercicio(prev => ({ ...prev, nombre: e.target.value }))}
        required
      />

      <Textarea
        label="Descripción"
        placeholder="Describe cómo realizar el ejercicio..."
        value={nuevoEjercicio.descripcion}
        onChange={(e) => setNuevoEjercicio(prev => ({ ...prev, descripcion: e.target.value }))}
        minRows={3}
      />

      <Grid>
        <Grid.Col span={6}>
          <Select
            label="Grupo Muscular"
            data={gruposMusculares}
            value={nuevoEjercicio.grupoMuscular}
            onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, grupoMuscular: value || 'Pecho' }))}
            styles={{
              dropdown: {
                zIndex: 2000
              }
            }}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Select
            label="Equipamiento"
            data={equipamientos}
            value={nuevoEjercicio.equipamiento}
            onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, equipamiento: value || 'Mancuernas' }))}
            styles={{
              dropdown: {
                zIndex: 2000
              }
            }}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label="Series"
            value={nuevoEjercicio.series}
            onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, series: Number(value) || 3 }))}
            min={1}
            max={20}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label="Repeticiones"
            value={nuevoEjercicio.repeticiones}
            onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, repeticiones: Number(value) || 10 }))}
            min={1}
            max={100}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label="Descanso (seg)"
            value={nuevoEjercicio.tiempoDescanso}
            onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, tiempoDescanso: Number(value) || 60 }))}
            min={0}
            max={600}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Select
            label="Nivel de Dificultad"
            data={nivelesDificultad}
            value={nuevoEjercicio.nivelDificultad}
            onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, nivelDificultad: value || 'Intermedio' }))}
            styles={{
              dropdown: {
                zIndex: 2000
              }
            }}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Select
            label="Nivel de Intensidad"
            data={nivelesIntensidad}
            value={nuevoEjercicio.nivelIntensidad}
            onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, nivelIntensidad: value || 'Media' }))}
            styles={{
              dropdown: {
                zIndex: 2000
              }
            }}
          />
        </Grid.Col>
      </Grid>

      <Switch
        label="Ejercicio público (visible para otros entrenadores)"
        checked={nuevoEjercicio.publico}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setNuevoEjercicio(prev => ({ ...prev, publico: e.target.checked }));
        }}
      />

      <Divider label="Configuración de la Sesión" labelPosition="center" />

      <Grid>
        <Grid.Col span={6}>
          <NumberInput
            label="Peso (kg)"
            value={peso}
            onChange={(value) => setPeso(Number(value) || undefined)}
            min={0}
            decimalScale={1}
            placeholder="Opcional"
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            label="Descanso (seg)"
            value={tiempoDescanso}
            onChange={(value) => setTiempoDescanso(Number(value) || 60)}
            min={0}
            max={600}
          />
        </Grid.Col>
      </Grid>

      <Divider label="Opciones de Progresión" labelPosition="center" />

      <Checkbox
        label="Aumentar peso"
        checked={opcionesProgresion.aumentarPeso}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setOpcionesProgresion(prev => ({ ...prev, aumentarPeso: e.target.checked }));
        }}
      />
      
      <Checkbox
        label="Más repeticiones"
        checked={opcionesProgresion.masRepeticiones}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setOpcionesProgresion(prev => ({ ...prev, masRepeticiones: e.target.checked }));
        }}
      />
      
      <Checkbox
        label="Mayor intensidad"
        checked={opcionesProgresion.mayorIntensidad}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setOpcionesProgresion(prev => ({ ...prev, mayorIntensidad: e.target.checked }));
        }}
      />

      <Group justify="flex-end" mt="md">
        <Button 
          color="nutroos-green" 
          onClick={handleCrearEjercicio}
          loading={creandoEjercicio}
          leftSection={<IconPlus size={16} />}
        >
          Crear y Agregar
        </Button>
      </Group>
    </Stack>
  );
};

export default CrearEjercicioForm;