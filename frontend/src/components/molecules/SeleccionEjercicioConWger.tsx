import React, { useState, useEffect } from 'react';
import {
  Select,
  Stack,
  Group,
  Text,
  Divider,
  Card,
  Badge,
  Alert,
  Tabs,
  TextInput,
  Loader,
  Center,
  ScrollArea
} from '@mantine/core';
import { IconAlertCircle, IconSearch, IconDatabase, IconWorld } from '@tabler/icons-react';
import type { Ejercicio } from '../../types/training';
import type { EjercicioSesion, OpcionesProgresion } from '../../types/trainingCommon';
import type { WgerExercise } from '../../types/wger';
import { OPCIONES_PROGRESION_DEFAULT } from '../../constants/training';
import { wgerService } from '../../services/wgerService';
import { trainingService } from '../../services/trainingService';
import ConfiguracionEjercicioForm from './ConfiguracionEjercicioForm';

interface SeleccionEjercicioConWgerProps {
  ejerciciosExistentes: Ejercicio[];
  siguienteOrden: number;
  onEjercicioSeleccionado: (ejercicio: EjercicioSesion) => void;
  tipoEntrenamiento: string;
}

const SeleccionEjercicioConWger: React.FC<SeleccionEjercicioConWgerProps> = ({
  ejerciciosExistentes,
  siguienteOrden,
  onEjercicioSeleccionado,
  tipoEntrenamiento
}) => {
  const [activeTab, setActiveTab] = useState<string | null>('database');
  
  // Estados para ejercicios de base de datos
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<string>('');
  
  // Estados para ejercicios de wger
  const [wgerQuery, setWgerQuery] = useState<string>('');
  const [wgerEjercicios, setWgerEjercicios] = useState<WgerExercise[]>([]);
  const [wgerEjercicioSeleccionado, setWgerEjercicioSeleccionado] = useState<WgerExercise | null>(null);
  const [wgerLoading, setWgerLoading] = useState<boolean>(false);
  const [wgerError, setWgerError] = useState<string | null>(null);
  
  // Estados comunes para configuración
  const [series, setSeries] = useState<number>(3);
  const [repeticiones, setRepeticiones] = useState<number>(10);
  const [peso, setPeso] = useState<number | undefined>(undefined);
  const [tiempoDescanso, setTiempoDescanso] = useState<number>(60);
  const [nivelIntensidad, setNivelIntensidad] = useState<string>('Media');
  const [ejerciciosAlternativos] = useState<string[]>([]);
  const [opcionesProgresion, setOpcionesProgresion] = useState<OpcionesProgresion>(OPCIONES_PROGRESION_DEFAULT);

  // Buscar ejercicios en wger
  const buscarWgerEjercicios = async (query: string) => {
    if (query.length < 2) {
      setWgerEjercicios([]);
      return;
    }

    setWgerLoading(true);
    setWgerError(null);

    try {
      const ejercicios = await wgerService.buscarEjercicios(query);
      setWgerEjercicios(ejercicios);
    } catch (error) {
      setWgerError('Error al buscar ejercicios en wger');
      console.error('Error searching wger exercises:', error);
    } finally {
      setWgerLoading(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (wgerQuery.trim()) {
        buscarWgerEjercicios(wgerQuery.trim());
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [wgerQuery]);

  const handleSeleccionarEjercicio = async () => {
    if (activeTab === 'database') {
      if (!ejercicioSeleccionado) return;
      
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
    } else if (activeTab === 'wger') {
      if (!wgerEjercicioSeleccionado) return;
      
      try {
        // Crear el ejercicio de wger en nuestra base de datos
        const ejercicioCreado = await trainingService.crearEjercicioDesdeWger(wgerEjercicioSeleccionado, tipoEntrenamiento);
        
        // Usar el ObjectId del ejercicio creado
        const ejercicioData: EjercicioSesion = {
          ejercicio: ejercicioCreado._id!,
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
      } catch (error) {
        console.error('Error al crear ejercicio desde wger:', error);
        // Mostrar error al usuario
        alert('Error al crear el ejercicio. Inténtalo de nuevo.');
      }
    }
  };

  const handleProgresionChange = (field: keyof typeof opcionesProgresion, value: boolean) => {
    setOpcionesProgresion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Obtener datos del ejercicio seleccionado
  const ejercicioSeleccionadoData = activeTab === 'database' 
    ? ejerciciosExistentes.find(ej => ej._id === ejercicioSeleccionado)
    : wgerEjercicioSeleccionado;

  // Función para determinar si el equipamiento requiere peso obligatorio
  const equipamientoRequierePeso = (equipamiento: string): boolean => {
    const equipamientosConPeso = ['Mancuernas', 'Barra', 'Máquina', 'Pelota medicinal', 'Bandas de resistencia', 'Kettlebell', 'Cable'];
    return equipamientosConPeso.includes(equipamiento);
  };

  // Helper para obtener el equipamiento del ejercicio
  const getEquipamiento = (ejercicio: Ejercicio | WgerExercise | null): string => {
    if (!ejercicio) return '';
    if ('equipamiento' in ejercicio) {
      return ejercicio.equipamiento;
    } else {
      return ejercicio.equipment[0] || '';
    }
  };

  // Helper para obtener la descripción del ejercicio
  const getDescripcion = (ejercicio: Ejercicio | WgerExercise | null): string => {
    if (!ejercicio) return '';
    if ('descripcion' in ejercicio) {
      return ejercicio.descripcion;
    } else {
      return ejercicio.description;
    }
  };

  // Helper para obtener el grupo muscular/categoría del ejercicio
  const getGrupoMuscular = (ejercicio: Ejercicio | WgerExercise | null): string => {
    if (!ejercicio) return '';
    if ('grupoMuscular' in ejercicio) {
      return ejercicio.grupoMuscular;
    } else {
      // Mapear categoría de wger a grupo muscular del sistema
      const mapeoGrupoMuscular: Record<string, string> = {
        'Abs': 'Core',
        'Arms': 'Brazos',
        'Back': 'Espalda',
        'Calves': 'Pantorrillas',
        'Cardio': 'Piernas',
        'Chest': 'Pecho',
        'Legs': 'Piernas',
        'Shoulders': 'Hombros'
      };
      return mapeoGrupoMuscular[ejercicio.category] || 'Core';
    }
  };

  const pesoEsObligatorio = ejercicioSeleccionadoData ? 
    equipamientoRequierePeso(getEquipamiento(ejercicioSeleccionadoData)) : false;

  const isEjercicioSeleccionado = activeTab === 'database' 
    ? !!ejercicioSeleccionado 
    : !!wgerEjercicioSeleccionado;

  // Validar si el peso es obligatorio y está especificado
  const pesoValido = pesoEsObligatorio ? (peso !== undefined && peso > 0) : true;
  
  // El botón está habilitado solo si hay ejercicio seleccionado Y el peso es válido
  const botonHabilitado = isEjercicioSeleccionado && pesoValido;

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Selecciona un ejercicio y configura sus parámetros
      </Text>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="database" leftSection={<IconDatabase size={16} />}>
            Base de Datos ({ejerciciosExistentes.length})
          </Tabs.Tab>
          <Tabs.Tab value="wger" leftSection={<IconWorld size={16} />}>
            wger API
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="database" pt="md">
          {ejerciciosExistentes.length === 0 ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Sin ejercicios disponibles"
              color="blue"
            >
              No hay ejercicios disponibles en la base de datos. Usa la pestaña "wger API" para buscar ejercicios externos.
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
        </Tabs.Panel>

        <Tabs.Panel value="wger" pt="md">
          <Stack gap="md">
            <TextInput
              label="Buscar en wger"
              placeholder="Escribe el nombre del ejercicio..."
              leftSection={<IconSearch size={16} />}
              value={wgerQuery}
              onChange={(e) => setWgerQuery(e.target.value)}
            />

            {wgerLoading && (
              <Center>
                <Loader size="sm" />
              </Center>
            )}

            {wgerError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
              >
                {wgerError}
              </Alert>
            )}

            {wgerEjercicios.length > 0 && (
              <ScrollArea.Autosize mah={300}>
                <Stack gap="xs">
                  {wgerEjercicios.map((ejercicio) => (
                    <Card
                      key={ejercicio.id}
                      withBorder
                      p="sm"
                      style={{
                        cursor: 'pointer',
                        backgroundColor: wgerEjercicioSeleccionado?.id === ejercicio.id 
                          ? 'var(--mantine-color-blue-0)' 
                          : 'transparent'
                      }}
                      onClick={() => setWgerEjercicioSeleccionado(ejercicio)}
                    >
                      <Text fw={500} size="sm">{ejercicio.name}</Text>
                      <Text size="xs" c="dimmed" mb="xs">
                        {ejercicio.description.length > 100 
                          ? `${ejercicio.description.substring(0, 100)}...` 
                          : ejercicio.description
                        }
                      </Text>
                      <Group gap="xs">
                        <Badge size="xs" color="blue" variant="light">
                          {getGrupoMuscular(ejercicio)}
                        </Badge>
                        <Badge size="xs" color="purple" variant="light">
                          {tipoEntrenamiento}
                        </Badge>
                        {ejercicio.equipment.length > 0 && (
                          <Badge size="xs" color="orange" variant="light">
                            {ejercicio.equipment[0]}
                          </Badge>
                        )}
                        {ejercicio.videoUrl && (
                          <Badge size="xs" color="red" variant="light">
                            Video
                          </Badge>
                        )}
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            )}

            {wgerQuery.length >= 2 && wgerEjercicios.length === 0 && !wgerLoading && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Sin resultados"
                color="yellow"
              >
                No se encontraron ejercicios con ese término de búsqueda.
              </Alert>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {ejercicioSeleccionadoData && (
        <Card withBorder p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Text fw={500} size="sm" mb="xs">Información del Ejercicio</Text>
          <Text size="sm" c="dimmed" mb="xs">
            {getDescripcion(ejercicioSeleccionadoData)}
          </Text>
          <Group gap="xs">
            <Badge size="sm" color="blue" variant="light">
              {getGrupoMuscular(ejercicioSeleccionadoData)}
            </Badge>
            <Badge size="sm" color="purple" variant="light">
              {activeTab === 'database' && ejercicioSeleccionadoData && 'tipoEjercicio' in ejercicioSeleccionadoData 
                ? ejercicioSeleccionadoData.tipoEjercicio 
                : tipoEntrenamiento}
            </Badge>
            <Badge size="sm" color="green" variant="light">
              {getEquipamiento(ejercicioSeleccionadoData) || 'Sin equipamiento'}
            </Badge>
            {activeTab === 'database' && ejercicioSeleccionadoData && 'nivelDificultad' in ejercicioSeleccionadoData && (
              <Badge size="sm" color="orange" variant="light">
                {ejercicioSeleccionadoData.nivelDificultad}
              </Badge>
            )}
            {activeTab === 'wger' && ejercicioSeleccionadoData && 'videoUrl' in ejercicioSeleccionadoData && ejercicioSeleccionadoData.videoUrl && (
              <Badge size="sm" color="red" variant="light">
                Video disponible
              </Badge>
            )}
          </Group>
        </Card>
      )}

      <Divider label="Configuración de la Sesión" labelPosition="center" />

      {pesoEsObligatorio && !pesoValido && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Peso requerido"
          color="red"
          variant="light"
        >
          Este ejercicio requiere especificar un peso mayor a 0 kg ({getEquipamiento(ejercicioSeleccionadoData || null)}).
        </Alert>
      )}

      <ConfiguracionEjercicioForm
        series={series}
        repeticiones={repeticiones}
        peso={peso}
        tiempoDescanso={tiempoDescanso}
        nivelIntensidad={nivelIntensidad}
        opcionesProgresion={opcionesProgresion}
        onSeriesChange={setSeries}
        onRepeticionesChange={setRepeticiones}
        onPesoChange={setPeso}
        onTiempoDescansoChange={setTiempoDescanso}
        onNivelIntensidadChange={setNivelIntensidad}
        onProgresionChange={handleProgresionChange}
        pesoEsObligatorio={pesoEsObligatorio}
        equipamiento={getEquipamiento(ejercicioSeleccionadoData || null)}
        botonHabilitado={botonHabilitado}
        onButtonClick={handleSeleccionarEjercicio}
        buttonText="Agregar a la Sesión"
        buttonColor="nutroos-green"
        showButton={true}
      />
    </Stack>
  );
};

export default SeleccionEjercicioConWger;
