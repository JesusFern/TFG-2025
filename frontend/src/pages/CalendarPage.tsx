import React from 'react';
import { Container, Title, Text, Paper, Stack, Group, Button } from '@mantine/core';
import { IconArrowLeft, IconCalendar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { GoogleCalendarView } from '../components/organisms/GoogleCalendarView';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Paper p="lg" radius="lg" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Group gap="sm" mb="xs">
                <IconCalendar size={32} />
                <Title order={1}>Calendario</Title>
              </Group>
              <Text c="dimmed" size="lg">
                Gestiona tus eventos y sincronízalos con Google Calendar
              </Text>
            </div>
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="light"
              onClick={handleBackToDashboard}
            >
              Volver al Dashboard
            </Button>
          </Group>
        </Paper>

        {/* Vista del Calendario */}
        <GoogleCalendarView />
      </Stack>
    </Container>
  );
};

export default CalendarPage;
