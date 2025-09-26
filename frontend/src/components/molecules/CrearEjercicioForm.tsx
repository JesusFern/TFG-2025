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
  Checkbox,
  FileInput
} from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import type { Ejercicio, CrearEjercicioDTO } from '../../types/training';
import type { EjercicioSesion, OpcionesProgresion } from '../../types/trainingCommon';
import { trainingService } from '../../services/trainingService';
import { useExerciseOptions, generateSlugFromName } from '../../hooks/useExerciseOptions';
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
    slug: '',
    descripcion: '',
    grupoMuscular: 'Pecho',
    equipamiento: 'Mancuernas',
    nivelDificultad: 'Intermedio',
    tipoEjercicio: 'Fuerza',
    instrucciones: '',
    videoDemostrativo: '',
    publico: false
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [creandoEjercicio, setCreandoEjercicio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados adicionales para la sesión
  const [series, setSeries] = useState<number>(3);
  const [repeticiones, setRepeticiones] = useState<number>(10);
  const [peso, setPeso] = useState<number | undefined>(undefined);
  const [tiempoDescanso, setTiempoDescanso] = useState<number>(60);
  const [nivelIntensidad, setNivelIntensidad] = useState<string>('Media');
  const [opcionesProgresion, setOpcionesProgresion] = useState<OpcionesProgresion>(OPCIONES_PROGRESION_DEFAULT);

  // Usar el hook para las opciones de los Selects
  const { gruposMusculares, equipamientos, nivelesDificultad, nivelesIntensidad, tiposEjercicio } = useExerciseOptions();

  // Función para determinar si el equipamiento requiere peso obligatorio
  const equipamientoRequierePeso = (equipamiento: string): boolean => {
    const equipamientosConPeso = ['Mancuernas', 'Barra', 'Máquina', 'Pelota medicinal', 'Bandas de resistencia', 'Kettlebell', 'Cable'];
    return equipamientosConPeso.includes(equipamiento);
  };

  const pesoEsObligatorio = equipamientoRequierePeso(nuevoEjercicio.equipamiento);
  
  // Validar si el peso es obligatorio y está especificado
  const pesoValido = pesoEsObligatorio ? (peso !== undefined && peso > 0) : true;
  
  // Validar si el formulario está completo
  const formularioCompleto = nuevoEjercicio.nombre.trim() && pesoValido;

  const handleCrearEjercicio = async () => {
    if (!nuevoEjercicio.nombre.trim()) {
      setError('El nombre del ejercicio es obligatorio');
      return;
    }

    // Validar que el peso esté presente si es obligatorio
    if (pesoEsObligatorio && (peso === undefined || peso === null || peso <= 0)) {
      setError(`Este ejercicio requiere especificar un peso válido (${nuevoEjercicio.equipamiento}).`);
      return;
    }

    setCreandoEjercicio(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('nombre', nuevoEjercicio.nombre);
      formData.append('slug', generateSlugFromName(nuevoEjercicio.nombre));
      formData.append('descripcion', nuevoEjercicio.descripcion);
      formData.append('grupoMuscular', nuevoEjercicio.grupoMuscular);
      formData.append('equipamiento', nuevoEjercicio.equipamiento);
      formData.append('nivelDificultad', nuevoEjercicio.nivelDificultad);
      formData.append('tipoEjercicio', nuevoEjercicio.tipoEjercicio);
      formData.append('instrucciones', nuevoEjercicio.instrucciones || '');
      formData.append('publico', nuevoEjercicio.publico.toString());
      
      if (videoFile) {
        formData.append('video', videoFile);
      }

      const ejercicioCreado = await trainingService.crearEjercicio(formData);
      onEjercicioCreado(ejercicioCreado);
      
      // Crear ejercicio para la sesión con las opciones de progresión
      const ejercicioSesion: EjercicioSesion = {
        ejercicio: ejercicioCreado._id || '',
        orden: siguienteOrden,
        series,
        repeticiones,
        peso,
        tiempoDescanso,
        nivelIntensidad,
        ejerciciosAlternativos: [],
        opcionesProgresion
      };

      onAddEjercicio(ejercicioSesion);
      
      // Reset form
      setNuevoEjercicio({
        nombre: '',
        slug: '',
        descripcion: '',
        grupoMuscular: 'Pecho',
        equipamiento: 'Mancuernas',
        nivelDificultad: 'Intermedio',
        tipoEjercicio: 'Fuerza',
        instrucciones: '',
        videoDemostrativo: '',
        publico: false
      });
      setVideoFile(null);
      setSeries(3);
      setRepeticiones(10);
      setPeso(undefined);
      setTiempoDescanso(60);
      setNivelIntensidad('Media');
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
      {nuevoEjercicio.nombre && (
        <Text size="sm" c="dimmed">
          <strong>Slug generado:</strong> {generateSlugFromName(nuevoEjercicio.nombre)}
        </Text>
      )}

      <Textarea
        label="Descripción"
        placeholder="Describe cómo realizar el ejercicio..."
        value={nuevoEjercicio.descripcion}
        onChange={(e) => setNuevoEjercicio(prev => ({ ...prev, descripcion: e.target.value }))}
        minRows={3}
      />

      <Textarea
        label="Instrucciones"
        placeholder="Instrucciones detalladas paso a paso..."
        value={nuevoEjercicio.instrucciones || ''}
        onChange={(e) => setNuevoEjercicio(prev => ({ ...prev, instrucciones: e.target.value }))}
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
            label="Tipo de Ejercicio"
            data={tiposEjercicio}
            value={nuevoEjercicio.tipoEjercicio}
            onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, tipoEjercicio: value || 'Fuerza' }))}
            styles={{
              dropdown: {
                zIndex: 2000
              }
            }}
          />
        </Grid.Col>
      </Grid>

      <FileInput
        label="Video Demostrativo"
        placeholder="Selecciona un archivo de video"
        accept="video/*"
        value={videoFile}
        onChange={setVideoFile}
        description="Opcional: Sube un video demostrativo del ejercicio (máximo 50MB)"
        clearable
      />

      <Grid>
      </Grid>

      <Switch
        label="Ejercicio público (visible para otros entrenadores)"
        checked={nuevoEjercicio.publico}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setNuevoEjercicio(prev => ({ ...prev, publico: e.target.checked }));
        }}
      />

      <Divider label="Configuración de la Sesión" labelPosition="center" />

      {pesoEsObligatorio && !pesoValido && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Peso requerido"
          color="red"
          variant="light"
        >
          Este ejercicio requiere especificar un peso mayor a 0 kg ({nuevoEjercicio.equipamiento}).
        </Alert>
      )}

      <Grid>
        <Grid.Col span={4}>
          <NumberInput
            label="Series"
            value={series}
            onChange={(value) => setSeries(Number(value) || 3)}
            min={1}
            max={20}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label="Repeticiones"
            value={repeticiones}
            onChange={(value) => setRepeticiones(Number(value) || 10)}
            min={1}
            max={100}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label="Descanso (seg)"
            value={tiempoDescanso}
            onChange={(value) => setTiempoDescanso(Number(value) || 60)}
            min={0}
            max={600}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            label="Peso (kg)"
            value={peso}
            onChange={(value) => setPeso(Number(value) || undefined)}
            min={0}
            decimalScale={1}
            placeholder={pesoEsObligatorio ? "Requerido" : "Opcional"}
            required={pesoEsObligatorio}
            description={pesoEsObligatorio ? 
              `Este ejercicio requiere especificar el peso (${nuevoEjercicio.equipamiento})` : 
              undefined
            }
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Select
            label="Nivel de Intensidad"
            data={nivelesIntensidad}
            value={nivelIntensidad}
            onChange={(value) => setNivelIntensidad(value || 'Media')}
            styles={{
              dropdown: {
                zIndex: 2000
              }
            }}
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
          disabled={!formularioCompleto}
          leftSection={<IconPlus size={16} />}
        >
          Crear y Agregar
        </Button>
      </Group>
    </Stack>
  );
};

export default CrearEjercicioForm;