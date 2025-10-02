import React from 'react';
import {
  Card,
  Text,
  Group,
  Badge,
  Stack,
  Box,
  useMantineColorScheme,
  ActionIcon,
  Tooltip,
  Avatar,
  Divider,
  Rating
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconCalendar,
  IconUser,
  IconChefHat,
  IconBarbell
} from '@tabler/icons-react';
import { Valoracion, TipoTrabajador } from '../../types/valoraciones';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValoracionCardProps {
  valoracion: Valoracion;
  onEdit?: (valoracion: Valoracion) => void;
  onDelete?: (valoracion: Valoracion) => void;
  showActions?: boolean;
  compact?: boolean;
}

const ValoracionCard: React.FC<ValoracionCardProps> = ({
  valoracion,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const getTipoTrabajadorIcon = (tipo: TipoTrabajador) => {
    return tipo === 'Nutricionista' ? IconChefHat : IconBarbell;
  };

  const getTipoTrabajadorColor = (tipo: TipoTrabajador) => {
    return tipo === 'Nutricionista' ? 'green' : 'blue';
  };

  const TipoIcon = getTipoTrabajadorIcon(valoracion.tipoTrabajador);

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        backgroundColor: isDark ? '#1a1b23' : '#ffffff',
        borderColor: isDark ? '#373a40' : '#e9ecef'
      }}
    >
      <Stack gap="sm">
        {/* Header con información del trabajador */}
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Avatar
              size={compact ? "sm" : "md"}
              radius="xl"
              color={getTipoTrabajadorColor(valoracion.tipoTrabajador)}
            >
              <TipoIcon size={compact ? 16 : 20} />
            </Avatar>
            <Box>
              <Text size={compact ? "sm" : "md"} fw={500}>
                {valoracion.trabajador.fullName}
              </Text>
              <Group gap="xs" mt={2}>
                <Badge
                  size="sm"
                  color={getTipoTrabajadorColor(valoracion.tipoTrabajador)}
                  leftSection={<TipoIcon size={12} />}
                >
                  {valoracion.tipoTrabajador}
                </Badge>
                <Text size="xs" color="dimmed">
                  {format(new Date(valoracion.fechaValoracion), 'dd/MM/yyyy', { locale: es })}
                </Text>
              </Group>
            </Box>
          </Group>

          {showActions && (onEdit || onDelete) && (
            <Group gap="xs">
              {onEdit && (
                <Tooltip label="Editar valoración">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => onEdit(valoracion)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip label="Eliminar valoración">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => onDelete(valoracion)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          )}
        </Group>

        <Divider />

        {/* Calificación */}
        <Group gap="xs" align="center">
          <Rating
            value={valoracion.calificacion}
            readOnly
            size={compact ? "sm" : "md"}
            color="yellow"
          />
          <Text size="sm" fw={500} c="dimmed">
            {valoracion.calificacion}/5
          </Text>
        </Group>

        {/* Descripción */}
        {!compact && valoracion.descripcion && (
          <Box>
            <Text size="sm" style={{ lineHeight: 1.5 }}>
              {valoracion.descripcion}
            </Text>
          </Box>
        )}

        {/* Footer con información adicional */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconUser size={14} color="dimmed" />
            <Text size="xs" c="dimmed">
              {valoracion.cliente.fullName}
            </Text>
          </Group>
          
          <Group gap="xs">
            <IconCalendar size={14} color="dimmed" />
            <Text size="xs" c="dimmed">
              {format(new Date(valoracion.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

export default ValoracionCard;
