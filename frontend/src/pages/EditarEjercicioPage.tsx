import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Group, NumberInput, Select, Stack, TextInput, Textarea, Title, LoadingOverlay, Alert, Text, Paper, Breadcrumbs, Anchor, ActionIcon, Box } from '@mantine/core';
import { IconAlertCircle, IconHome, IconChevronRight, IconBarbell } from '@tabler/icons-react';
import trainingService from '../services/trainingService';
import type { ActualizarEjercicioDTO, Ejercicio } from '../types/training';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import { motion } from 'framer-motion';

const dificultadOptions = ['Principiante', 'Intermedio', 'Avanzado'].map(v => ({ value: v, label: v }));
const intensidadOptions = ['Baja', 'Media', 'Alta'].map(v => ({ value: v, label: v }));

const EditarEjercicioPage: React.FC = () => {
  const navigate = useNavigate();
  const { ejercicioId } = useParams();
  const [form, setForm] = useState<Ejercicio | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!ejercicioId) return;
      setLoading(true);
      try {
        const data = await trainingService.obtenerEjercicioPorId(ejercicioId);
        setForm(data);
      } catch (e) {
        setNotice({ message: (e as Error).message || 'Error al cargar ejercicio', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [ejercicioId]);

  const handleChange = (field: keyof Ejercicio, value: unknown) => {
    setForm(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!ejercicioId || !form) return;
    setFormError(null);
    if (!form.nombre.trim()) { setFormError('El nombre del ejercicio es obligatorio'); return; }
    if (!form.grupoMuscular.trim()) { setFormError('El grupo muscular es obligatorio'); return; }
    if (!form.series || form.series < 1) { setFormError('Las series deben ser al menos 1'); return; }
    if (!form.repeticiones || form.repeticiones < 1) { setFormError('Las repeticiones deben ser al menos 1'); return; }
    setLoading(true);
    try {
      const payload: ActualizarEjercicioDTO = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        grupoMuscular: form.grupoMuscular,
        equipamiento: form.equipamiento,
        series: form.series,
        repeticiones: form.repeticiones,
        tiempoDescanso: form.tiempoDescanso,
        nivelDificultad: form.nivelDificultad,
        nivelIntensidad: form.nivelIntensidad,
        videoDemostrativo: form.videoDemostrativo,
      };
      await trainingService.actualizarEjercicio(ejercicioId, payload);
      setNotice({ message: 'Ejercicio actualizado', type: 'success' });
      navigate('/training/ejercicios');
    } catch (e) {
      setNotice({ message: (e as Error).message || 'Error al actualizar', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!form) {
    return (
      <Container size="sm" style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <Title order={3}>Cargando ejercicio...</Title>
      </Container>
    );
  }

  const breadcrumbItems = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Editar ejercicio', href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm" c="nutroos-green">
      {item.icon && (
        <Group gap={4}>
          {item.icon}
          <span>{item.title}</span>
        </Group>
      )}
      {!item.icon && item.title}
    </Anchor>
  ));

  return (
    <Container size="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      {notice?.message && (
        <GlobalNotificationOverlay
          message={notice.message}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}
      <Paper 
        p="md" 
        mb="lg" 
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderBottom: '1px solid var(--app-border-color)' 
        }}
      >
        <Breadcrumbs separator={<IconChevronRight size={14} />}>{breadcrumbItems}</Breadcrumbs>
      </Paper>

      <Paper 
        p="lg" 
        mb="xl" 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)', 
          borderColor: 'var(--app-border-color)' 
        }}
      >
        <Group justify="space-between" mb="md" align="center">
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={5} c="nutroos-green.6">Editar Ejercicio</Title>
            <Text size="sm" c="dimmed">Actualiza los detalles del ejercicio</Text>
          </Box>
          <ActionIcon variant="light" color="nutroos-green" radius="xl" size="lg">
            <IconBarbell size={18} />
          </ActionIcon>
        </Group>

        {formError && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md" withCloseButton onClose={() => setFormError(null)} variant="filled">
              {formError}
            </Alert>
          </motion.div>
        )}

        <Stack gap="sm">
        <TextInput label="Nombre" value={form.nombre} onChange={(e) => handleChange('nombre', e.currentTarget.value)} required />
        <Textarea label="Descripción" value={form.descripcion} onChange={(e) => handleChange('descripcion', e.currentTarget.value)} minRows={3} />
        <TextInput label="Grupo muscular" value={form.grupoMuscular} onChange={(e) => handleChange('grupoMuscular', e.currentTarget.value)} />
        <TextInput label="Equipamiento" value={form.equipamiento} onChange={(e) => handleChange('equipamiento', e.currentTarget.value)} />
        <Group grow>
          <NumberInput label="Series" value={form.series} onChange={(v) => handleChange('series', v || 0)} min={1} />
          <NumberInput label="Repeticiones" value={form.repeticiones} onChange={(v) => handleChange('repeticiones', v || 0)} min={1} />
          <NumberInput label="Descanso (s)" value={form.tiempoDescanso} onChange={(v) => handleChange('tiempoDescanso', v || 0)} min={0} />
        </Group>
        <Group grow>
          <Select label="Dificultad" data={dificultadOptions} value={form.nivelDificultad} onChange={(v) => handleChange('nivelDificultad', v || 'Intermedio')} />
          <Select label="Intensidad" data={intensidadOptions} value={form.nivelIntensidad} onChange={(v) => handleChange('nivelIntensidad', v || 'Media')} />
        </Group>
        <TextInput label="Video demostrativo (URL)" value={form.videoDemostrativo || ''} onChange={(e) => handleChange('videoDemostrativo', e.currentTarget.value)} />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button onClick={() => void handleSubmit()}>Guardar</Button>
        </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default EditarEjercicioPage;


