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
import PlatoFormConIngredientes from '../../components/forms/diets/PlatoFormConIngredientes';
import { actualizarDiaDieta } from '../../services/dietService';
import { actualizarPlatos, crearPlato, eliminarPlato } from '../../services/platoService';

interface ComidaEditorProps {
  comida: Comida;
  comidaIndex: number;
  diaIndex: number;
  onUpdate: (updatedComida: Comida) => void;
  dietaId?: string;
  diaCompleto?: DiaDieta; // Para tener acceso a todas las comidas del día
  onRecalcularCalorias?: () => void;
}

const ComidaEditor: React.FC<ComidaEditorProps> = ({ comida, comidaIndex, diaIndex, onUpdate, dietaId, diaCompleto, onRecalcularCalorias }) => {
  
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [opened, { toggle }] = useDisclosure(true);
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null);
  const [editingPlatoIndex, setEditingPlatoIndex] = useState<number | null>(null);
  const [formKey, setFormKey] = useState<number>(Date.now()); // Key para forzar re-montaje del formulario
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

  const handleUpdateHora = async (hora: string) => {
    try {
      // Actualizar localmente primero
      const comidaActualizada = {
        ...comida,
        horaEstimada: hora
      };
      
      onUpdate(comidaActualizada);
      
      // Si tenemos dietaId y diaCompleto, guardar en el backend
      if (dietaId && diaCompleto && diaCompleto.comidas) {
        
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
      }
    } catch (error) {
      console.error('Error al actualizar la hora:', error);
      showNotification('Error al guardar la hora. Se mantendrá localmente.', 'error');
    }
  };

  const handleSavePlato = async (plato: Plato) => {
    setIsLoading(true);

    try {
      const updatedPlatos = [...comida.platos];
      let platoFinal: Plato;
      
      if (editingPlatoIndex !== null) {
        // Editando un plato existente - USAR DATOS REACTIVOS MÁS RECIENTES
        platoFinal = {
          ...comida.platos[editingPlatoIndex], // Datos base originales
          ...editingPlato, // ✅ Datos reactivos más recientes (con pesos actualizados)
          ...plato, // Datos del formulario (nombre, etc.)
          orden: editingPlatoIndex + 1 // Mantener orden
        };
        
        
        updatedPlatos[editingPlatoIndex] = platoFinal;
        
        
        // Guardar en backend si hay ID
        if (dietaId && (platoFinal._id || platoFinal.idPlato)) {
          // Agregar los índices necesarios para el backend
          const platoConIndices = {
            ...platoFinal,
            dietaId,
            diaIndex,
            comidaIndex,
            platoIndex: editingPlatoIndex
          };
          
          const respuestaBackend = await actualizarPlatos([platoConIndices]);
          
          // IMPORTANTE: Usar los datos devueltos por el backend para asegurar consistencia
          // respuestaBackend es un array de platos directamente (ver platoService.ts línea 80)
          if (respuestaBackend && Array.isArray(respuestaBackend) && respuestaBackend[0]) {
            const platoActualizadoBackend = respuestaBackend[0];
            
            // FUERZA LA ACTUALIZACIÓN con los datos del backend
            platoFinal = { 
              ...platoFinal, 
              ...platoActualizadoBackend,
              // Asegurar que se copien correctamente los ingredientes
              ingredientesPersonalizados: platoActualizadoBackend.ingredientesPersonalizados || platoFinal.ingredientesPersonalizados
            };
            updatedPlatos[editingPlatoIndex] = platoFinal;
          }
          
          showNotification(`Plato "${platoFinal.nombre}" actualizado correctamente`, 'success');
          
          // ✅ ACTUALIZAR AUTOMÁTICAMENTE EL DÍA DE DIETA TRAS GUARDAR EL PLATO
          if (diaCompleto && onRecalcularCalorias) {
            console.log('🔄 Actualizando día de dieta automáticamente tras guardar plato...');
            onRecalcularCalorias();
          }
        } else if (dietaId) {
          const platoCreado = await crearPlato(dietaId, diaIndex, comidaIndex, platoFinal);
          platoFinal = { ...platoFinal, _id: platoCreado._id };
          updatedPlatos[editingPlatoIndex] = platoFinal;
          showNotification(`Plato "${platoFinal.nombre}" creado correctamente`, 'success');
          
          // ✅ ACTUALIZAR AUTOMÁTICAMENTE EL DÍA DE DIETA TRAS CREAR EL PLATO
          if (diaCompleto && onRecalcularCalorias) {
            console.log('🔄 Actualizando día de dieta automáticamente tras crear plato...');
            onRecalcularCalorias();
          }
        }
      } else {
        // Creando un plato nuevo
        platoFinal = { 
          ...plato,
          orden: comida.platos.length + 1
        };
        
        if (dietaId) {
          const platoCreado = await crearPlato(dietaId, diaIndex, comidaIndex, platoFinal);
          platoFinal = { ...platoFinal, _id: platoCreado._id };
          showNotification(`Plato "${platoFinal.nombre}" añadido correctamente`, 'success');
          
          // ✅ ACTUALIZAR AUTOMÁTICAMENTE EL DÍA DE DIETA TRAS CREAR EL PLATO
          if (diaCompleto && onRecalcularCalorias) {
            console.log('🔄 Actualizando día de dieta automáticamente tras crear plato...');
            onRecalcularCalorias();
          }
        }
        
        updatedPlatos.push(platoFinal);
      }
      
      // UNA SOLA ACTUALIZACIÓN con el estado final completo
      
      // Crear comida completamente nueva para forzar re-render
      const comidaActualizada = {
        ...comida,
        platos: updatedPlatos,
        // Timestamp para forzar detección de cambios
        _lastSaved: Date.now(),
        // Forzar propagación con ID único
        _forceUpdate: `guardado-${Date.now()}-${Math.random()}`
      };
      
      
      // Log detallado de CADA PLATO que se está propagando
      
        // FORZAR propagación tras guardado exitoso
        onUpdate(comidaActualizada);
      
      // FORZAR actualización del editingPlato con los datos más recientes
      if (editingPlatoIndex !== null && updatedPlatos[editingPlatoIndex]) {
        const platoActualizadoLocal = updatedPlatos[editingPlatoIndex];
        setEditingPlato(platoActualizadoLocal);
      }
      
      // Recalcular calorías inmediatamente
      if (onRecalcularCalorias) {
        onRecalcularCalorias();
      }
      
      // Cerrar modal y limpiar estado INMEDIATAMENTE
      closeModal();
      
      // Limpiar estado con delay mínimo para evitar renders con datos vacíos
      setTimeout(() => {
        setEditingPlato(null);
        setEditingPlatoIndex(null);
      }, 0);
      
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
          
          await eliminarPlato(platoId);
          showNotification(`Plato "${platoToDelete.nombre}" eliminado correctamente`, 'success');
          
          // ✅ ACTUALIZAR AUTOMÁTICAMENTE EL DÍA DE DIETA TRAS ELIMINAR EL PLATO
          if (diaCompleto && onRecalcularCalorias) {
            console.log('🔄 Actualizando día de dieta automáticamente tras eliminar plato...');
            onRecalcularCalorias();
          }
        }
      } else {
        // Si no tiene ID, solo eliminar localmente
        showNotification(`Plato "${platoToDelete.nombre}" eliminado localmente`, 'success');
        
        // ✅ ACTUALIZAR AUTOMÁTICAMENTE EL DÍA DE DIETA TRAS ELIMINAR EL PLATO LOCALMENTE
        if (diaCompleto && onRecalcularCalorias) {
          console.log('🔄 Actualizando día de dieta automáticamente tras eliminar plato localmente...');
          onRecalcularCalorias();
        }
      }
      
      // Actualizar la lista de platos localmente
      let updatedPlatos = comida.platos.filter((_, i) => i !== index);
      
      // Reordenar los platos restantes
      updatedPlatos = updatedPlatos.map((plato, i) => ({
        ...plato,
        orden: i + 1 
      }));
      
      onUpdate({
        ...comida,
        platos: updatedPlatos
      });
      
      // Ejecutar recálculo de calorías después de eliminar el plato
      if (onRecalcularCalorias) {
        setTimeout(() => {
          onRecalcularCalorias();
        }, 100);
      }
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
    setFormKey(Date.now()); // Nueva key para forzar re-montaje del formulario
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
                    <Table.Tr key={plato._id || `plato-${index}-${plato.nombre || 'unnamed'}`}>
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
            onClick={() => {
              setEditingPlato(null);
              setEditingPlatoIndex(null);
              setFormKey(Date.now()); // Nueva key para forzar re-montaje del formulario
              openModal();
            }}
          >
            Añadir Plato
          </Button>
        </Group>
      </Collapse>
      
      <Modal 
        opened={modalOpened} 
        onClose={() => {
          setEditingPlato(null);
          setEditingPlatoIndex(null);
          closeModal();
        }}
        title={
          <Text fw={600} c="nutroos-green.6">
            {editingPlato ? "Editar Plato" : "Añadir Plato"}
          </Text>
        }
        size="xl"
        centered
        scrollAreaComponent={undefined}
        zIndex={2000}
        styles={{
          content: {
            maxHeight: '90vh',
            overflow: 'hidden',
            zIndex: 2000
          },
          body: {
            padding: 0,
            maxHeight: 'calc(90vh - 60px)',
            overflow: 'auto'
          },
          overlay: {
            zIndex: 1999
          }
        }}
        overlayProps={{
          color: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)'
        }}
      >
        <Box p="md">
          <PlatoFormConIngredientes 
            key={`plato-form-${formKey}`} // Key controlada para forzar re-montaje cuando sea necesario
            plato={editingPlato || {
              nombre: '',
              orden: comida.platos.length + 1,
              receta: null,
              ingredientesPersonalizados: []
            }}
            onSave={handleSavePlato}
            onCancel={() => {
              setEditingPlato(null);
              setEditingPlatoIndex(null);
              closeModal();
            }}
            onUpdate={(platoActualizado) => {
              // Actualizar la vista previa del plato
              setEditingPlato(platoActualizado);
              
              // TAMBIÉN actualizar el plato en la lista real para cambios reactivos inmediatos
              if (editingPlatoIndex !== null) {
                const updatedPlatos = [...comida.platos];
                updatedPlatos[editingPlatoIndex] = {
                  ...updatedPlatos[editingPlatoIndex],
                  ...platoActualizado
                };
                
                console.log('🔄 Actualizando plato en ComidaEditor:', {
                  platoIndex: editingPlatoIndex,
                  nombre: platoActualizado.nombre,
                  ingredientesPersonalizados: platoActualizado.ingredientesPersonalizados?.length || 0
                });
                
                // Actualizar la comida con el plato modificado
                const comidaActualizada = {
                  ...comida,
                  platos: updatedPlatos,
                  // Timestamp para forzar re-render
                  _lastUpdated: Date.now()
                };
                
                onUpdate(comidaActualizada); // Guardar los cambios permanentemente
                
                // ✅ RECALCULAR CALORÍAS INMEDIATAMENTE cuando cambian los ingredientes o receta
                if (onRecalcularCalorias) {
                  console.log('🧮 Recalculando calorías del día tras cambio de plato...', {
                    platoIndex: editingPlatoIndex,
                    nombre: platoActualizado.nombre,
                    receta: platoActualizado.receta,
                    ingredientesPersonalizados: platoActualizado.ingredientesPersonalizados?.length || 0
                  });
                  onRecalcularCalorias();
                }
              }
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default ComidaEditor;