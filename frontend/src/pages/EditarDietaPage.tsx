import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  Tabs, 
  Button, 
  Group, 
  Text, 
  Alert, 
  useMantineColorScheme,
  Box,
  Loader,
  Divider,
  Pagination,
  Badge,
  Select,
  Modal,
  Stack
} from '@mantine/core';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  IconAlertCircle, 
  IconCalendarEvent,
  IconCheck,
  IconTrash
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { format, getDay } from 'date-fns';
import DietaDayEditor from '../helpers/diets/DietaDayEditor';
import { obtenerDieta, publicarDieta, eliminarDieta } from '../services/dietService';
import { obtenerIngredientesPorIds } from '../services/ingredienteService';
import { Dieta, DiaDieta, Ingrediente } from '../types';
import { notifications } from '@mantine/notifications';
import { 
  DIAS_SEMANA, 
  convertirDiaSemana, 
  parseFecha, 
  formatearFecha, 
  crearDatoDia 
} from '../helpers/diets/DietaHelper';
import { actualizarNutricionDia } from '../helpers/calculoNutricionalHelper';

// Las utilidades se han movido a DietaHelper.ts

const EditarDietaPage: React.FC = () => {
  const { dietaId } = useParams<{ dietaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [dieta, setDieta] = useState<Dieta | null>(null);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>("0");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [startDayOfWeek, setStartDayOfWeek] = useState<number>(0);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  
  // ✅ VARIABLES DE CAMBIOS PENDIENTES ELIMINADAS - SE ACTUALIZA AUTOMÁTICAMENTE
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePublicarDieta = async () => {
    if (!dieta || !dietaId) return;
    
    try {
      setPublishLoading(true);
      await publicarDieta(dietaId);
      
      navigate(`/ver-dieta/${dietaId}`);
    } catch (error) {
      console.error('Error al publicar la dieta:', error);
      setError(error instanceof Error ? error.message : 'Error al publicar la dieta');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!dietaId || !dieta) return;

    try {
      setDeleting(true);
      await eliminarDieta(dietaId);
      
      notifications.show({
        title: 'Dieta eliminada',
        message: `La dieta "${dieta.nombre}" ha sido eliminada correctamente`,
        color: 'green',
        position: 'top-right'
      });

      // Redirigir a la lista de clientes después de eliminar
      navigate('/worker/dashboard-clients');
    } catch (error) {
      notifications.show({
        title: 'Error al eliminar',
        message: error instanceof Error ? error.message : 'No se pudo eliminar la dieta',
        color: 'red',
        position: 'top-right'
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const recargarDieta = async () => {
    if (!dietaId) return;
    
    try {
      console.log(`🔄 Recargando dieta completa desde el backend...`);
      const data = await obtenerDieta(dietaId);
      
      // Extraer IDs únicos de ingredientes de la dieta
      const ingredientesIds = new Set<string>();
      data.dias.forEach(dia => {
        dia.comidas.forEach(comida => {
          comida.platos.forEach(plato => {
            if (plato.ingredientesPersonalizados) {
              plato.ingredientesPersonalizados.forEach(ing => {
                const ingredienteId = typeof ing.ingrediente === 'string' 
                  ? ing.ingrediente 
                  : (ing.ingrediente as { _id?: string; id?: string })._id || (ing.ingrediente as { _id?: string; id?: string }).id || '';
                if (ingredienteId) {
                  ingredientesIds.add(ingredienteId);
                }
              });
            }
          });
        });
      });
      
      // Cargar solo los ingredientes necesarios
      if (ingredientesIds.size > 0) {
        const ingredientesData = await obtenerIngredientesPorIds(Array.from(ingredientesIds));
        setIngredientes(ingredientesData);
      }
      
      setDieta(data);
      console.log(`✅ Dieta recargada correctamente`);
    } catch (error) {
      console.error('❌ Error al recargar la dieta:', error);
    }
  };

  const recalcularCaloriasDia = (dayIndex: number) => {
    if (!dieta) return;
    
    console.log(`🔄 Recalculando calorías del día ${dayIndex + 1}...`);
    
    // Recalcular valores nutricionales del día
    const diaActualizado = ingredientes.length > 0 
      ? actualizarNutricionDia(dieta.dias[dayIndex], ingredientes)
      : dieta.dias[dayIndex];
    
    const diasActualizados = [...dieta.dias];
    diasActualizados[dayIndex] = diaActualizado;
    
    const dietaActualizada = {
      ...dieta,
      dias: diasActualizados,
      // Forzar re-render con timestamp único
      _lastUpdated: Date.now(),
      _forceUpdate: `recalc-${Date.now()}-${Math.random()}`
    };
    
    console.log(`✅ Día ${dayIndex + 1} actualizado:`, {
      calorias: diaActualizado.caloriasTotales,
      proteinas: diaActualizado.proteinas,
      hidratosCarbono: diaActualizado.hidratosCarbono,
      grasas: diaActualizado.grasas
    });
    
    setDieta(dietaActualizada);
  };


  const daysRange = useMemo(() => {
    if (!dieta || !fechaInicio) return { days: [], totalWeeks: 0 };
    
    const totalWeeks = Math.ceil((dieta.dias.length + startDayOfWeek) / 7);
    const weekStartIndex = (currentWeek - 1) * 7 - startDayOfWeek;
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const dietDayIndex = weekStartIndex + i;
      
      if (dietDayIndex >= 0 && dietDayIndex < dieta.dias.length) {
        days.push(crearDatoDia(i, dietDayIndex, fechaInicio, dieta.dias));
      }
    }
    
    return { days, totalWeeks };
  }, [dieta, currentWeek, startDayOfWeek, fechaInicio]);

  useEffect(() => {
    const cargarDieta = async () => {
      if (!dietaId) return;
      
      try {
        setLoading(true);
        
        // Cargar solo la dieta primero
        const data = await obtenerDieta(dietaId);
        
        // Extraer IDs únicos de ingredientes de la dieta
        const ingredientesIds = new Set<string>();
        data.dias.forEach(dia => {
          dia.comidas.forEach(comida => {
            comida.platos.forEach(plato => {
              if (plato.ingredientesPersonalizados) {
                plato.ingredientesPersonalizados.forEach(ing => {
                  const ingredienteId = typeof ing.ingrediente === 'string' 
                    ? ing.ingrediente 
                    : (ing.ingrediente as { _id?: string; id?: string })._id || (ing.ingrediente as { _id?: string; id?: string }).id || '';
                  if (ingredienteId) {
                    ingredientesIds.add(ingredienteId);
                  }
                });
              }
            });
          });
        });
        
        // Cargar solo los ingredientes necesarios
        if (ingredientesIds.size > 0) {
          console.log('Cargando ingredientes por IDs:', Array.from(ingredientesIds));
          const ingredientesData = await obtenerIngredientesPorIds(Array.from(ingredientesIds));
          console.log('Ingredientes cargados:', ingredientesData);
          setIngredientes(ingredientesData);
        } else {
          console.log('No se encontraron ingredientes en la dieta');
        }
        
        // Permitir edición de dietas publicadas
        
        if (!data.dias || data.dias.length === 0) {
          const diasInicializados: DiaDieta[] = [];
          for (let i = 0; i < data.duracion; i++) {
            diasInicializados.push({
              caloriasTotales: 0,
              numeroComidas: data.comidasDiarias,
              comidas: Array(data.comidasDiarias).fill(null).map(() => ({
                horaEstimada: '',
                platos: []
              })),
              cumplimiento: false
            });
          }
          data.dias = diasInicializados;
        }
        
        if (data.fechaInicio) {
          const fechaInicioDate = parseFecha(data.fechaInicio);
          setFechaInicio(fechaInicioDate);
          
          const diaSemanaAjustado = convertirDiaSemana(getDay(fechaInicioDate));
          
          console.log(`Fecha de inicio: ${format(fechaInicioDate, 'dd/MM/yyyy')} - Día de la semana: ${DIAS_SEMANA[diaSemanaAjustado]}`);
          setStartDayOfWeek(diaSemanaAjustado);
        }
        
        setDieta(data);
        
        const dayParam = new URLSearchParams(location.search).get('day');
        if (dayParam) {
          const dayIndex = parseInt(dayParam) - 1;
          if (dayIndex >= 0 && dayIndex < data.dias.length) {
            const diaSemanaAjustado = data.fechaInicio ? 
              convertirDiaSemana(getDay(parseFecha(data.fechaInicio))) : 0;
              
            const targetWeek = Math.ceil((dayIndex + 1 + diaSemanaAjustado) / 7);
            setCurrentWeek(targetWeek);
            setActiveTab(dayIndex.toString());
          }
        }
      } catch (err) {
        console.error("Error al cargar la dieta:", err);
        setError("Error al cargar la dieta. Por favor intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDieta();
  }, [dietaId, location.search, navigate]);

  useEffect(() => {
    if (daysRange.days.length > 0 && (activeTab === null || !daysRange.days.some(day => day.dietDayIndex.toString() === activeTab))) {
      setActiveTab(daysRange.days[0].dietDayIndex.toString());
    }
  }, [daysRange.days, activeTab]);


  const handleUpdateDay = async (dayIndex: number, updatedDay: DiaDieta) => {
    if (!dieta) return;
    
    // Extraer IDs de ingredientes del día actualizado
    const nuevosIngredientesIds = new Set<string>();
    updatedDay.comidas.forEach(comida => {
      comida.platos.forEach(plato => {
        if (plato.ingredientesPersonalizados) {
          plato.ingredientesPersonalizados.forEach(ing => {
            const ingredienteId = typeof ing.ingrediente === 'string' 
              ? ing.ingrediente 
              : (ing.ingrediente as { _id?: string; id?: string })._id || (ing.ingrediente as { _id?: string; id?: string }).id || '';
            if (ingredienteId) {
              nuevosIngredientesIds.add(ingredienteId);
            }
          });
        }
      });
    });
    
    // Verificar si hay ingredientes nuevos que no están cargados
    const ingredientesActualesIds = new Set(ingredientes.map(ing => ing.id));
    const ingredientesFaltantes = Array.from(nuevosIngredientesIds).filter(id => !ingredientesActualesIds.has(id));
    
    let ingredientesActualizados = ingredientes;
    
    // Cargar ingredientes faltantes si los hay
    if (ingredientesFaltantes.length > 0) {
      try {
        const nuevosIngredientes = await obtenerIngredientesPorIds(ingredientesFaltantes);
        ingredientesActualizados = [...ingredientes, ...nuevosIngredientes];
        setIngredientes(ingredientesActualizados);
      } catch (error) {
        console.error('❌ Error al cargar ingredientes faltantes:', error);
      }
    }
    
    // Recalcular valores nutricionales con todos los ingredientes disponibles
    const diaConNutricion = ingredientesActualizados.length > 0 
      ? actualizarNutricionDia(updatedDay, ingredientesActualizados)
      : updatedDay;
    
    
    const updatedDias = [...dieta.dias];
    updatedDias[dayIndex] = diaConNutricion;
    
    const dietaActualizada = {
      ...dieta,
      dias: updatedDias,
      // Forzar re-render con timestamp único
      _lastUpdated: Date.now(),
      _forceUpdate: `dieta-${Date.now()}-${Math.random()}`
    };
    
    
    setDieta(dietaActualizada);
    // ✅ NO MARCAR CAMBIOS PENDIENTES - SE ACTUALIZA AUTOMÁTICAMENTE
  };
  
  const handleTabChange = (newTabValue: string | null) => {
    if (newTabValue === activeTab) return;
    
    // ✅ CAMBIO DE TAB DIRECTO - NO HAY CAMBIOS PENDIENTES
    setActiveTab(newTabValue);
  };

  const handleWeekChange = (newWeek: number) => {
    // ✅ CAMBIO DE SEMANA DIRECTO - NO HAY CAMBIOS PENDIENTES
    setCurrentWeek(newWeek);
    
    if (dieta && daysRange.days.length > 0) {
      const firstVisibleDay = daysRange.days[0]?.dietDayIndex;
      if (firstVisibleDay !== undefined) {
        setActiveTab(firstVisibleDay.toString());
      }
    }
  };

  const currentDayInfo = useMemo(() => {
    if (!activeTab || !daysRange.days.length) return null;
    
    const currentDayIndex = parseInt(activeTab);
    return daysRange.days.find(day => day.dietDayIndex === currentDayIndex) || null;
  }, [activeTab, daysRange.days]);

  const fechaInicioFormateada = useMemo(() => {
    if (!dieta?.fechaInicio) return "";
    return formatearFecha(dieta.fechaInicio, "d 'de' MMMM 'de' yyyy");
  }, [dieta?.fechaInicio]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader color="nutroos-green" size="lg" />
        </Box>
      </Container>
    );
  }

  if (!dieta) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          withCloseButton
        >
          No se encontró la dieta solicitada o no tienes permisos para verla.
        </Alert>
        <Button 
          mt="lg" 
          color="nutroos-green"
          onClick={() => navigate('/dietas')}
        >
          Volver a dietas
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Paper 
        p="lg" 
        mb="md" 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)',
          borderColor: 'var(--app-border-color)'
        }}
      >
        <Group justify="space-between" mb="xs" wrap="wrap">
          <Box>
            <Group gap="md" align="center">
              <Title order={2} c="nutroos-green.6">
                {dieta.nombre}
              </Title>
              {!dieta.draftMode && (
                <Badge color="green" variant="filled" size="sm">
                  Publicada
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              {dieta.descripcion || "Sin descripción"}
            </Text>
          </Box>
          <Group gap="md">
            {dieta.draftMode ? (
              <>
                <Button
                  color="green"
                  leftSection={<IconCheck size={18} />}
                  onClick={handlePublicarDieta}
                  loading={publishLoading}
                >
                  Publicar dieta
                </Button>
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={18} />}
                  onClick={handleDeleteClick}
                  disabled={deleting}
                >
                  Eliminar dieta
                </Button>
              </>
            ) : (
              <Button
                color="blue"
                leftSection={<IconCheck size={18} />}
                disabled
              >
                Dieta publicada
              </Button>
            )}
          </Group>
        </Group>
        
        <Group mt="lg" mb="md" gap="xs">
          <IconCalendarEvent size={18} color={isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'} />
          <Text size="sm" c="dimmed">
            {dieta.duracion} días | {dieta.comidasDiarias} comidas diarias | Inicio: {fechaInicioFormateada}
          </Text>
        </Group>
        
        <Divider my="sm" />
        
        {(error || successMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error && (
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Error" 
                color="red" 
                mb="md"
                withCloseButton
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            {successMessage && (
              <Alert 
                icon={<IconCheck size={16} />}
                title="¡Operación exitosa!" 
                color="nutroos-green" 
                mb="md"
                withCloseButton
                onClose={() => setSuccessMessage(null)}
              >
                {successMessage}
              </Alert>
            )}
          </motion.div>
        )}
        
      </Paper>

      
      <Paper 
        withBorder 
        radius="md"
        style={{ 
          backgroundColor: 'var(--app-paper-bg)',
          borderColor: 'var(--app-border-color)'
        }}
      >
        {daysRange.totalWeeks > 1 && (
          <Box p="md" style={{ borderBottom: '1px solid var(--app-border-color)' }}>
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Semana {currentWeek} de {daysRange.totalWeeks}
              </Text>
              <Group>
                <Select
                  value={currentWeek.toString()}
                  onChange={(value) => handleWeekChange(Number(value))}
                  data={Array.from({ length: daysRange.totalWeeks }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `Semana ${i + 1}`
                  }))}
                  size="sm"
                  style={{ width: 120 }}
                />
                <Pagination
                  value={currentWeek}
                  onChange={handleWeekChange}
                  total={daysRange.totalWeeks}
                  color="nutroos-green"
                  withEdges
                  size="sm"
                />
              </Group>
            </Group>
          </Box>
        )}
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          color="nutroos-green"
          variant="pills"
          p="md"
          radius="md"
          style={{ backgroundColor: isDark ? 'var(--app-paper-bg)' : 'var(--mantine-color-gray-0)' }}
        >
          <Tabs.List 
            style={{ 
              flexWrap: 'wrap',
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            {daysRange.days.map((dayInfo) => (
              <Tabs.Tab 
                key={dayInfo.dietDayIndex} 
                value={dayInfo.dietDayIndex.toString()}
              >
                {dayInfo.weekDayName} {dayInfo.fecha.getDate()}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          
          {activeTab !== null && (
            <Tabs.Panel value={activeTab} pt="lg">
              <DietaDayEditor 
                day={dieta.dias[parseInt(activeTab)]}
                dayNumber={parseInt(activeTab) + 1}
                onUpdate={(updatedDay) => {
                  handleUpdateDay(parseInt(activeTab), updatedDay);
                }}
                comidasDiarias={dieta.comidasDiarias}
                customTitle={currentDayInfo?.nombreCompleto || `Día ${parseInt(activeTab) + 1}`}
                dietaId={dietaId}
                hasChanges={false}
                onRecalcularCalorias={() => recalcularCaloriasDia(parseInt(activeTab))}
                onRecargarDieta={recargarDieta}
                onSaveSuccess={() => {
                  // ✅ NO HAY CAMBIOS PENDIENTES - SE ACTUALIZA AUTOMÁTICAMENTE
                  setSuccessMessage("Día actualizado correctamente");
                  setTimeout(() => setSuccessMessage(null), 3000);
                }}
              />
            </Tabs.Panel>
          )}
        </Tabs>
        
        {daysRange.totalWeeks > 1 && (
          <Box p="md" style={{ borderTop: '1px solid var(--app-border-color)' }}>
            <Group justify="center">
              <Pagination
                value={currentWeek}
                onChange={handleWeekChange}
                total={daysRange.totalWeeks}
                color="nutroos-green"
                withEdges
              />
            </Group>
          </Box>
        )}
      </Paper>
      
      {/* ✅ MODAL DE CAMBIOS SIN GUARDAR ELIMINADO - SE ACTUALIZA AUTOMÁTICAMENTE */}

      {/* Modal de confirmación para eliminar */}
      <Modal
        opened={showDeleteModal}
        onClose={handleCancelDelete}
        title="Confirmar eliminación"
        centered
        size="md"
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            ¿Estás seguro de que deseas eliminar la dieta{' '}
            <Text span fw={700}>
              "{dieta?.nombre}"
            </Text>
            ?
          </Alert>
          
          <Text size="sm" c="dimmed">
            Esta acción no se puede deshacer. La dieta será eliminada permanentemente.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleCancelDelete}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleConfirmDelete}
              loading={deleting}
            >
              Eliminar dieta
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default EditarDietaPage;