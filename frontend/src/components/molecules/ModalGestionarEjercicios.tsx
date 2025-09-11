import React, { useState, useEffect } from 'react';
import {
  Modal,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
  TextInput,
  Textarea,
  Switch,
  Divider,
  Alert,
  Checkbox,
  Tabs,
  Badge,
  Card,
  Grid
} from '@mantine/core';
import { IconPlus, IconBarbell, IconTarget } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { Ejercicio, CrearEjercicioDTO } from '../../types/training';
import { trainingService } from '../../services/trainingService';

interface EjercicioSesion {
  ejercicio: string;
  orden: number;
  series: number;
  repeticiones: number;
  peso?: number;
  tiempoDescanso: number;
  ejerciciosAlternativos?: string[];
  opcionesProgresion?: {
    aumentarPeso: boolean;
    masRepeticiones: boolean;
    mayorIntensidad: boolean;
  };
}

interface ModalGestionarEjerciciosProps {
  opened: boolean;
  onClose: () => void;
  onAddEjercicio: (ejercicio: EjercicioSesion) => void;
  onEjercicioCreado?: (ejercicio: Ejercicio) => void;
  ejerciciosExistentes: Ejercicio[];
  siguienteOrden: number;
}

const ModalGestionarEjercicios: React.FC<ModalGestionarEjerciciosProps> = ({
  opened,
  onClose,
  onAddEjercicio,
  onEjercicioCreado,
  ejerciciosExistentes,
  siguienteOrden
}) => {
  const [activeTab, setActiveTab] = useState<string | null>('seleccionar');
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<string>('');
  const [series, setSeries] = useState<number>(3);
  const [repeticiones, setRepeticiones] = useState<number>(10);
  const [peso, setPeso] = useState<number | undefined>(undefined);
  const [tiempoDescanso, setTiempoDescanso] = useState<number>(60);
  const [ejerciciosAlternativos, setEjerciciosAlternativos] = useState<string[]>([]);
  const [opcionesProgresion, setOpcionesProgresion] = useState({
    aumentarPeso: true,
    masRepeticiones: true,
    mayorIntensidad: false
  });

  // Estados para crear nuevo ejercicio
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

  const gruposMusculares = [
    'Piernas', 'Espalda', 'Pecho', 'Hombros', 'Brazos', 'Core', 'Glúteos', 'Pantorrillas'
  ];

  const equipamientos = [
    'Mancuernas', 'Barra', 'Cuerda para saltar', 'Ninguno', 'Máquina', 'Peso corporal', 'Pelota medicinal', 'Bandas de resistencia'
  ];

  const nivelesDificultad = ['Principiante', 'Intermedio', 'Avanzado'];
  const nivelesIntensidad = ['Baja', 'Media', 'Alta'];

  const handleSeleccionarEjercicio = () => {
    if (!ejercicioSeleccionado) {
      setError('Por favor selecciona un ejercicio');
      return;
    }

    const ejercicioSesion: EjercicioSesion = {
      ejercicio: ejercicioSeleccionado,
      orden: siguienteOrden,
      series,
      repeticiones,
      peso,
      tiempoDescanso,
      ejerciciosAlternativos,
      opcionesProgresion
    };

    onAddEjercicio(ejercicioSesion);
    onClose();
    resetForm();
  };

  const handleCrearEjercicio = async () => {
    if (!nuevoEjercicio.nombre.trim()) {
      setError('El nombre del ejercicio es obligatorio');
      return;
    }

    try {
      setCreandoEjercicio(true);
      setError(null);
      
      const ejercicioCreado = await trainingService.crearEjercicio(nuevoEjercicio);
      
      // Notificar al componente padre sobre el ejercicio creado
      if (onEjercicioCreado) {
        onEjercicioCreado(ejercicioCreado);
      }
      
      // Agregar el ejercicio recién creado a la sesión
      const ejercicioSesion: EjercicioSesion = {
        ejercicio: ejercicioCreado._id!,
        orden: siguienteOrden,
        series: nuevoEjercicio.series,
        repeticiones: nuevoEjercicio.repeticiones,
        peso,
        tiempoDescanso: nuevoEjercicio.tiempoDescanso,
        ejerciciosAlternativos,
        opcionesProgresion
      };

      onAddEjercicio(ejercicioSesion);
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el ejercicio');
    } finally {
      setCreandoEjercicio(false);
    }
  };

  const resetForm = () => {
    setEjercicioSeleccionado('');
    setSeries(3);
    setRepeticiones(10);
    setPeso(undefined);
    setTiempoDescanso(60);
    setEjerciciosAlternativos([]);
    setOpcionesProgresion({
      aumentarPeso: true,
      masRepeticiones: true,
      mayorIntensidad: false
    });
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
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const ejercicioSeleccionadoData = ejerciciosExistentes.find(e => e._id === ejercicioSeleccionado);

  // Limpiar el estado cuando se abre el modal
  useEffect(() => {
    if (opened) {
      resetForm();
    }
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <IconBarbell size={20} color="var(--mantine-color-nutroos-green-6)" />
          <Title order={4} c="nutroos-green.6">Gestionar Ejercicios</Title>
        </Group>
      }
      size="lg"
      centered
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="seleccionar" leftSection={<IconTarget size={16} />}>
            Seleccionar Existente
          </Tabs.Tab>
          <Tabs.Tab value="crear" leftSection={<IconPlus size={16} />}>
            Crear Nuevo
          </Tabs.Tab>
        </Tabs.List>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Alert color="red" mt="md" withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          </motion.div>
        )}

        <Tabs.Panel value="seleccionar" pt="md">
          <Stack gap="md">
            <Select
              label="Seleccionar Ejercicio"
              placeholder="Busca y selecciona un ejercicio"
              data={ejerciciosExistentes.map(ejercicio => ({
                value: ejercicio._id!,
                label: ejercicio.nombre
              }))}
              value={ejercicioSeleccionado}
              onChange={(value) => setEjercicioSeleccionado(value || '')}
              searchable
              clearable
            />

            {ejercicioSeleccionadoData && (
              <Card withBorder p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <Text fw={500} size="sm" mb="xs">Información del Ejercicio</Text>
                <Text size="sm" c="dimmed" mb="xs">{ejercicioSeleccionadoData.descripcion}</Text>
                <Group gap="xs">
                  <Badge size="sm" color="blue" variant="light">
                    {ejercicioSeleccionadoData.grupoMuscular}
                  </Badge>
                  <Badge size="sm" color="green" variant="light">
                    {ejercicioSeleccionadoData.equipamiento}
                  </Badge>
                  <Badge size="sm" color="orange" variant="light">
                    {ejercicioSeleccionadoData.nivelDificultad}
                  </Badge>
                </Group>
              </Card>
            )}

            <Divider label="Configuración de la Sesión" labelPosition="center" />

            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Series"
                  value={series}
                  onChange={(value) => setSeries(Number(value) || 3)}
                  min={1}
                  max={20}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Repeticiones"
                  value={repeticiones}
                  onChange={(value) => setRepeticiones(Number(value) || 10)}
                  min={1}
                  max={100}
                />
              </Grid.Col>
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

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button color="nutroos-green" onClick={handleSeleccionarEjercicio}>
                Agregar a la Sesión
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="crear" pt="md">
          <Stack gap="md">
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
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Equipamiento"
                  data={equipamientos}
                  value={nuevoEjercicio.equipamiento}
                  onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, equipamiento: value || 'Mancuernas' }))}
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
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Nivel de Intensidad"
                  data={nivelesIntensidad}
                  value={nuevoEjercicio.nivelIntensidad}
                  onChange={(value) => setNuevoEjercicio(prev => ({ ...prev, nivelIntensidad: value || 'Media' }))}
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
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
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
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

export default ModalGestionarEjercicios;
