import React, { useState, useCallback, useMemo } from 'react';
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Alert,
  Loader,
  Center
} from '@mantine/core';
import {
  IconPlus,
  IconCalendar,
  IconAlertCircle,
  IconRefresh
} from '@tabler/icons-react';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { useEventHandlers } from '../../hooks/useEventHandlers';
import { GoogleCalendarEvent, CalendarEventFormData } from '../../types/googleCalendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import CreateEventModal from '../molecules/CreateEventModal';
import EditEventModal from '../molecules/EditEventModal';
import CalendarGrid from '../molecules/CalendarGrid';
import EventsList from '../molecules/EventsList';

interface MantineCalendarViewProps {
  className?: string;
}

const MantineCalendarView: React.FC<MantineCalendarViewProps> = ({ className }) => {
  const { 
    isConnected, 
    isConnecting, 
    events, 
    loading, 
    error, 
    connectToGoogle, 
    disconnectFromGoogle, 
    refreshEvents,
    clearError 
  } = useGoogleCalendar();

  const { handleCreateEvent, handleUpdateEvent, handleDeleteEvent } = useEventHandlers();

  // Debug: Log cuando cambien los eventos
  React.useEffect(() => {
    console.log('Eventos actualizados en MantineCalendarView:', events.length, events);
  }, [events]);

  // Estados para modales y calendario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GoogleCalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Obtener eventos para el mes actual
  const getEventsForMonth = useCallback((date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= monthStart && eventStart <= monthEnd;
    });
  }, [events]);

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });
  }, [currentDate]);

  // Navegación del calendario
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Manejar selección de fecha
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  // Manejar selección de evento
  const handleEventSelect = (event: GoogleCalendarEvent) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  // Función para editar evento (wrapper para el hook)
  const handleEditEvent = async (values: CalendarEventFormData) => {
    if (!editingEvent) return;
    await handleUpdateEvent(editingEvent.id, values);
  };

  // Si no está conectado, mostrar botón de conexión
  if (!isConnected) {
    return (
      <Paper p="xl" radius="lg" withBorder className={className}>
        <Stack align="center" gap="lg">
          <IconCalendar size={64} color="var(--mantine-color-gray-5)" />
          <Title order={2} ta="center" c="dimmed">
            Conecta tu Google Calendar
          </Title>
          <Text ta="center" c="dimmed" size="lg">
            Para ver y gestionar tus eventos, necesitas conectar tu cuenta de Google Calendar
          </Text>
          <Button
            leftSection={<IconCalendar size={16} />}
            onClick={connectToGoogle}
            loading={isConnecting}
            size="lg"
          >
            Conectar Google Calendar
          </Button>
        </Stack>
      </Paper>
    );
  }

  // Si está cargando, mostrar loader
  if (loading) {
    return (
      <Paper p="xl" radius="lg" withBorder className={className}>
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Cargando calendario...</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  const monthEvents = getEventsForMonth(currentDate);

  return (
    <Stack gap="md" className={className} key={`calendar-${events.length}`}>
      {/* Error Alert */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
          withCloseButton
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* Header del Calendario */}
      <Paper p="lg" radius="lg" withBorder>
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Mi Calendario</Title>
            <Text c="dimmed" size="sm">
              {events.length} evento{events.length !== 1 ? 's' : ''} sincronizado{events.length !== 1 ? 's' : ''}
            </Text>
          </div>
          <Group gap="sm">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setShowCreateModal(true)}
              size="sm"
            >
              Nuevo Evento
            </Button>
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={refreshEvents}
              loading={loading}
              size="sm"
            >
              Actualizar
            </Button>
            <Button
              variant="light"
              color="red"
              onClick={disconnectFromGoogle}
              size="sm"
            >
              Desconectar
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Calendario Grid */}
      <CalendarGrid
        key={`calendar-grid-${events.length}`}
        currentDate={currentDate}
        calendarDays={calendarDays}
        events={events}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onEventSelect={handleEventSelect}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      {/* Lista de eventos del mes */}
      <EventsList
        key={`events-list-${events.length}`}
        events={monthEvents}
        currentDate={currentDate}
        onEventSelect={handleEventSelect}
        onEventDelete={handleDeleteEvent}
      />

      {/* Modal para crear evento */}
      <CreateEventModal
        opened={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
        loading={loading}
        initialValues={{
          startDate: selectedDate || new Date(),
          startTime: format(new Date(), 'HH:mm'),
          endDate: selectedDate || new Date(),
          endTime: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'), // +1 hora
        }}
      />

      {/* Modal para editar evento */}
      <EditEventModal
        opened={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEvent(null);
        }}
        onSubmit={handleEditEvent}
        onDelete={handleDeleteEvent}
        loading={loading}
        event={editingEvent}
      />
    </Stack>
  );
};

export default MantineCalendarView;