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
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconCalendar,
  IconCheck,
  IconX,
  IconAlertCircle
} from '@tabler/icons-react';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
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
    createEvent,
    updateEvent,
    deleteEvent,
    clearError
  } = useGoogleCalendar();

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

  // Función para crear evento
  const handleCreateEvent = async (values: CalendarEventFormData) => {
    try {
      // Convertir a Date si es necesario
      const startDateObj = values.startDate instanceof Date ? values.startDate : new Date(values.startDate);
      const endDateObj = values.endDate instanceof Date ? values.endDate : new Date(values.endDate);
      
      // Crear fechas de manera simple y directa
      const startDateStr = startDateObj.toISOString().split('T')[0];
      const endDateStr = endDateObj.toISOString().split('T')[0];
      
      // Crear fechas usando el constructor Date con parámetros individuales
      const startDate = new Date(startDateStr + 'T' + values.startTime + ':00');
      const endDate = new Date(endDateStr + 'T' + values.endTime + ':00');

      await createEvent({
        title: values.title,
        description: values.description,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        location: values.location,
        attendees: values.attendees.filter((email: string) => email.trim() !== '')
      });

      notifications.show({
        title: 'Éxito',
        message: 'Evento creado correctamente',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      console.error('Error creando evento:', error);
      notifications.show({
        title: 'Error',
        message: `No se pudo crear el evento: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        color: 'red',
        icon: <IconX size={16} />
      });
      throw error; // Re-lanzar para que el modal pueda manejarlo
    }
  };

  // Función para editar evento
  const handleEditEvent = async (values: CalendarEventFormData) => {
    if (!editingEvent) return;

    try {
      // Convertir a Date si es necesario
      const startDateObj = values.startDate instanceof Date ? values.startDate : new Date(values.startDate);
      const endDateObj = values.endDate instanceof Date ? values.endDate : new Date(values.endDate);
      
      // Crear fechas de manera simple y directa
      const startDateStr = startDateObj.toISOString().split('T')[0];
      const endDateStr = endDateObj.toISOString().split('T')[0];
      
      // Crear fechas usando el constructor Date con parámetros individuales
      const startDate = new Date(startDateStr + 'T' + values.startTime + ':00');
      const endDate = new Date(endDateStr + 'T' + values.endTime + ':00');

      await updateEvent(editingEvent.id, {
        title: values.title,
        description: values.description,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        location: values.location,
        attendees: values.attendees.filter((email: string) => email.trim() !== '')
      });

      notifications.show({
        title: 'Éxito',
        message: 'Evento actualizado correctamente',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      console.error('Error actualizando evento:', error);
      notifications.show({
        title: 'Error',
        message: `No se pudo actualizar el evento: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        color: 'red',
        icon: <IconX size={16} />
      });
      throw error; // Re-lanzar para que el modal pueda manejarlo
    }
  };

  // Función para eliminar evento
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      notifications.show({
        title: 'Éxito',
        message: 'Evento eliminado correctamente',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      console.error('Error eliminando evento:', error);
      notifications.show({
        title: 'Error',
        message: `No se pudo eliminar el evento: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        color: 'red',
        icon: <IconX size={16} />
      });
      throw error; // Re-lanzar para que el modal pueda manejarlo
    }
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
    <Stack gap="md" className={className}>
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