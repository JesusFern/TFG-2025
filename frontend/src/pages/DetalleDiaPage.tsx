import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Alert, 
  useMantineColorScheme,
  Box,
  Loader,
  Button,
  Stack,
  Text,
  Paper,
  Group,
  Divider,
  Badge
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  IconAlertCircle, 
  IconArrowLeft,
  IconFlame,
  IconMeat,
  IconBread,
  IconDroplet,
  IconClock,
  IconStar
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { obtenerDieta } from '../services/dietService';
import { Dieta, DayInfo } from '../types';
import {
  parseFecha, 
  crearDatoDia
} from '../helpers/diets/DietaHelper';
import IngredientesList from '../components/organisms/IngredientesList';
import { useAuth } from '../hooks/useAuth';
import { obtenerSeguimientoPlatos } from '../services/seguimientoComidaService';
import type { SeguimientoPlato } from '../types/seguimientoComida';
import SeguimientoPlatoModal from '../components/molecules/SeguimientoComidaModal';
import SeguimientoPlatoDisplay from '../components/molecules/SeguimientoComidaDisplay';
import ResumenSeguimientoDia from '../components/molecules/ResumenSeguimientoDia';

const DetalleDiaPage: React.FC = () => {
  const { dietaId, diaIndex } = useParams<{ dietaId: string; diaIndex: string }>();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const { user } = useAuth();
  const isDark = colorScheme === 'dark';
  
  const [dieta, setDieta] = useState<Dieta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dayInfo, setDayInfo] = useState<DayInfo | null>(null);
  const [seguimientos, setSeguimientos] = useState<{ [key: string]: SeguimientoPlato }>({});
  const [modalAbierto, setModalAbierto] = useState<{ [key: string]: boolean }>({});
  const [cargandoSeguimientos, setCargandoSeguimientos] = useState<boolean>(false);

  // Función para navegar a los detalles de una receta
  const handleVerReceta = (recetaId: string) => {
    navigate(`/recetas/${recetaId}`, {
      state: {
        fromDieta: true,
        dietaId: dietaId
      }
    });
  };

  // Función para volver a la vista de dieta
  const handleVolver = () => {
    navigate(`/ver-dieta/${dietaId}`);
  };

  // Verificar si el usuario puede ver/editar seguimiento
  const puedeGestionarSeguimiento = useCallback((): boolean => {
    if (!user || !dieta) {
      return false;
    }
    
    // Usuario asignado a la dieta
    const esUsuarioAsignado = dieta.asignadaA?.some(userAsignado => {
      const userIdAsignado = typeof userAsignado === 'string' ? userAsignado : (userAsignado as { _id: string })._id;
      return userIdAsignado === user._id;
    });
    
    // Nutricionista creador de la dieta
    const esNutricionistaCreador = user.role === 'worker' && 
      (user.workerType === 'Nutricionista' || user.workerType === 'Nutricionista y Entrenador personal') &&
      dieta.creador && (typeof dieta.creador === 'string' ? dieta.creador : (dieta.creador as { _id: string })._id) === user._id;
    
    return esUsuarioAsignado || !!esNutricionistaCreador;
  }, [user, dieta]);

  // Verificar si el usuario puede editar (solo usuarios asignados)
  const puedeEditarSeguimiento = useCallback((): boolean => {
    if (!user || !dieta) return false;
    return dieta.asignadaA?.some(userAsignado => {
      const userIdAsignado = typeof userAsignado === 'string' ? userAsignado : (userAsignado as { _id: string })._id;
      return userIdAsignado === user._id;
    }) || false;
  }, [user, dieta]);

  // Cargar seguimientos del día
  const cargarSeguimientos = useCallback(async () => {
    if (!dietaId || !diaIndex || !puedeGestionarSeguimiento()) return;
    
    try {
      setCargandoSeguimientos(true);
      const dayNumber = parseInt(diaIndex) - 1; // Convertir a índice 0-based
      const response = await obtenerSeguimientoPlatos(dietaId, {
        diaIndex: dayNumber,
        limit: 50,
        offset: 0
      });
      
      // Mapear seguimientos por clave "comidaIndex-platoIndex"
      const seguimientosMap: { [key: string]: SeguimientoPlato } = {};
      
      // Ahora el backend devuelve la información completa con diaIndex, comidaIndex, platoIndex
      response.seguimientos.forEach((seguimiento) => {
        const key = `${seguimiento.comidaIndex}-${seguimiento.platoIndex}`;
        seguimientosMap[key] = {
          satisfaccion: seguimiento.satisfaccion,
          cumplimiento: seguimiento.cumplimiento,
          notaUsuario: seguimiento.notaUsuario
        };
      });
      
      setSeguimientos(seguimientosMap);
    } catch (error) {
      console.error('Error al cargar seguimientos:', error);
    } finally {
      setCargandoSeguimientos(false);
    }
  }, [dietaId, diaIndex, puedeGestionarSeguimiento]);

  // Abrir modal de seguimiento
  const abrirModalSeguimiento = (comidaIndex: number, platoIndex: number) => {
    const key = `${comidaIndex}-${platoIndex}`;
    setModalAbierto(prev => ({ ...prev, [key]: true }));
  };

  // Cerrar modal de seguimiento
  const cerrarModalSeguimiento = (comidaIndex: number, platoIndex: number) => {
    const key = `${comidaIndex}-${platoIndex}`;
    setModalAbierto(prev => ({ ...prev, [key]: false }));
  };

  // Actualizar seguimiento después de guardar
  const handleSeguimientoActualizado = (comidaIndex: number, platoIndex: number, seguimiento: SeguimientoPlato) => {
    const key = `${comidaIndex}-${platoIndex}`;
    setSeguimientos(prev => ({ ...prev, [key]: seguimiento }));
    cerrarModalSeguimiento(comidaIndex, platoIndex);
  };

  useEffect(() => {
    const cargarDietaYProcesarDia = async () => {
      if (!dietaId || !diaIndex) {
        setError('ID de dieta o día no proporcionado');
        setLoading(false);
        return;
      }
      
      // Validar formato de ObjectId de MongoDB
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(dietaId)) {
        setError('El ID de dieta proporcionado no es válido');
        setLoading(false);
        return;
      }

      const dayNumber = parseInt(diaIndex);
      if (isNaN(dayNumber) || dayNumber < 1) {
        setError('Número de día inválido');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const data = await obtenerDieta(dietaId);
        
        if (data.draftMode) {
          console.log('Dieta en modo borrador. Redirigiendo a edición...');
          navigate(`/editar-dieta/${dietaId}`);
          return;
        }

        // Verificar que el día existe
        if (dayNumber > data.dias.length) {
          setError(`El día ${dayNumber} no existe en esta dieta`);
          setLoading(false);
          return;
        }
        
        if (data.fechaInicio) {
          const fechaInicioDate = parseFecha(data.fechaInicio);
          
          // Crear información del día específico
          const dayData = crearDatoDia(dayNumber - 1, dayNumber - 1, fechaInicioDate, data.dias);
          setDayInfo(dayData);
        }
        
        setDieta(data);
      } catch (err) {
        console.error("Error al cargar la dieta:", err);
        setError("Error al cargar la dieta. Por favor intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDietaYProcesarDia();
  }, [dietaId, diaIndex, navigate]);

  // Cargar seguimientos cuando la dieta esté disponible
  useEffect(() => {
    if (dieta && puedeGestionarSeguimiento()) {
      cargarSeguimientos();
    }
  }, [dieta, user, cargarSeguimientos, puedeGestionarSeguimiento]);

  // Formatear fecha de inicio de dieta (comentado porque no se usa actualmente)
  // const fechaInicioFormateada = useMemo(() => {
  //   if (!dieta?.fechaInicio) return "";
  //   return formatearFecha(dieta.fechaInicio, "d 'de' MMMM 'de' yyyy");
  // }, [dieta?.fechaInicio]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader color="nutroos-green" size="lg" />
        </Box>
      </Container>
    );
  }

  if (!dieta || !dayInfo) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          withCloseButton
        >
          No se encontró la dieta o el día solicitado.
        </Alert>
        <Button 
          mt="lg" 
          color="nutroos-green"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            icon={<IconAlertCircle size={18} />} 
            title="Error" 
            color="red" 
            mb="md"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Alerta para dietas públicas (plan gratuito) */}
      {dieta.publica && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Dieta creada automáticamente con el plan gratuito"
          color="blue"
          variant="light"
          mb="md"
        >
          Esta dieta no permite seguimiento. Para acceder a funciones de seguimiento personalizado, actualiza tu plan de suscripción.
        </Alert>
      )}

      {/* Header del día */}
      <Paper p="lg" mb="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="subtle"
              color="gray"
              onClick={handleVolver}
            >
              Volver a la dieta
            </Button>
            
            <Badge size="lg" color="nutroos-green" variant="light">
              Día {parseInt(diaIndex || '1')} de {dieta.dias.length}
            </Badge>
          </Group>

          <Stack gap="xs" align="center">
            <Text fw={700} size="xl" c={isDark ? "gray.1" : "gray.8"}>
              {dayInfo.weekDayName}
            </Text>
            <Text size="lg" c="dimmed">
              {dayInfo.fechaFormateada}
            </Text>
            <Text size="sm" c="dimmed">
              {dieta.nombre}
            </Text>
          </Stack>
        </Stack>
      </Paper>

      {/* Información nutricional del día - Compacta */}
      {(dayInfo.data.caloriasTotales || dayInfo.data.proteinas || dayInfo.data.hidratosCarbono || dayInfo.data.grasas) && (
        <Paper p="md" mb="sm" withBorder>
          <Group gap="lg" wrap="wrap" justify="center">
            {dayInfo.data.caloriasTotales && (
              <Group gap="xs" align="center">
                <IconFlame size={20} color={isDark ? "#ff6b6b" : "#e03131"} />
                <Text fw={700} size="lg">
                  {dayInfo.data.caloriasTotales} kcal
                </Text>
              </Group>
            )}
            
            {dayInfo.data.proteinas && (
              <Group gap="xs" align="center">
                <IconMeat size={20} color={isDark ? "#51cf66" : "#2f9e44"} />
                <Text fw={600} size="md">
                  {dayInfo.data.proteinas}g proteínas
                </Text>
              </Group>
            )}
            
            {dayInfo.data.hidratosCarbono && (
              <Group gap="xs" align="center">
                <IconBread size={20} color={isDark ? "#ffd43b" : "#fab005"} />
                <Text fw={600} size="md">
                  {dayInfo.data.hidratosCarbono}g hidratos
                </Text>
              </Group>
            )}
            
            {dayInfo.data.grasas && (
              <Group gap="xs" align="center">
                <IconDroplet size={20} color={isDark ? "#74c0fc" : "#1971c2"} />
                <Text fw={600} size="md">
                  {dayInfo.data.grasas}g grasas
                </Text>
              </Group>
            )}
          </Group>
        </Paper>
      )}

      {/* Resumen de seguimiento del día - Solo si no es dieta pública */}
      {puedeGestionarSeguimiento() && !dieta.publica && Object.keys(seguimientos).length > 0 && (
        <ResumenSeguimientoDia
          seguimientos={seguimientos}
          totalPlatos={dayInfo.data.comidas.reduce((total, comida) => total + comida.platos.length, 0)}
        />
      )}

      {/* Comidas del día */}
      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Group align="center" gap="sm">
            <IconClock size={20} color={isDark ? "#51cf66" : "#2f9e44"} />
            <Text fw={600} size="md" c={isDark ? "gray.1" : "gray.8"}>
              Comidas del día
            </Text>
          </Group>
          
          <Stack gap="sm">
              {dayInfo.data.comidas.map((comida, index) => {
                if (!comida.platos || comida.platos.length === 0) return null;
                
                const mealNames = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena'];
                const mealTimes = ['08:00', '11:00', '14:00', '17:00', '20:00'];
                
                return (
                  <Paper key={index} p="sm" withBorder>
                    <Stack gap="xs">
                      <Group justify="space-between" align="center">
                        <Text fw={600} size="sm" c={isDark ? "gray.1" : "gray.8"}>
                          {comida.nombreComida || mealNames[index] || `Comida ${index + 1}`}
                        </Text>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            {comida.horaEstimada || mealTimes[index]}
                          </Text>
                          <Badge size="xs" color="blue" variant="light">
                            {comida.platos.length} plato{comida.platos.length !== 1 ? 's' : ''}
                          </Badge>
                        </Group>
                      </Group>
                      
                      <Divider size="xs" />
                      
                      <Stack gap="xs">
                        {/* Lista de platos con seguimiento */}
                        {comida.platos.map((plato, platoIndex) => {
                          const key = `${index}-${platoIndex}`;
                          const seguimientoPlato = seguimientos[key];
                          
                          return (
                            <Paper key={platoIndex} p="sm" withBorder>
                              <Stack gap="xs">
                                <Group justify="space-between" align="center">
                                  <Text fw={600} size="sm" c={isDark ? "gray.1" : "gray.8"}>
                                    {plato.nombre || `Plato ${platoIndex + 1}`}
                                  </Text>
                                  
                                  <Group gap="xs">
                                    {/* Botón para ver receta si existe */}
                                    {plato.receta && (
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        color="blue"
                                        onClick={() => {
                                          if (!plato.receta) return;
                                          
                                          let recetaId: string;
                                          if (typeof plato.receta === 'string') {
                                            recetaId = plato.receta;
                                          } else if (typeof plato.receta === 'object' && plato.receta !== null) {
                                            // Si es un objeto poblado, extraer el _id
                                            recetaId = (plato.receta as { _id: string })._id;
                                          } else {
                                            recetaId = String(plato.receta);
                                          }
                                          
                                          if (recetaId) {
                                            handleVerReceta(recetaId);
                                          }
                                        }}
                                      >
                                        Ver receta
                                      </Button>
                                    )}
                                    
                                    {/* Botón de seguimiento para el plato - Solo si no es dieta pública */}
                                    {puedeGestionarSeguimiento() && puedeEditarSeguimiento() && !dieta.publica && (
                                      <Button
                                        size="xs"
                                        variant="light"
                                        color="nutroos-green"
                                        leftSection={<IconStar size={14} />}
                                        onClick={() => abrirModalSeguimiento(index, platoIndex)}
                                        loading={cargandoSeguimientos}
                                      >
                                        {seguimientoPlato ? 'Ver seguimiento' : 'Registrar seguimiento'}
                                      </Button>
                                    )}
                                  </Group>
                                </Group>
                                
                                {/* Mostrar seguimiento existente para nutricionistas creadores - Solo si no es dieta pública */}
                                {puedeGestionarSeguimiento() && !puedeEditarSeguimiento() && !dieta.publica && (
                                  <>
                                    {seguimientoPlato ? (
                                      <SeguimientoPlatoDisplay
                                        seguimiento={seguimientoPlato}
                                        nombrePlato={plato.nombre || `Plato ${platoIndex + 1}`}
                                        soloLectura={true}
                                      />
                                    ) : (
                                      <Paper p="sm" withBorder bg={isDark ? "dark.6" : "gray.0"} style={{ opacity: 0.6 }}>
                                        <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>
                                          Sin seguimiento registrado
                                        </Text>
                                      </Paper>
                                    )}
                                  </>
                                )}
                                
                                {/* Mostrar seguimiento existente para usuarios asignados - Solo si no es dieta pública */}
                                {puedeGestionarSeguimiento() && puedeEditarSeguimiento() && !dieta.publica && seguimientoPlato && (
                                  <SeguimientoPlatoDisplay
                                    seguimiento={seguimientoPlato}
                                    nombrePlato={plato.nombre || `Plato ${platoIndex + 1}`}
                                    soloLectura={false}
                                  />
                                )}
                              </Stack>
                            </Paper>
                          );
                        })}
                        
                        {/* Lista de ingredientes del plato */}
                        {comida.platos.some(plato => 
                          (plato.ingredientesPersonalizados && plato.ingredientesPersonalizados.length > 0)
                        ) && (
                          <Stack gap="xs">
                            <Text fw={600} size="xs" c={isDark ? "gray.3" : "gray.6"}>
                              Ingredientes del plato:
                            </Text>
                            {comida.platos.map((plato, platoIndex) => {
                              const ingredientesDelPlato: Array<{
                                _id: string;
                                nombre: string;
                                peso: number;
                                calorias: number;
                                proteinas: number;
                                grasas: number;
                                hidratosCarbono: number;
                              }> = [];
                              const ingredientesMap = new Map<string, {
                                _id: string;
                                nombre: string;
                                peso: number;
                                calorias: number;
                                proteinas: number;
                                grasas: number;
                                hidratosCarbono: number;
                              }>();
                              
                              // Los ingredientes de receta se manejan a través de ingredientesPersonalizados
                              
                              // Agregar ingredientes personalizados si existen (solo si no están ya en la receta)
                              if (plato.ingredientesPersonalizados && plato.ingredientesPersonalizados.length > 0) {
                                plato.ingredientesPersonalizados.forEach((ing: { ingrediente: string | { _id: string; nombre: string; calorias: number; proteinas: number; grasas: number; hidratosCarbono: number; }; peso: number; }) => {
                                  const ingrediente = typeof ing.ingrediente === 'string' 
                                    ? { _id: ing.ingrediente, nombre: `Ingrediente ${ing.ingrediente}`, calorias: 0, proteinas: 0, grasas: 0, hidratosCarbono: 0 }
                                    : ing.ingrediente;
                                  
                                  // Solo agregar si no existe ya en la receta
                                  if (!ingredientesMap.has(ingrediente._id)) {
                                    ingredientesMap.set(ingrediente._id, {
                                      _id: ingrediente._id,
                                      nombre: ingrediente.nombre,
                                      peso: ing.peso,
                                      calorias: ingrediente.calorias,
                                      proteinas: ingrediente.proteinas,
                                      grasas: ingrediente.grasas,
                                      hidratosCarbono: ingrediente.hidratosCarbono
                                    });
                                  }
                                });
                              }
                              
                              // Convertir Map a Array
                              ingredientesDelPlato.push(...ingredientesMap.values());
                              
                              if (ingredientesDelPlato.length === 0) {
                                return null;
                              }
                              
                              return (
                                <Stack key={platoIndex} gap="xs">
                                  <Text fw={500} size="xs" c={isDark ? "gray.2" : "gray.7"}>
                                    {plato.nombre}:
                                  </Text>
                                  <IngredientesList 
                                    ingredientes={ingredientesDelPlato}
                                    isDark={isDark}
                                    isMobile={false}
                                  />
                                </Stack>
                              );
                            })}
                          </Stack>
                        )}
                        
                        
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
        </Stack>
      </Paper>

      {/* Modales de seguimiento por plato - Solo si no es dieta pública */}
      {puedeGestionarSeguimiento() && !dieta.publica && dayInfo && dayInfo.data.comidas.map((comida, comidaIndex) => 
        comida.platos.map((plato, platoIndex) => {
          const key = `${comidaIndex}-${platoIndex}`;
          return (
            <SeguimientoPlatoModal
              key={`modal-${key}`}
              opened={modalAbierto[key] || false}
              onClose={() => cerrarModalSeguimiento(comidaIndex, platoIndex)}
              dietaId={dietaId!}
              diaIndex={parseInt(diaIndex!) - 1} // Convertir a índice 0-based
              comidaIndex={comidaIndex}
              platoIndex={platoIndex}
              nombrePlato={plato.nombre || `Plato ${platoIndex + 1}`}
              seguimientoActual={seguimientos[key]}
              onSeguimientoActualizado={(seguimiento) => handleSeguimientoActualizado(comidaIndex, platoIndex, seguimiento)}
              soloLectura={!puedeEditarSeguimiento()}
            />
          );
        })
      )}
    </Container>
  );
};

export default DetalleDiaPage;
