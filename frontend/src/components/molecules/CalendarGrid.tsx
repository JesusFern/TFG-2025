import React from 'react';
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Grid,
  Card,
  Badge,
  ActionIcon,
  Stack,
  ScrollArea
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';
import { format, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { GoogleCalendarEvent } from '../../types/googleCalendar';

interface CalendarGridProps {
  currentDate: Date;
  calendarDays: Date[];
  events: GoogleCalendarEvent[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: GoogleCalendarEvent) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  calendarDays,
  events,
  selectedDate,
  onDateSelect,
  onEventSelect,
  onPreviousMonth,
  onNextMonth,
  onToday
}) => {
  // Obtener eventos para una fecha específica
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, date);
    });
  };

  return (
    <Paper p="md" radius="lg" withBorder>
      <Group justify="space-between" align="center" mb="md">
        <Group gap="sm">
          <ActionIcon variant="light" onClick={onPreviousMonth}>
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Button variant="light" onClick={onToday}>
            Hoy
          </Button>
          <ActionIcon variant="light" onClick={onNextMonth}>
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
        <Title order={3}>
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </Title>
        <div></div>
      </Group>

      {/* Calendario Grid */}
      <Grid>
        {/* Días de la semana */}
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
          <Grid.Col key={day} span={1.7}>
            <Text ta="center" fw={600} c="dimmed" size="sm">
              {day}
            </Text>
          </Grid.Col>
        ))}

        {/* Días del mes */}
        {calendarDays.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <Grid.Col key={day.toISOString()} span={1.7}>
              <Card
                h={120}
                p="xs"
                radius="md"
                style={{
                  cursor: 'pointer',
                  opacity: isCurrentMonth ? 1 : 0.4,
                  backgroundColor: isToday ? 'var(--mantine-color-blue-0)' : undefined,
                  border: isSelected ? '2px solid var(--mantine-color-blue-6)' : undefined
                }}
                onClick={() => onDateSelect(day)}
              >
                <Stack gap="xs" h="100%">
                  <Text
                    size="sm"
                    fw={isToday ? 700 : 500}
                    c={isToday ? 'blue' : isCurrentMonth ? 'dark' : 'dimmed'}
                  >
                    {format(day, 'd')}
                  </Text>
                  <ScrollArea h="100%" scrollbarSize={2}>
                    <Stack gap={2}>
                      {dayEvents.slice(0, 3).map((event) => (
                        <Badge
                          key={event.id}
                          size="xs"
                          variant="light"
                          color="blue"
                          fullWidth
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventSelect(event);
                          }}
                        >
                          <Text size="xs" truncate>
                            {event.title}
                          </Text>
                        </Badge>
                      ))}
                      {dayEvents.length > 3 && (
                        <Text size="xs" c="dimmed" ta="center">
                          +{dayEvents.length - 3} más
                        </Text>
                      )}
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default CalendarGrid;
