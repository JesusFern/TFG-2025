import React, { useState } from 'react';
import { 
  Title, 
  Card, 
  Group, 
  Button, 
  TextInput, 
  NumberInput, 
  Grid,
  Box,
  Collapse,
  useMantineColorScheme,
  Paper,
  Alert
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconChevronDown, IconChevronUp, IconDeviceFloppy } from '@tabler/icons-react';
import ComidaEditor from './ComidaEditor';
import { DiaDieta, Comida } from '../../types';
import { actualizarDiaDieta } from '../../services/dietService';

interface DietaDayEditorProps {
  day: DiaDieta;
  dayNumber: number;
  onUpdate: (updatedDay: DiaDieta, markAsChanged?: boolean) => void;
  comidasDiarias: number;
  customTitle?: string;
  hideTitle?: boolean;
  dietaId?: string;
  hasChanges?: boolean;
  onSaveSuccess?: () => void;
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
  onSaveSuccess
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [metadataOpened, { toggle: toggleMetadata }] = useDisclosure(false);
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
    
    console.log('handleUpdateComida en DietaDayEditor, pasando markAsChanged: false');
    
    onUpdate({
      ...day,
      comidas: updatedComidas
    }, false);
  };

  const handleUpdateDayProperty = <T extends keyof DiaDieta>(property: T, value: DiaDieta[T]) => {
    onUpdate({
      ...day,
      [property]: value
    }, true);
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
            <Button 
              rightSection={metadataOpened ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              variant="subtle"
              color="nutroos-green"
              size="compact"
              onClick={toggleMetadata}
              ml={hideTitle ? 'auto' : undefined}
            >
              {metadataOpened ? 'Ocultar detalles' : 'Mostrar detalles'}
            </Button>
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
        
        <Collapse in={metadataOpened}>
          <Grid mt="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput 
                label="Calorías totales"
                placeholder="Ej: 2000"
                value={day.caloriasTotales}
                onChange={(val) => handleUpdateDayProperty('caloriasTotales', typeof val === 'number' ? val : 0)}
                min={0}
                step={10}
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput 
                label="Macronutrientes"
                placeholder="Ej: Proteínas 30%, Carbohidratos 50%, Grasas 20%"
                value={day.macronutrientes || ''}
                onChange={(e) => handleUpdateDayProperty('macronutrientes', e.target.value)}
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput 
                label="Micronutrientes"
                placeholder="Ej: Vitaminas y minerales principales"
                value={day.micronutrientes || ''}
                onChange={(e) => handleUpdateDayProperty('micronutrientes', e.target.value)}
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput 
                label="Requerimientos de hidratación"
                placeholder="Ej: 2-3 litros de agua"
                value={day.requerimientosHidratacion || ''}
                onChange={(e) => handleUpdateDayProperty('requerimientosHidratacion', e.target.value)}
              />
            </Grid.Col>
          </Grid>
        </Collapse>
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
            onUpdate={(updatedComida) => handleUpdateComida(index, updatedComida)}
            dietaId={dietaId}
            diaCompleto={day}
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
              }, false);
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