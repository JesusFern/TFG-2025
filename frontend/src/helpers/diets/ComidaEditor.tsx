import React, { useState } from 'react';
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
  Notification
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
import { Comida, Plato } from '../../types';
import PlatoForm from '../../components/forms/diets/PlatoForm';
import { actualizarPlatos, crearPlato } from '../../services/dietService';

interface ComidaEditorProps {
  comida: Comida;
  comidaIndex: number;
  diaIndex: number;
  onUpdate: (updatedComida: Comida, markAsChanged?: boolean) => void;
  dietaId?: string;
}

const ComidaEditor: React.FC<ComidaEditorProps> = ({ comida, comidaIndex, diaIndex, onUpdate, dietaId }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [opened, { toggle }] = useDisclosure(true);
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null);
  const [editingPlatoIndex, setEditingPlatoIndex] = useState<number | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleUpdateHora = (hora: string) => {
    onUpdate({
      ...comida,
      horaEstimada: hora
    }, false); 
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
          await crearPlato(dietaId, diaIndex, comidaIndex, platoToUpdate);
          showNotification(`Plato "${platoToUpdate.nombre}" creado correctamente`, 'success');
        }
      } else {
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
      let updatedPlatos = comida.platos.filter((_, i) => i !== index);
      
      updatedPlatos = updatedPlatos.map((plato, i) => ({
        ...plato,
        orden: i + 1 
      }));
      
      if (dietaId && 'idPlato' in platoToDelete && platoToDelete.idPlato) {

        await actualizarPlatos([platoToDelete]);
        showNotification(`Plato "${platoToDelete.nombre}" eliminado correctamente`, 'success');
      }
      
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
          <TextInput
            placeholder="Hora estimada"
            value={comida.horaEstimada}
            onChange={(e) => handleUpdateHora(e.target.value)}
            size="xs"
            leftSection={<IconClock size={16} />}
            rightSection={
              !comida.horaEstimada && comidaIndex < tiposComida.length ? (
                <ActionIcon 
                  size="xs" 
                  onClick={() => handleUpdateHora(tiposComida[comidaIndex].hora)}
                  color="nutroos-green"
                >
                  <IconEdit size={12} />
                </ActionIcon>
              ) : null
            }
          />
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