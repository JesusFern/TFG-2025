import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Alert,
  Loader,
  Center,
  Modal,
  TextInput,
  Textarea,
  Grid,
  Badge,
  ActionIcon,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import {
  IconCalendar,
  IconPlus,
  IconTrash,
  IconEdit,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconExternalLink
} from '@tabler/icons-react';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { GoogleCalendarEvent, CalendarEventFormData } from '../../types/googleCalendar';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface GoogleCalendarViewProps {
  onClose?: () => void;
}

export const GoogleCalendarView: React.FC<GoogleCalendarViewProps> = ({ onClose }) => {
  const theme = useMantineTheme();
  const {
    isConnected,
    isConnecting,
    events,
    loading,
    error,
    connectToGoogle,
    disconnectFromGoogle,
    refreshEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError
  } = useGoogleCalendar();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GoogleCalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Mostrar mensaje de éxito cuando se conecta
  useEffect(() => {
    if (isConnected && !isConnecting && !loading) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isConnecting, loading]);

  // Formulario para crear/editar eventos
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      startDate: new Date(),
      startTime: '',
      endDate: new Date(),
      endTime: '',
      location: '',
      attendees: []
    } as CalendarEventFormData,
    validate: {
      title: (value) => (value.length < 1 ? 'El título es requerido' : null),
      startDate: (value) => (!value ? 'La fecha de inicio es requerida' : null),
      startTime: (value) => (value.length < 1 ? 'La hora de inicio es requerida' : null),
      endDate: (value) => (!value ? 'La fecha de fin es requerida' : null),
      endTime: (value) => (value.length < 1 ? 'La hora de fin es requerida' : null),
    }
  });

  // Función para manejar la creación de eventos
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
      
      // Obtener la zona horaria local
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      console.log('Creando evento con datos:', {
        title: values.title,
        description: values.description,
        originalStartDate: values.startDate,
        originalEndDate: values.endDate,
        startDateType: typeof values.startDate,
        endDateType: typeof values.endDate,
        startDate: startDateStr,
        startTime: values.startTime,
        endDate: endDateStr,
        endTime: values.endTime,
        timeZone: timeZone,
        startISO: startDate.toISOString(),
        endISO: endDate.toISOString(),
        startLocal: startDate.toString(),
        endLocal: endDate.toString(),
        location: values.location,
        attendees: values.attendees.filter((email: string) => email.trim() !== '')
      });

      await createEvent({
        title: values.title,
        description: values.description,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        location: values.location,
        attendees: values.attendees.filter((email: string) => email.trim() !== '')
      });

      console.log('Evento creado exitosamente, eventos actuales:', events.length);

      notifications.show({
        title: 'Éxito',
        message: 'Evento creado correctamente',
        color: 'green',
        icon: <IconCheck size={16} />
      });

      setShowCreateModal(false);
      form.reset();
    } catch (error) {
      console.error('Error creando evento:', error);
      notifications.show({
        title: 'Error',
        message: `No se pudo crear el evento: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        color: 'red',
        icon: <IconX size={16} />
      });
    }
  };

  // Función para manejar la edición de eventos
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

      setShowEditModal(false);
      setEditingEvent(null);
      form.reset();
    } catch (error) {
      console.error('Error actualizando evento:', error);
      notifications.show({
        title: 'Error',
        message: `No se pudo actualizar el evento: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        color: 'red',
        icon: <IconX size={16} />
      });
    }
  };

  // Función para manejar la eliminación de eventos
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      notifications.show({
        title: 'Éxito',
        message: 'Evento eliminado correctamente',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'No se pudo eliminar el evento',
        color: 'red',
        icon: <IconX size={16} />
      });
    }
  };

  // Función para abrir modal de edición
  const openEditModal = (event: GoogleCalendarEvent) => {
    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    
    setEditingEvent(event);
    form.setValues({
      title: event.title,
      description: event.description || '',
      startDate,
      startTime: format(startDate, 'HH:mm'),
      endDate,
      endTime: format(endDate, 'HH:mm'),
      location: event.location || '',
      attendees: event.attendees?.map(a => a.email) || []
    });
    setShowEditModal(true);
  };

  // Filtrar eventos por fecha seleccionada
  const eventsForSelectedDate = events.filter(event => {
    const eventDate = parseISO(event.start);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  // Si está cargando el callback de Google, mostrar loading
  if (loading && window.location.search.includes('code=')) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="lg" withBorder>
          <Stack align="center" gap="lg">
            <Loader size="lg" />
            <Title order={2} ta="center">
              Conectando con Google Calendar...
            </Title>
            <Text ta="center" c="dimmed" size="lg">
              Procesando tu autorización, por favor espera.
            </Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Si no está conectado, mostrar pantalla de conexión
  if (!isConnected) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="lg" withBorder>
          <Stack align="center" gap="lg">
            <IconCalendar size={64} color={theme.colors.blue[6]} />
            <Title order={2} ta="center">
              Conectar Google Calendar
            </Title>
            <Text ta="center" c="dimmed" size="lg">
              Conecta tu cuenta de Google Calendar para sincronizar y gestionar tus eventos
            </Text>
            
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
                variant="light"
                style={{ width: '100%' }}
              >
                {error}
              </Alert>
            )}

            <Group>
              <Button
                leftSection={<IconCalendar size={16} />}
                onClick={connectToGoogle}
                loading={isConnecting}
                size="lg"
                color="blue"
              >
                Conectar con Google
              </Button>
              {onClose && (
                <Button
                  variant="light"
                  onClick={onClose}
                  size="lg"
                >
                  Cancelar
                </Button>
              )}
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Paper p="lg" radius="lg" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Title order={2}>
                <Group gap="sm">
                  <IconCalendar size={32} color={theme.colors.blue[6]} />
                  Google Calendar
                </Group>
              </Title>
              <Text c="dimmed">
                Gestiona tus eventos y sincronízalos con Google Calendar
              </Text>
            </div>
            <Group>
              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={refreshEvents}
                loading={loading}
                variant="light"
              >
                Actualizar
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setShowCreateModal(true)}
                color="blue"
              >
                Nuevo Evento
              </Button>
              <Button
                leftSection={<IconX size={16} />}
                onClick={disconnectFromGoogle}
                variant="outline"
                color="red"
                loading={loading}
              >
                Desconectar
              </Button>
              {onClose && (
                <Button
                  variant="light"
                  onClick={onClose}
                >
                  Cerrar
                </Button>
              )}
            </Group>
          </Group>
        </Paper>

        {/* Success Alert */}
        {showSuccessMessage && (
          <Alert
            icon={<IconCheck size={16} />}
            title="¡Conectado exitosamente!"
            color="green"
            variant="light"
            withCloseButton
            onClose={() => setShowSuccessMessage(false)}
          >
            Tu Google Calendar se ha conectado correctamente. Los eventos se han sincronizado.
          </Alert>
        )}

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

        {/* Vista de eventos */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="lg" radius="lg" withBorder>
              <Stack gap="md">
                <Title order={4}>Seleccionar Fecha</Title>
                <DatePickerInput
                  value={selectedDate}
                  onChange={(value) => value && setSelectedDate(new Date(value))}
                  placeholder="Selecciona una fecha"
                />
                <Text size="sm" c="dimmed">
                  {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper p="lg" radius="lg" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={4}>
                    Eventos del {format(selectedDate, 'd MMMM', { locale: es })}
                  </Title>
                  <Badge color="blue" variant="light">
                    {eventsForSelectedDate.length} eventos
                  </Badge>
                </Group>

                {loading ? (
                  <Center py="xl">
                    <Stack align="center" gap="md">
                      <Loader size="lg" />
                      <Text c="dimmed">Cargando eventos...</Text>
                    </Stack>
                  </Center>
                ) : eventsForSelectedDate.length === 0 ? (
                  <Center py="xl">
                    <Stack align="center" gap="md">
                      <IconCalendar size={48} color={theme.colors.gray[4]} />
                      <Text c="dimmed">No hay eventos para esta fecha</Text>
                    </Stack>
                  </Center>
                ) : (
                  <Stack gap="sm">
                    {eventsForSelectedDate.map((event) => (
                      <Paper
                        key={event.id}
                        p="md"
                        radius="md"
                        withBorder
                        style={{
                          borderLeft: `4px solid ${theme.colors.blue[6]}`
                        }}
                      >
                        <Group justify="space-between" align="flex-start">
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Title order={5}>{event.title}</Title>
                            {event.description && (
                              <Text size="sm" c="dimmed">
                                {event.description}
                              </Text>
                            )}
                            <Group gap="md">
                              <Text size="xs" c="dimmed">
                                {format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}
                              </Text>
                              {event.location && (
                                <Text size="xs" c="dimmed">
                                  📍 {event.location}
                                </Text>
                              )}
                            </Group>
                            {event.attendees && event.attendees.length > 0 && (
                              <Text size="xs" c="dimmed">
                                👥 {event.attendees.map(a => a.email).join(', ')}
                              </Text>
                            )}
                          </Stack>
                          <Group gap="xs">
                            {event.htmlLink && (
                              <Tooltip label="Ver en Google Calendar">
                                <ActionIcon
                                  component="a"
                                  href={event.htmlLink}
                                  target="_blank"
                                  variant="light"
                                  size="sm"
                                >
                                  <IconExternalLink size={14} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            <Tooltip label="Editar">
                              <ActionIcon
                                onClick={() => openEditModal(event)}
                                variant="light"
                                color="blue"
                                size="sm"
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Eliminar">
                              <ActionIcon
                                onClick={() => handleDeleteEvent(event.id)}
                                variant="light"
                                color="red"
                                size="sm"
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Modal para crear evento */}
        <Modal
          opened={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Crear Nuevo Evento"
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleCreateEvent)}>
            <Stack gap="md">
              <TextInput
                label="Título"
                placeholder="Título del evento"
                required
                {...form.getInputProps('title')}
              />
              
              <Textarea
                label="Descripción"
                placeholder="Descripción del evento"
                rows={3}
                {...form.getInputProps('description')}
              />

              <Grid>
                <Grid.Col span={6}>
                  <DatePickerInput
                    label="Fecha de inicio"
                    placeholder="Selecciona fecha"
                    required
                    {...form.getInputProps('startDate')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TimeInput
                    label="Hora de inicio"
                    placeholder="HH:MM"
                    required
                    {...form.getInputProps('startTime')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <DatePickerInput
                    label="Fecha de fin"
                    placeholder="Selecciona fecha"
                    required
                    {...form.getInputProps('endDate')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TimeInput
                    label="Hora de fin"
                    placeholder="HH:MM"
                    required
                    {...form.getInputProps('endTime')}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label="Ubicación"
                placeholder="Ubicación del evento"
                {...form.getInputProps('location')}
              />

              <Group justify="flex-end" gap="sm">
                <Button
                  type="button"
                  variant="light"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                  Crear Evento
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Modal para editar evento */}
        <Modal
          opened={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Editar Evento"
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleEditEvent)}>
            <Stack gap="md">
              <TextInput
                label="Título"
                placeholder="Título del evento"
                required
                {...form.getInputProps('title')}
              />
              
              <Textarea
                label="Descripción"
                placeholder="Descripción del evento"
                rows={3}
                {...form.getInputProps('description')}
              />

              <Grid>
                <Grid.Col span={6}>
                  <DatePickerInput
                    label="Fecha de inicio"
                    placeholder="Selecciona fecha"
                    required
                    {...form.getInputProps('startDate')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TimeInput
                    label="Hora de inicio"
                    placeholder="HH:MM"
                    required
                    {...form.getInputProps('startTime')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <DatePickerInput
                    label="Fecha de fin"
                    placeholder="Selecciona fecha"
                    required
                    {...form.getInputProps('endDate')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TimeInput
                    label="Hora de fin"
                    placeholder="HH:MM"
                    required
                    {...form.getInputProps('endTime')}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label="Ubicación"
                placeholder="Ubicación del evento"
                {...form.getInputProps('location')}
              />

              <Group justify="flex-end" gap="sm">
                <Button
                  type="button"
                  variant="light"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                  Actualizar Evento
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};
