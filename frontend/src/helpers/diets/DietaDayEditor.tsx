import React, { useState } from 'react';
import { 
  Title, 
  Card, 
  Group, 
  Button, 
  NumberInput, 
  Grid,
  Box,
  useMantineColorScheme,
  Paper,
  Alert
} from '@mantine/core';
import { IconPlus, IconDeviceFloppy } from '@tabler/icons-react';
import ComidaEditor from './ComidaEditor';
import { DiaDieta, Comida } from '../../types';
import { actualizarDiaDieta } from '../../services/dietService';

interface DietaDayEditorProps {
  day: DiaDieta;
  dayNumber: number;
  onUpdate: (updatedDay: DiaDieta) => void;
  comidasDiarias: number;
  customTitle?: string;
  hideTitle?: boolean;
  dietaId?: string;
  hasChanges?: boolean;
  onSaveSuccess?: () => void;
  onRecalcularCalorias?: () => void;
}

const DietaDayEditor: React.FC<DietaDayEditorProps> = ({ 
  day, 
  dayNumber, 
  onUpdate, 
  comidasDiarias, 
  customTitle,
  hideTitle = false,
  dietaId,
  hasChanges = false,
  onSaveSuccess,
  onRecalcularCalorias
}) => {
  const { colorScheme } = useMantineColorScheme();
  
  const isDark = colorScheme === 'dark';
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveDay = async () => {
    if (!dietaId) {
      setSaveError('No se pudo guardar: ID de dieta no disponible');
      return;
    }
    
    try {
      setSaving(true);
      setSaveError(null);
      
      await actualizarDiaDieta(dietaId, dayNumber - 1, day);
      
      setSaveSuccess(true);
      
      setTimeout(() => setSaveSuccess(false), 3000);
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Error al guardar día:', error);
      setSaveError(error instanceof Error ? error.message : 'Error al guardar los cambios');
      
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateComida = (comidaIndex: number, updatedComida: Comida) => {
    const updatedComidas = [...day.comidas];
    updatedComidas[comidaIndex] = updatedComida;
    
    
    const diaActualizado = {
      ...day,
      comidas: updatedComidas
    };
    
    onUpdate(diaActualizado);
    
    // Recalcular calorías con un pequeño delay para asegurar propagación del estado
    if (onRecalcularCalorias) {
      setTimeout(() => {
        onRecalcularCalorias();
      }, 50);
    }
  };


  return (
    <Box mb="xl">
      <Card 
        shadow="sm" 
        p="lg" 
        mb="lg" 
        style={{
          backgroundColor: isDark ? 'var(--app-paper-bg)' : 'var(--app-background)', 
          borderColor: 'var(--app-border-color)'
        }}
        withBorder
      >
        <Group justify="space-between">
          {!hideTitle && (
            customTitle ? 
              <Title order={3} c="nutroos-green.6">{customTitle}</Title> : 
              <Title order={3} c="nutroos-green.6">Día {dayNumber}</Title>
          )}
          <Group>
            {hasChanges && (
              <Button
                color="nutroos-green"
                leftSection={<IconDeviceFloppy size={16} />}
                loading={saving}
                onClick={handleSaveDay}
                size="sm"
              >
                Guardar cambios
              </Button>
            )}
          </Group>
        </Group>
        
        {saveError && (
          <Alert color="red" title="Error al guardar" mt="sm" withCloseButton onClose={() => setSaveError(null)}>
            {saveError}
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert color="green" title="Guardado exitoso" mt="sm" withCloseButton onClose={() => setSaveSuccess(false)}>
            Los cambios han sido guardados correctamente.
          </Alert>
        )}
        
        <Box>
          <Grid mt="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput 
                label="Calorías totales"
                placeholder="Ej: 2000"
                value={day.caloriasTotales}
                readOnly
                min={0}
                step={10}
                mb="md"
                styles={{
                  input: {
                    backgroundColor: isDark ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)',
                    cursor: 'not-allowed'
                  }
                }}
              />
            </Grid.Col>
    <Grid.Col span={{ base: 12, md: 4 }}>
      <NumberInput 
        label="Proteínas (g)"
        placeholder="Ej: 120"
        value={day.proteinas || 0}
        readOnly
        min={0}
        decimalScale={2}
        mb="md"
        styles={{
          input: {
            backgroundColor: isDark ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)',
            cursor: 'not-allowed'
          }
        }}
      />
    </Grid.Col>
    <Grid.Col span={{ base: 12, md: 4 }}>
      <NumberInput 
        label="Hidratos de carbono (g)"
        placeholder="Ej: 250"
        value={day.hidratosCarbono || 0}
        readOnly
        min={0}
        decimalScale={2}
        mb="md"
        styles={{
          input: {
            backgroundColor: isDark ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)',
            cursor: 'not-allowed'
          }
        }}
      />
    </Grid.Col>
    <Grid.Col span={{ base: 12, md: 4 }}>
      <NumberInput 
        label="Grasas (g)"
        placeholder="Ej: 80"
        value={day.grasas || 0}
        readOnly
        min={0}
        decimalScale={2}
        mb="md"
        styles={{
          input: {
            backgroundColor: isDark ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)',
            cursor: 'not-allowed'
          }
        }}
      />
    </Grid.Col>
          </Grid>
        </Box>
      </Card>
      
        {day.comidas.map((comida, index) => (
          <Paper 
            key={index}
            withBorder
            radius="md"
            p="md"
            mb="md"
            style={{ 
              backgroundColor: 'var(--app-paper-bg)', 
              borderColor: 'var(--app-border-color)',
            }}
          >
            <ComidaEditor 
              comida={comida}
              comidaIndex={index}
              diaIndex={dayNumber - 1}
              onUpdate={(updatedComida: Comida) => handleUpdateComida(index, updatedComida)}
              dietaId={dietaId}
              diaCompleto={day}
              onRecalcularCalorias={onRecalcularCalorias}
            />
          </Paper>
        ))}
      
      {day.comidas.length < comidasDiarias && (
        <Group justify="center" mt="xl">
          <Button 
            leftSection={<IconPlus size={16} />}
            variant="outline"
            color="nutroos-green"
            onClick={() => {
              const nuevasComidas = [...day.comidas, { horaEstimada: '', platos: [] }];
              onUpdate({
                ...day,
                comidas: nuevasComidas
              });
              
              // Recalcular calorías después de añadir una comida
              if (onRecalcularCalorias) {
                setTimeout(() => {
                  onRecalcularCalorias();
                }, 100);
              }
            }}
          >
            Añadir comida
          </Button>
        </Group>
      )}
    </Box>
  );
};

export default DietaDayEditor;