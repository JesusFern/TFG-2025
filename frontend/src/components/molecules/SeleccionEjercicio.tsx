import React, { useState } from 'react';
import {
  Select,
  NumberInput,
  Switch,
  Stack,
  Group,
  Button,
  Text,
  Divider,
  Card,
  Badge,
  Grid,
  Alert
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { Ejercicio } from '../../types/training';
import type { EjercicioSesion, OpcionesProgresion } from '../../types/trainingCommon';
import { OPCIONES_PROGRESION_DEFAULT } from '../../constants/training';

interface SeleccionEjercicioProps {
  ejerciciosExistentes: Ejercicio[];
  siguienteOrden: number;
  onEjercicioSeleccionado: (ejercicio: EjercicioSesion) => void;
}

const SeleccionEjercicio: React.FC<SeleccionEjercicioProps> = ({
  ejerciciosExistentes,
  siguienteOrden,
  onEjercicioSeleccionado
}) => {
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<string>('');
  const [series, setSeries] = useState<number>(3);
  const [repeticiones, setRepeticiones] = useState<number>(10);
  const [peso, setPeso] = useState<number | undefined>(undefined);
  const [tiempoDescanso, setTiempoDescanso] = useState<number>(60);
  const [nivelIntensidad, setNivelIntensidad] = useState<string>('Media');
  const [ejerciciosAlternativos] = useState<string[]>([]);
  const [opcionesProgresion, setOpcionesProgresion] = useState<OpcionesProgresion>(OPCIONES_PROGRESION_DEFAULT);

  const handleSeleccionarEjercicio = () => {
    if (!ejercicioSeleccionado) {
      return;
    }

    // Validar que el peso esté presente si es obligatorio
    if (pesoEsObligatorio && (peso === undefined || peso === null || peso <= 0)) {
      alert('Este ejercicio requiere especificar un peso válido.');
      return;
    }

    const ejercicioData: EjercicioSesion = {
      ejercicio: ejercicioSeleccionado,
      orden: siguienteOrden,
      series,
      repeticiones,
      peso,
      tiempoDescanso,
      nivelIntensidad,
      ejerciciosAlternativos,
      opcionesProgresion
    };

    onEjercicioSeleccionado(ejercicioData);
  };

  const handleProgresionChange = (field: keyof typeof opcionesProgresion, value: boolean) => {
    setOpcionesProgresion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ejercicioSeleccionadoData = ejerciciosExistentes.find(ej => ej._id === ejercicioSeleccionado);
  
  // Función para determinar si el equipamiento requiere peso obligatorio
  const equipamientoRequierePeso = (equipamiento: string): boolean => {
    const equipamientosConPeso = ['Mancuernas', 'Barra', 'Máquina', 'Pelota medicinal', 'Bandas de resistencia'];
    return equipamientosConPeso.includes(equipamiento);
  };

  const pesoEsObligatorio = ejercicioSeleccionadoData ? 
    equipamientoRequierePeso(ejercicioSeleccionadoData.equipamiento) : false;

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Selecciona un ejercicio existente y configura sus parámetros
      </Text>

      {ejerciciosExistentes.length === 0 ? (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Sin ejercicios disponibles"
          color="blue"
        >
          No hay ejercicios disponibles para seleccionar. Crea un nuevo ejercicio en la pestaña "Crear Nuevo".
        </Alert>
      ) : (
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
          styles={{
            dropdown: {
              zIndex: 2000
            }
          }}
        />
      )}

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
            placeholder={pesoEsObligatorio ? "Requerido" : "Opcional"}
            required={pesoEsObligatorio}
            description={pesoEsObligatorio ? 
              `Este ejercicio requiere especificar el peso (${ejercicioSeleccionadoData?.equipamiento})` : 
              undefined
            }
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
        <Grid.Col span={12}>
          <Select
            label="Nivel de Intensidad"
            data={[
              { value: 'Baja', label: 'Baja' },
              { value: 'Media', label: 'Media' },
              { value: 'Alta', label: 'Alta' }
            ]}
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

      <Divider label="Opciones de progresión" labelPosition="center" />

      <Stack gap="xs">
        <Switch
          label="Aumentar peso progresivamente"
          checked={opcionesProgresion.aumentarPeso}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleProgresionChange('aumentarPeso', e.target.checked)
          }
        />
        <Switch
          label="Aumentar repeticiones"
          checked={opcionesProgresion.masRepeticiones}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleProgresionChange('masRepeticiones', e.target.checked)
          }
        />
        <Switch
          label="Mayor intensidad"
          checked={opcionesProgresion.mayorIntensidad}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleProgresionChange('mayorIntensidad', e.target.checked)
          }
        />
      </Stack>

      <Group justify="flex-end" mt="md">
        <Button
          color="nutroos-green"
          onClick={handleSeleccionarEjercicio}
          disabled={!ejercicioSeleccionado}
        >
          Agregar a la Sesión
        </Button>
      </Group>
    </Stack>
  );
};

export default SeleccionEjercicio;