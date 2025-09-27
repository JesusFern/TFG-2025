import React from 'react';
import {
  NumberInput,
  Select,
  Switch,
  Stack,
  Group,
  Button,
  Divider,
  Grid
} from '@mantine/core';
import type { OpcionesProgresion } from '../../types/trainingCommon';

interface ConfiguracionEjercicioFormProps {
  // Estados del formulario
  series: number;
  repeticiones: number;
  peso?: number;
  tiempoDescanso: number;
  nivelIntensidad: string;
  opcionesProgresion: OpcionesProgresion;
  
  // Handlers
  onSeriesChange: (value: number) => void;
  onRepeticionesChange: (value: number) => void;
  onPesoChange: (value: number | undefined) => void;
  onTiempoDescansoChange: (value: number) => void;
  onNivelIntensidadChange: (value: string) => void;
  onProgresionChange: (key: keyof OpcionesProgresion, value: boolean) => void;
  
  // Configuración específica
  pesoEsObligatorio?: boolean;
  equipamiento?: string;
  botonHabilitado?: boolean;
  onButtonClick?: () => void;
  buttonText?: string;
  buttonColor?: string;
  showButton?: boolean;
}

const ConfiguracionEjercicioForm: React.FC<ConfiguracionEjercicioFormProps> = ({
  series,
  repeticiones,
  peso,
  tiempoDescanso,
  nivelIntensidad,
  opcionesProgresion,
  onSeriesChange,
  onRepeticionesChange,
  onPesoChange,
  onTiempoDescansoChange,
  onNivelIntensidadChange,
  onProgresionChange,
  pesoEsObligatorio = false,
  equipamiento = '',
  botonHabilitado = true,
  onButtonClick,
  buttonText = 'Agregar a la Sesión',
  buttonColor = 'nutroos-green',
  showButton = true
}) => {
  return (
    <>
      <Grid>
        <Grid.Col span={6}>
          <NumberInput
            label="Series"
            value={series}
            onChange={(value) => onSeriesChange(Number(value) || 3)}
            min={1}
            max={20}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            label="Repeticiones"
            value={repeticiones}
            onChange={(value) => onRepeticionesChange(Number(value) || 10)}
            min={1}
            max={100}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            label="Peso (kg)"
            value={peso}
            onChange={(value) => onPesoChange(Number(value) || undefined)}
            min={0}
            decimalScale={1}
            placeholder={pesoEsObligatorio ? "Requerido" : "Opcional"}
            required={pesoEsObligatorio}
            description={pesoEsObligatorio ? 
              `Este ejercicio requiere especificar el peso (${equipamiento})` : 
              undefined
            }
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            label="Descanso (seg)"
            value={tiempoDescanso}
            onChange={(value) => onTiempoDescansoChange(Number(value) || 60)}
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
            onChange={(value) => onNivelIntensidadChange(value || 'Media')}
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
            onProgresionChange('aumentarPeso', e.target.checked)
          }
        />
        <Switch
          label="Aumentar repeticiones"
          checked={opcionesProgresion.masRepeticiones}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            onProgresionChange('masRepeticiones', e.target.checked)
          }
        />
        <Switch
          label="Mayor intensidad"
          checked={opcionesProgresion.mayorIntensidad}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            onProgresionChange('mayorIntensidad', e.target.checked)
          }
        />
      </Stack>
      
      {showButton && onButtonClick && (
        <Group justify="flex-end" mt="md">
          <Button
            color={buttonColor}
            onClick={onButtonClick}
            disabled={!botonHabilitado}
          >
            {buttonText}
          </Button>
        </Group>
      )}
    </>
  );
};

export default ConfiguracionEjercicioForm;
