import React from 'react';
import { Grid, Text, Select, Alert } from '@mantine/core';
import { IconCalendar, IconClock, IconAlertCircle } from '@tabler/icons-react';
import DatePickerInput from './DatePickerInput';
import { isFechaValida } from '../../constants/citas';

interface CamposFechaHoraCitaProps {
  fecha: Date | null;
  hora: string;
  horariosDisponibles: string[];
  loadingHorarios: boolean;
  disabled?: boolean;
  onFechaChange: (date: Date | null) => void;
  onHoraChange: (hora: string) => void;
}

const CamposFechaHoraCita: React.FC<CamposFechaHoraCitaProps> = ({
  fecha,
  hora,
  horariosDisponibles,
  loadingHorarios,
  disabled = false,
  onFechaChange,
  onHoraChange
}) => {
  return (
    <Grid>
      <Grid.Col span={6}>
        <div>
          <Text size="sm" fw={500} mb="xs">
            Fecha *
          </Text>
          <DatePickerInput
            placeholder="Selecciona una fecha"
            value={fecha}
            onChange={onFechaChange}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 3 meses
            leftSection={<IconCalendar size={16} />}
            disabled={disabled}
          />
          {fecha && !isFechaValida(fecha) && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mt="xs">
              No se pueden programar citas en fechas pasadas
            </Alert>
          )}
        </div>
      </Grid.Col>
      
      <Grid.Col span={6}>
        <div>
          <Text size="sm" fw={500} mb="xs">
            Hora *
          </Text>
          <Select
            placeholder="Selecciona una hora"
            data={horariosDisponibles.map(h => ({
              value: h,
              label: h
            }))}
            leftSection={<IconClock size={16} />}
            disabled={disabled || !fecha || loadingHorarios}
            value={hora}
            onChange={(value) => onHoraChange(value || '')}
          />
          {loadingHorarios && (
            <Text size="xs" c="dimmed" mt={4}>
              Cargando horarios disponibles...
            </Text>
          )}
        </div>
      </Grid.Col>
    </Grid>
  );
};

export default CamposFechaHoraCita;
