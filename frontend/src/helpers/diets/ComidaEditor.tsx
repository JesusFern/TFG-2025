import React, { useState, useEffect } from 'react';
import { 
  Title,
  TextInput, 
  Group, 
  Button, 
  Box,
  ActionIcon, 
  Table,
  useMantineColorScheme,
  Collapse,
  Badge,
  Text,
  Modal,
  Paper,
  LoadingOverlay,
  Notification,
  Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconClock, 
  IconBowl, 
  IconChevronDown, 
  IconChevronUp,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { Comida, Plato, DiaDieta } from '../../types';
import PlatoForm from '../../components/forms/diets/PlatoForm';
import { actualizarDiaDieta } from '../../services/dietService';
import { actualizarPlatos, crearPlato, eliminarPlato } from '../../services/platoService';

interface ComidaEditorProps {
  comida: Comida;
  comidaIndex: number;
  diaIndex: number;
  onUpdate: (updatedComida: Comida, markAsChanged?: boolean) => void;
  dietaId?: string;
  diaCompleto?: DiaDieta; // Para tener acceso a todas las comidas del día
}

const ComidaEditor: React.FC<ComidaEditorProps> = ({ comida, comidaIndex, diaIndex, onUpdate, dietaId, diaCompleto }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [opened, { toggle }] = useDisclosure(true);
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null);
  const [editingPlatoIndex, setEditingPlatoIndex] = useState<number | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
  const [horaTemporal, setHoraTemporal] = useState(comida.horaEstimada);
  const [editandoHora, setEditandoHora] = useState(false);
  const [errorHora, setErrorHora] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  const tiposComida = [
    { index: 0, nombre: 'Desayuno', hora: '08:00' },
    { index: 1, nombre: 'Media mañana', hora: '11:00' },
    { index: 2, nombre: 'Almuerzo', hora: '14:00' },
    { index: 3, nombre: 'Merienda', hora: '17:00' },
    { index: 4, nombre: 'Cena', hora: '21:00' },
    { index: 5, nombre: 'Snack nocturno', hora: '23:00' }
  ];

  // Sincronizar hora temporal cuando cambie la hora de la comida
  useEffect(() => {
    setHoraTemporal(comida.horaEstimada);
    setEditandoHora(false);
    setErrorHora(null);
  }, [comida.horaEstimada]);

  // Función para validar el formato de hora XX:XX
  const validarFormatoHora = (hora: string): boolean => {
    if (!hora) return true; // Permitir campo vacío
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(hora);
  };

  // Función para manejar el cambio de hora temporal
  const handleCambioHoraTemporal = (nuevaHora: string) => {
    setHoraTemporal(nuevaHora);
    setErrorHora(null);
    
    if (nuevaHora && !validarFormatoHora(nuevaHora)) {
      setErrorHora('Formato inválido. Use XX:XX (ej: 08:30)');
    }
  };

  // Función para iniciar la edición de hora
  const iniciarEdicionHora = () => {
    setEditandoHora(true);
    setErrorHora(null);
  };

  // Función para cancelar la edición de hora
  const cancelarEdicionHora = () => {
    setHoraTemporal(comida.horaEstimada);
    setEditandoHora(false);
    setErrorHora(null);
  };

  // Función para confirmar el cambio de hora
  const confirmarCambioHora = async () => {
    if (!validarFormatoHora(horaTemporal)) {
      setErrorHora('Formato inválido. Use XX:XX (ej: 08:30)');
      return;
    }

    if (horaTemporal === comida.horaEstimada) {
      setEditandoHora(false);
      return;
    }

    await handleUpdateHora(horaTemporal);
    setEditandoHora(false);
  };

  const handleUpdateHora = async (hora: string) => {
    try {
      // Actualizar localmente primero
      const comidaActualizada = {
        ...comida,
        horaEstimada: hora
      };
      
      onUpdate(comidaActualizada, false);
      
      // Si tenemos dietaId y diaCompleto, guardar en el backend
      if (dietaId && diaCompleto && diaCompleto.comidas) {
        console.log('Actualizando hora en el backend:', { diaIndex, comidaIndex, hora });
        
        // Crear el array de comidas con la hora actualizada
        const comidasActualizadas = diaCompleto.comidas.map((comidaDelDia: Comida, index: number) => {
          if (index === comidaIndex) {
            return {
              horaEstimada: hora,
              nombreComida: comidaDelDia.nombreComida || ''
            };
          }
          return {
            horaEstimada: comidaDelDia.horaEstimada || '',
            nombreComida: comidaDelDia.nombreComida || ''
          };
        });
        
        // Usar type assertion para evitar el error de TypeScript
        await actualizarDiaDieta(dietaId, diaIndex, {
          comidas: comidasActualizadas as Comida[]
        });
        
        showNotification(`Hora actualizada a ${hora}`, 'success');
      } else {
        console.log('Actualizando hora solo localmente (sin dietaId o diaCompleto)');
      }
    } catch (error) {
      console.error('Error al actualizar la hora:', error);
      showNotification('Error al guardar la hora. Se mantendrá localmente.', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSavePlato = async (plato: Plato) => {
    setIsLoading(true);

    try {
      let updatedPlatos;
      let platoToUpdate: Plato;
      
      if (editingPlatoIndex !== null) {
        // Editando un plato existente
        platoToUpdate = { ...comida.platos[editingPlatoIndex], ...plato };
        platoToUpdate.orden = editingPlatoIndex + 1;
        updatedPlatos = [...comida.platos];
        updatedPlatos[editingPlatoIndex] = platoToUpdate;
        
        if (dietaId && (platoToUpdate._id || platoToUpdate.idPlato)) {
          console.log('Actualizando plato existente:', platoToUpdate);
          await actualizarPlatos([platoToUpdate]);
          showNotification(`Plato "${platoToUpdate.nombre}" actualizado correctamente`, 'success');
        } else if (dietaId) {
          console.log('Creando plato nuevo (caso de edición sin ID)');
          const platoCreado = await crearPlato(dietaId, diaIndex, comidaIndex, platoToUpdate);
          platoToUpdate = { ...platoToUpdate, _id: platoCreado._id };
          updatedPlatos[editingPlatoIndex] = platoToUpdate;
          showNotification(`Plato "${platoToUpdate.nombre}" creado correctamente`, 'success');
        } else {
          console.log('Sin dietaId - guardando solo localmente');
          showNotification(`Plato "${platoToUpdate.nombre}" guardado localmente`, 'success');
        }
      } else {
        // Creando un plato nuevo
        platoToUpdate = { 
          ...plato,
          orden: comida.platos.length + 1
        };
        updatedPlatos = [...comida.platos, platoToUpdate];
        
        if (dietaId) {
          console.log('Creando plato nuevo:', platoToUpdate);
          try {
            const platoCreado = await crearPlato(dietaId, diaIndex, comidaIndex, platoToUpdate);
            platoToUpdate = { ...platoToUpdate, _id: platoCreado._id };
            updatedPlatos[updatedPlatos.length - 1] = platoToUpdate;
            showNotification(`Plato "${platoToUpdate.nombre}" añadido correctamente`, 'success');
          } catch (error) {
            console.error('Error al crear el plato:', error);
            showNotification('Error al crear el plato. Se guardará localmente.', 'error');
          }
        } else {
          console.log('Sin dietaId - guardando solo localmente');
          showNotification(`Plato "${platoToUpdate.nombre}" guardado localmente`, 'success');
        }
      }
      
      console.log('handleSavePlato en ComidaEditor, pasando markAsChanged: false');
      onUpdate({
        ...comida,
        platos: updatedPlatos
      }, false);
      
      setEditingPlato(null);
      setEditingPlatoIndex(null);
      closeModal();
    } catch (error) {
      console.error('Error al guardar el plato:', error);
      showNotification(error instanceof Error ? error.message : 'Error al guardar el plato', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlato = async (index: number) => {
    setIsLoading(true);

    try {
      const platoToDelete = comida.platos[index];
      
      if (dietaId && (platoToDelete._id || platoToDelete.idPlato)) {
        // Si el plato tiene ID, eliminarlo del backend
        const platoId = platoToDelete._id || platoToDelete.idPlato;
        if (platoId) {
          console.log('Eliminando plato del backend:', platoId);
          
          await eliminarPlato(platoId);
          showNotification(`Plato "${platoToDelete.nombre}" eliminado correctamente`, 'success');
        }
      } else {
        // Si no tiene ID, solo eliminar localmente
        console.log('Plato sin ID - eliminando solo localmente');
        showNotification(`Plato "${platoToDelete.nombre}" eliminado localmente`, 'success');
      }
      
      // Actualizar la lista de platos localmente
      let updatedPlatos = comida.platos.filter((_, i) => i !== index);
      
      // Reordenar los platos restantes
      updatedPlatos = updatedPlatos.map((plato, i) => ({
        ...plato,
        orden: i + 1 
      }));
      
      console.log('handleDeletePlato en ComidaEditor, pasando markAsChanged: false');
      onUpdate({
        ...comida,
        platos: updatedPlatos
      }, false);
    } catch (error) {
      console.error('Error al eliminar el plato:', error);
      showNotification(error instanceof Error ? error.message : 'Error al eliminar el plato', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPlato = (plato: Plato, index: number) => {
    setEditingPlato(plato);
    setEditingPlatoIndex(index);
    openModal();
  };

  const nombreComida = tiposComida[comidaIndex]?.nombre || `Comida ${comidaIndex + 1}`;

  return (
    <Box style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />
      
      {notification.show && (
        <Notification 
          color={notification.type === 'success' ? 'nutroos-green' : 'red'}
          title={notification.type === 'success' ? 'Éxito' : 'Error'}
          withCloseButton
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          icon={notification.type === 'success' ? <IconCheck size={16} /> : <IconX size={16} />}
          style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            zIndex: 1000,
            maxWidth: '400px',
            boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)'
          }}
        >
          {notification.message}
        </Notification>
      )}
      
      <Group justify="space-between" mb="xs">
        <Group>
          <IconClock size={18} color={isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'} />
          <Title order={4} c={isDark ? "gray.0" : "gray.8"}>
            {nombreComida}
          </Title>
          <Badge color="nutroos-green" variant="light" size="sm">
            {comida.platos.length} platos
          </Badge>
        </Group>
        
        <Group gap="xs">
          {editandoHora ? (
            <Group gap="xs" align="flex-end">
              <Tooltip 
                label="Formato: HH:MM (ej: 08:30, 14:15)" 
                position="top"
                withArrow
              >
                <TextInput
                  placeholder="HH:MM"
                  value={horaTemporal}
                  onChange={(e) => handleCambioHoraTemporal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      confirmarCambioHora();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelarEdicionHora();
                    }
                  }}
                  size="xs"
                  leftSection={<IconClock size={16} />}
                  error={errorHora}
                  style={{ minWidth: 100 }}
                  autoFocus
                />
              </Tooltip>
              <Group gap={2}>
                <ActionIcon 
                  size="xs" 
                  onClick={confirmarCambioHora}
                  color="green"
                  disabled={!!errorHora || horaTemporal === comida.horaEstimada}
                >
                  <IconCheck size={12} />
                </ActionIcon>
                <ActionIcon 
                  size="xs" 
                  onClick={cancelarEdicionHora}
                  color="red"
                >
                  <IconX size={12} />
                </ActionIcon>
              </Group>
            </Group>
          ) : (
            <Group gap="xs">
              <TextInput
                placeholder="Hora estimada"
                value={comida.horaEstimada || ''}
                readOnly
                size="xs"
                leftSection={<IconClock size={16} />}
                rightSection={
                  <ActionIcon 
                    size="xs" 
                    onClick={iniciarEdicionHora}
                    color="nutroos-green"
                  >
                    <IconEdit size={12} />
                  </ActionIcon>
                }
                style={{ minWidth: 100 }}
              />
              {!comida.horaEstimada && comidaIndex < tiposComida.length && (
                <Button
                  size="xs"
                  variant="light"
                  color="nutroos-green"
                  onClick={() => handleUpdateHora(tiposComida[comidaIndex].hora)}
                >
                  {tiposComida[comidaIndex].hora}
                </Button>
              )}
            </Group>
          )}
          <ActionIcon 
            onClick={toggle} 
            variant="subtle" 
            color="gray"
          >
            {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        </Group>
      </Group>

      <Collapse in={opened}>
        {comida.platos.length > 0 ? (
          <Box my="md">
            <Paper 
              withBorder 
              p={0} 
              style={{
                borderColor: 'var(--app-border-color)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <Table 
                striped
                highlightOnHover 
                style={{ overflow: 'hidden', tableLayout: 'fixed', width: '100%' }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '85%' }}>Nombre del Plato</Table.Th>
                    <Table.Th style={{ width: '15%', textAlign: 'center' }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {comida.platos.map((plato, index) => (
                    <Table.Tr key={index}>
                      <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Group gap="xs" wrap="nowrap">
                          <IconBowl size={16} color="var(--app-accent)" />
                          <Text size="sm" lineClamp={1}>{plato.nombre}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Group gap="xs" justify="center" wrap="nowrap">
                          <ActionIcon 
                            size="sm" 
                            color="nutroos-green"
                            onClick={() => handleEditPlato(plato, index)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon 
                            size="sm" 
                            color="red"
                            onClick={() => handleDeletePlato(index)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Box>
        ) : (
          <Box py="md" style={{ textAlign: 'center' }}>
            <Text size="sm" c="dimmed">No hay platos en esta comida</Text>
          </Box>
        )}
        
        <Group justify="center" mt="md">
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            color="nutroos-green"
            size="sm"
            onClick={openModal}
          >
            Añadir Plato
          </Button>
        </Group>
      </Collapse>
      
      <Modal 
        opened={modalOpened} 
        onClose={closeModal}
        title={
          <Text fw={600} c="nutroos-green.6">
            {editingPlato ? "Editar Plato" : "Añadir Plato"}
          </Text>
        }
        size="lg"
        centered
        overlayProps={{
          color: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)'
        }}
      >
        <Box p="md">
          <PlatoForm 
            plato={editingPlato || {
              nombre: '',
              orden: comida.platos.length + 1,
              receta: null
            }}
            onSave={handleSavePlato}
            onCancel={closeModal}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default ComidaEditor;