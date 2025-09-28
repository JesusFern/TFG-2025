import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Button,
  Textarea,
  Rating,
  Alert,
  Paper,
  Divider
} from '@mantine/core';
import { IconStar, IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { actualizarSeguimientoPlato } from '../../services/seguimientoComidaService';
import type { SeguimientoPlato } from '../../types/seguimientoComida';

interface SeguimientoPlatoModalProps {
  opened: boolean;
  onClose: () => void;
  dietaId: string;
  diaIndex: number;
  comidaIndex: number;
  platoIndex: number;
  nombrePlato: string;
  seguimientoActual?: SeguimientoPlato;
  onSeguimientoActualizado: (seguimiento: SeguimientoPlato) => void;
  soloLectura?: boolean;
}

const SeguimientoPlatoModal: React.FC<SeguimientoPlatoModalProps> = ({
  opened,
  onClose,
  dietaId,
  diaIndex,
  comidaIndex,
  platoIndex,
  nombrePlato,
  seguimientoActual,
  onSeguimientoActualizado,
  soloLectura = false
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [satisfaccion, setSatisfaccion] = useState<number>(0);
  const [cumplimiento, setCumplimiento] = useState<number>(0);
  const [notaUsuario, setNotaUsuario] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar valores cuando se abre el modal
  useEffect(() => {
    if (opened) {
      setSatisfaccion(seguimientoActual?.satisfaccion || 0);
      setCumplimiento(seguimientoActual?.cumplimiento || 0);
      setNotaUsuario(seguimientoActual?.notaUsuario || '');
      setError(null);
    }
  }, [opened, seguimientoActual]);

  const handleGuardar = async () => {
    try {
      setLoading(true);
      setError(null);

      const datosActualizacion = {
        satisfaccion: satisfaccion > 0 ? satisfaccion : undefined,
        cumplimiento: cumplimiento > 0 ? cumplimiento : undefined,
        notaUsuario: notaUsuario.trim() || undefined
      };

      const seguimientoActualizado = await actualizarSeguimientoPlato(
        dietaId,
        diaIndex,
        comidaIndex,
        platoIndex,
        datosActualizacion
      );

      onSeguimientoActualizado(seguimientoActualizado);
      onClose();
    } catch (err: unknown) {
      console.error('Error al guardar seguimiento:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setSatisfaccion(seguimientoActual?.satisfaccion || 0);
    setCumplimiento(seguimientoActual?.cumplimiento || 0);
    setNotaUsuario(seguimientoActual?.notaUsuario || '');
    setError(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCancelar}
      title={
        <Text fw={600} size="lg">
          Seguimiento: {nombrePlato}
        </Text>
      }
      size="md"
      centered
    >
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

        {/* Satisfacción */}
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Group gap="xs" align="center">
              <IconStar size={20} color={isDark ? "#ffd43b" : "#fab005"} />
              <Text fw={600} size="sm">
                ¿Te ha gustado la receta?
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Evalúa tu satisfacción con este plato (1 = No me gustó, 5 = Me encantó)
            </Text>
            <Rating
              value={satisfaccion}
              onChange={soloLectura ? undefined : setSatisfaccion}
              size="lg"
              count={5}
              color="yellow"
              readOnly={soloLectura}
            />
            {satisfaccion > 0 && (
              <Text size="xs" c="dimmed">
                {satisfaccion === 1 && "No me gustó"}
                {satisfaccion === 2 && "Regular"}
                {satisfaccion === 3 && "Bien"}
                {satisfaccion === 4 && "Me gustó"}
                {satisfaccion === 5 && "Me encantó"}
              </Text>
            )}
          </Stack>
        </Paper>

        {/* Cumplimiento */}
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Group gap="xs" align="center">
              <IconCheck size={20} color={isDark ? "#51cf66" : "#2f9e44"} />
              <Text fw={600} size="sm">
                ¿Has comido exactamente lo pautado?
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Evalúa qué tanto seguiste la pauta nutricional (1 = No seguí nada, 5 = Seguí exactamente)
            </Text>
            <Rating
              value={cumplimiento}
              onChange={soloLectura ? undefined : setCumplimiento}
              size="lg"
              count={5}
              color="green"
              readOnly={soloLectura}
            />
            {cumplimiento > 0 && (
              <Text size="xs" c="dimmed">
                {cumplimiento === 1 && "No seguí nada"}
                {cumplimiento === 2 && "Seguí poco"}
                {cumplimiento === 3 && "Seguí parcialmente"}
                {cumplimiento === 4 && "Seguí bastante"}
                {cumplimiento === 5 && "Seguí exactamente"}
              </Text>
            )}
          </Stack>
        </Paper>

        {/* Nota del usuario */}
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Nota personal (opcional)
            </Text>
            <Text size="xs" c="dimmed">
              Añade cualquier comentario sobre este plato, ingredientes que cambiaste, etc.
            </Text>
            <Textarea
              value={notaUsuario}
              onChange={soloLectura ? undefined : (event) => setNotaUsuario(event.currentTarget.value)}
              placeholder="Ej: Cambié el pollo por pescado, añadí más verduras..."
              minRows={3}
              maxRows={6}
              maxLength={500}
              readOnly={soloLectura}
            />
            <Text size="xs" c="dimmed" ta="right">
              {notaUsuario.length}/500 caracteres
            </Text>
          </Stack>
        </Paper>

        <Divider />

        {/* Botones de acción */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="outline"
            color="gray"
            onClick={handleCancelar}
            disabled={loading}
          >
            <IconX size={16} />
            {soloLectura ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!soloLectura && (
            <Button
              color="nutroos-green"
              onClick={handleGuardar}
              loading={loading}
              disabled={satisfaccion === 0 && cumplimiento === 0 && !notaUsuario.trim()}
            >
              <IconCheck size={16} />
              Guardar seguimiento
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
};

export default SeguimientoPlatoModal;
