import React from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Card,
  Group,
  ActionIcon,
  Box
} from '@mantine/core';
import {
  IconMapPin,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GoogleCalendarEvent } from '../../types/googleCalendar';

interface EventsListProps {
  events: GoogleCalendarEvent[];
  currentDate: Date;
  onEventSelect: (event: GoogleCalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  currentDate,
  onEventSelect,
  onEventDelete
}) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <Paper p="md" radius="lg" withBorder>
      <Title order={4} mb="md">
        Eventos de {format(currentDate, 'MMMM yyyy', { locale: es })}
      </Title>
      <Stack gap="sm">
        {events.map((event) => (
          <Card key={event.id} p="sm" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <Box style={{ flex: 1 }}>
                <Text fw={600} size="sm">
                  {event.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {format(new Date(event.start), 'dd/MM/yyyy HH:mm', { locale: es })} - {format(new Date(event.end), 'HH:mm', { locale: es })}
                </Text>
                {event.location && (
                  <Group gap={4} mt={4}>
                    <IconMapPin size={12} />
                    <Text size="xs" c="dimmed">
                      {event.location}
                    </Text>
                  </Group>
                )}
                {event.description && (
                  <Text size="xs" c="dimmed" mt={4}>
                    {event.description}
                  </Text>
                )}
              </Box>
              <Group gap="xs">
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => onEventSelect(event)}
                >
                  <IconEdit size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={() => onEventDelete(event.id)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>
    </Paper>
  );
};

export default EventsList;
