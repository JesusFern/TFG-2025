import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Loader, 
  Alert, 
  Card, 
  Group, 
  Badge, 
  Stack, 
  Text, 
  useMantineTheme,
  Paper,
  Button,
  Center,
  SimpleGrid
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconClock, 
  IconBarbell,
  IconAlertCircle,
  IconRepeat,
  IconPlayerPlay,
  IconTrophy
} from '@tabler/icons-react';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { formatDate } from '../utils/trainingUtils';
import { SesionPlan, Ejercicio, RegistroEjercicio, SesionCompleta } from '../types/training';
import { trainingService } from '../services/trainingService';
import ModalDetallesEjercicio from '../components/molecules/ModalDetallesEjercicio';
import ModalRegistroEjercicio from '../components/molecules/ModalRegistroEjercicio';
import ModalDetallesRegistro from '../components/molecules/ModalDetallesRegistro';
import ModalEditarRegistro from '../components/molecules/ModalEditarRegistro';
import ModalSesionCompleta from '../components/molecules/ModalSesionCompleta';
import EjercicioRegistroCard from '../components/molecules/EjercicioRegistroCard';

const ClientTrainingSessionPage: React.FC = () => {
  const { planId, sesionId } = useParams();
  const navigate = useNavigate();
  const isDark = useThemeDetection();
  const theme = useMantineTheme();
  
  const [sesion, setSesion] = useState<SesionPlan | null>(null);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [registros, setRegistros] = useState<RegistroEjercicio[]>([]);
  const [sesionCompleta, setSesionCompleta] = useState<SesionCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEjercicio, setSelectedEjercicio] = useState<Ejercicio | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  
  // Estados para modales de registro
  const [modalRegistroOpened, setModalRegistroOpened] = useState(false);
  const [modalDetallesOpened, setModalDetallesOpened] = useState(false);
  const [modalEditarOpened, setModalEditarOpened] = useState(false);
  const [modalSesionCompletaOpened, setModalSesionCompletaOpened] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroEjercicio | null>(null);

  // Función para determinar si la sesión es futura
  const esSesionFutura = (fechaSesion: string): boolean => {
    const hoy = new Date();
    const fechaSesionDate = new Date(fechaSesion);
    
    // Resetear las horas para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaSesionDate.setHours(0, 0, 0, 0);
    
    return fechaSesionDate > hoy;
  };

  const [ejercicioParaRegistrar, setEjercicioParaRegistrar] = useState<{
    ejercicio: Ejercicio;
    ejercicioSesion: {
      series: number;
      repeticiones: number;
      peso?: number;
      tiempoDescanso: number;
      nivelIntensidad: string;
    };
  } | null>(null);

  useEffect(() => {
    const cargarSesion = async () => {
      if (!sesionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos de la sesión
        const sesionData = await trainingService.obtenerSesionPorId(sesionId);
        setSesion(sesionData);
        
        // Cargar ejercicios de la sesión
        if (sesionData.ejercicios && Array.isArray(sesionData.ejercicios) && sesionData.ejercicios.length > 0) {
          // Los ejercicios ya están poblados desde el backend, extraer solo la información del ejercicio
          const ejerciciosData = sesionData.ejercicios.map(e => e.ejercicio as unknown as Ejercicio);
          setEjercicios(ejerciciosData);
        } else {
          console.warn('La sesión no tiene ejercicios o la estructura es incorrecta:', {
            hasEjercicios: !!sesionData.ejercicios,
            isArray: Array.isArray(sesionData.ejercicios),
            length: sesionData.ejercicios?.length,
            ejercicios: sesionData.ejercicios
          });
          setEjercicios([]);
        }

        // Cargar registros de ejercicios
        try {
          const registrosData = await trainingService.obtenerRegistrosEjercicio({ sesion: sesionId });
          setRegistros(registrosData);
        } catch (err) {
          console.warn('Error al cargar registros:', err);
          setRegistros([]);
        }

        // Verificar estado de la sesión
        try {
          const sesionCompletaData = await trainingService.verificarSesionCompleta(sesionId);
          setSesionCompleta(sesionCompletaData);
        } catch (err) {
          console.warn('Error al verificar sesión completa:', err);
        }
        
      } catch (err) {
        console.error('Error al cargar sesión:', err);
        setError('Error al cargar los datos de la sesión');
      } finally {
        setLoading(false);
      }
    };

    cargarSesion();
  }, [sesionId]);

  const handleVerEjercicio = (ejercicio: Ejercicio) => {
    setSelectedEjercicio(ejercicio);
    setModalOpened(true);
  };

  const getEjercicioById = (ejercicioId: string): Ejercicio | null => {
    return ejercicios.find(e => e._id === ejercicioId) || null;
  };

  const getRegistroByEjercicio = (ejercicioId: string): RegistroEjercicio | undefined => {
    // El campo ejercicio puede ser un objeto o un string, necesitamos manejarlo
    const registro = registros.find(r => {
      const ejercicioIdEnRegistro = typeof r.ejercicio === 'string' 
        ? r.ejercicio 
        : (r.ejercicio as { _id: string })._id;
      return ejercicioIdEnRegistro === ejercicioId;
    });
    
    return registro;
  };

  const handleRegistrarEjercicio = (
    ejercicio: Ejercicio,
    ejercicioSesion: {
      series: number;
      repeticiones: number;
      peso?: number;
      tiempoDescanso: number;
      nivelIntensidad: string;
    }
  ) => {
    setEjercicioParaRegistrar({ ejercicio, ejercicioSesion });
    setModalRegistroOpened(true);
  };

  const handleNoCompletado = async (ejercicio: Ejercicio) => {
    try {
      const datosRegistro = {
        ejercicio: ejercicio._id!,
        sesion: sesionId!,
        repeticionesRealizadas: 0,
        seriesCompletadas: 0,
        cargaUtilizada: 0,
        nivelEsfuerzo: 1,
        videoCliente: '',
        notas: 'Ejercicio no completado',
        tiempoDescanso: 0,
        duracionEjercicio: 0,
        ordenEnSesion: 1,
        completado: false
      };

      await trainingService.crearRegistroEjercicio(datosRegistro);
      await handleRegistroExitoso();
    } catch (err) {
      console.error('Error al registrar ejercicio no completado:', err);
    }
  };

  const handleVerRegistro = (registro: RegistroEjercicio) => {
    setSelectedRegistro(registro);
    setModalDetallesOpened(true);
  };

  const handleEditarRegistro = (registro: RegistroEjercicio) => {
    setSelectedRegistro(registro);
    setModalEditarOpened(true);
  };

  const handleActualizacionExitosa = async () => {
    // Recargar registros y estado de sesión
    if (sesionId) {
      try {
        const registrosData = await trainingService.obtenerRegistrosEjercicio({ sesion: sesionId });
        setRegistros(registrosData);
        
        const sesionCompletaData = await trainingService.verificarSesionCompleta(sesionId);
        setSesionCompleta(sesionCompletaData);
      } catch (err) {
        console.error('Error al recargar datos:', err);
      }
    }
  };

  const handleRegistroExitoso = async () => {
    // Recargar registros y estado de sesión
    if (sesionId) {
      try {
        const registrosData = await trainingService.obtenerRegistrosEjercicio({ sesion: sesionId });
        setRegistros(registrosData);
        
        const sesionCompletaData = await trainingService.verificarSesionCompleta(sesionId);
        setSesionCompleta(sesionCompletaData);
      } catch (err) {
        console.error('Error al recargar datos:', err);
      }
    }
  };

  const handleMarcarSesionCompleta = () => {
    setModalSesionCompletaOpened(true);
  };

  const handleConfirmarSesionCompleta = async () => {
    if (!sesionId || !sesion) return;
    try {
      // Crear registros "no completados" para ejercicios sin registrar
      const ejerciciosSinRegistrar = sesion.ejercicios?.filter(ejercicioSesion => {
        const ejercicio = ejercicioSesion.ejercicio as unknown as Ejercicio;
        const registro = getRegistroByEjercicio(ejercicio?._id || '');
        return !registro;
      }) || [];

      // Crear registros para ejercicios sin registrar
      for (const ejercicioSesion of ejerciciosSinRegistrar) {
        const ejercicio = ejercicioSesion.ejercicio as unknown as Ejercicio;
        const datosRegistro = {
          ejercicio: ejercicio._id!,
          sesion: sesionId,
          repeticionesRealizadas: 0,
          seriesCompletadas: 0,
          cargaUtilizada: 0,
          nivelEsfuerzo: 1,
          videoCliente: '',
          notas: 'Ejercicio no completado - Sesión marcada como completa',
          tiempoDescanso: 0,
          duracionEjercicio: 0,
          ordenEnSesion: 1,
          completado: false
        };

        await trainingService.crearRegistroEjercicio(datosRegistro);
      }

      // Marcar sesión como completada
      await trainingService.marcarSesionCompletada(sesionId);
      setModalSesionCompletaOpened(false);

      // Refrescar datos de sesión y estado
      const sesionData = await trainingService.obtenerSesionPorId(sesionId);
      setSesion(sesionData);
      const sesionCompletaData = await trainingService.verificarSesionCompleta(sesionId);
      setSesionCompleta(sesionCompletaData);
      
      // Recargar registros
      const registrosData = await trainingService.obtenerRegistrosEjercicio({ sesion: sesionId });
      setRegistros(registrosData);
    } catch (err) {
      console.error('Error al marcar sesión como completa', err);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };


  if (loading) {
    return (
      <Container py="xl">
        <Center>
          <Loader color="nutroos-green" size="lg" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!sesion) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          No se encontró la sesión solicitada.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      {/* Header con navegación */}
      <Paper 
        p="lg" 
        shadow="xs" 
        radius="md" 
        mb="xl" 
        withBorder
        bg={isDark ? "dark.6" : "gray.0"}
        c={isDark ? "gray.0" : "dark.9"}
        style={{ 
          borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
          background: `linear-gradient(135deg, ${isDark ? theme.colors.dark[6] : theme.colors.gray[0]} 0%, ${isDark ? theme.colors.dark[7] : theme.colors.gray[1]} 100%)`
        }}
      >
        <Group justify="space-between" align="flex-start" mb="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(`/mis-entrenamientos/${planId}`)}
            color="gray"
            size="sm"
          >
            Volver al plan
          </Button>
          
          <Badge
            size="lg"
            color="nutroos-green"
            variant="light"
            leftSection={<IconPlayerPlay size={16} />}
            fw={600}
          >
            Sesión de Entrenamiento
          </Badge>
        </Group>

        <Title order={2} mb="xs" c="nutroos-green.6">
          {sesion.tipoEntrenamiento}
        </Title>
        
        <Text c="dimmed" size="lg" mb="md">
          {formatDate(sesion.fecha)} {sesion.hora && `• ${sesion.hora}`}
        </Text>

        {/* Información de la sesión */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconClock size={20} color={theme.colors.cyan[6]} />
              <Text fw={600} size="sm">Duración</Text>
            </Group>
            <Text size="sm" c="dimmed">{formatTime(sesion.duracion)}</Text>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconBarbell size={20} color={theme.colors.teal[6]} />
              <Text fw={600} size="sm">Ejercicios</Text>
            </Group>
            <Text size="sm" c="dimmed">{sesion.ejercicios?.length || 0}</Text>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconRepeat size={20} color={theme.colors.blue[6]} />
              <Text fw={600} size="sm">Series Totales</Text>
            </Group>
            <Text size="sm" c="dimmed">
              {sesion.ejercicios?.reduce((total, e) => total + e.series, 0) || 0}
            </Text>
          </Card>

          <Card
            p="md"
            radius="md"
            bg={isDark ? "dark.7" : "white"}
            withBorder
            style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
          >
            <Group gap="xs" mb="xs">
              <IconClock size={20} color={theme.colors.grape[6]} />
              <Text fw={600} size="sm">Descanso Promedio</Text>
            </Group>
            <Text size="sm" c="dimmed">
              {sesion.ejercicios?.length ? Math.round(sesion.ejercicios.reduce((total, e) => total + e.tiempoDescanso, 0) / sesion.ejercicios.length) : 0}s
            </Text>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Panel de estado y acción para completar sesión (movido arriba) */}
      {sesionCompleta && (
        <Paper 
          p="lg" 
          shadow="xs" 
          radius="md" 
          mb="xl" 
          withBorder
          bg={isDark ? "dark.7" : "white"}
          style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
        >
          <Group justify="space-between" align="center">
            <div>
              <Group align="center" mb="xs">
                <Title order={3} c="nutroos-green.6">
                  Estado de la Sesión
                </Title>
                {sesion?.completada && (
                  <Badge color="green" variant="filled" leftSection={<IconTrophy size={12} />}>
                    Completada
                  </Badge>
                )}
              </Group>
              <Text c="dimmed">
                {sesionCompleta.ejerciciosCompletados} de {sesionCompleta.totalEjercicios} ejercicios completados • {sesionCompleta.porcentajeCompletado?.toFixed?.(0) ?? 0}%
              </Text>
            </div>
            {!sesion?.completada && sesion?.fecha && !esSesionFutura(sesion.fecha) && (
              <Button
                color="nutroos-green"
                leftSection={<IconTrophy size={16} />}
                onClick={handleMarcarSesionCompleta}
              >
                Marcar Sesión como Completa
              </Button>
            )}
          </Group>
        </Paper>
      )}

      {/* Aviso informativo */}
      {sesion && esSesionFutura(sesion.fecha) ? (
        <Alert
          color="orange"
          variant="light"
          title="Sesión Futura"
          mb="lg"
          icon={<IconClock size={16} />}
        >
          Esta sesión está programada para el futuro. No puedes registrar ejercicios hasta el día acordado para realizar la sesión.
        </Alert>
      ) : (
        <Alert
          color="blue"
          variant="light"
          title="Importante"
          mb="lg"
          icon={<IconAlertCircle size={16} />}
        >
          Recuerda registrar tus ejercicios para llevar un seguimiento adecuado de tus entrenos. Esto ayuda a tu entrenador a ver tu progreso.
        </Alert>
      )}

      {/* Lista de ejercicios */}
      <Paper 
        p="lg" 
        shadow="xs" 
        radius="md" 
        mb="xl" 
        withBorder
        bg={isDark ? "dark.7" : "white"}
        style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
      >
        <Title order={3} mb="lg" c="nutroos-green.6">
          Ejercicios de la Sesión
        </Title>

        {(!sesion.ejercicios || sesion.ejercicios.length === 0) ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconBarbell 
                size={48} 
                color={isDark ? theme.colors.gray[5] : theme.colors.gray[4]}
                stroke={1}
              />
              <Text c="dimmed">No hay ejercicios programados para esta sesión</Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="md">
            {sesion.ejercicios?.map((ejercicioSesion, index) => {
              const ejercicio = ejercicioSesion.ejercicio as unknown as Ejercicio;
              const registro = getRegistroByEjercicio(ejercicio?._id || '');
              
              
              return (
                <EjercicioRegistroCard
                  key={index}
                  ejercicio={ejercicio}
                  ejercicioSesion={ejercicioSesion}
                  registro={registro}
                  onRegistrar={() => ejercicio && handleRegistrarEjercicio(ejercicio, ejercicioSesion)}
                  onNoCompletado={() => ejercicio && handleNoCompletado(ejercicio)}
                  onVerRegistro={() => registro && handleVerRegistro(registro)}
                  onEditarRegistro={() => registro && handleEditarRegistro(registro)}
                  onVerEjercicio={() => ejercicio && handleVerEjercicio(ejercicio)}
                  orden={index + 1}
                  sesionCompletada={sesionCompleta?.sesionCompleta || false}
                  sesionMarcadaCompleta={sesion?.completada || false}
                  sesionFutura={sesion ? esSesionFutura(sesion.fecha) : false}
                />
              );
            })}
          </Stack>
        )}
      </Paper>

      {/* Notas de la sesión */}
      {sesion.notas && (
        <Paper 
          p="lg" 
          shadow="xs" 
          radius="md" 
          withBorder
          bg={isDark ? "dark.7" : "white"}
          style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3] }}
        >
          <Title order={4} mb="md" c="nutroos-green.6">
            Notas de la Sesión
          </Title>
          <Text c="dimmed">{sesion.notas}</Text>
        </Paper>
      )}


      {/* Modales */}
      <ModalDetallesEjercicio
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        ejercicio={selectedEjercicio}
      />

      {ejercicioParaRegistrar && (
        <ModalRegistroEjercicio
          opened={modalRegistroOpened}
          onClose={() => {
            setModalRegistroOpened(false);
            setEjercicioParaRegistrar(null);
          }}
          ejercicio={ejercicioParaRegistrar.ejercicio}
          sesion={sesion!}
          ejercicioSesion={ejercicioParaRegistrar.ejercicioSesion}
          onSuccess={handleRegistroExitoso}
        />
      )}

      {selectedRegistro && (
        <ModalDetallesRegistro
          opened={modalDetallesOpened}
          onClose={() => {
            setModalDetallesOpened(false);
            setSelectedRegistro(null);
          }}
          registro={{
            id: selectedRegistro._id || '',
            ejercicio: {
              id: selectedRegistro.ejercicio,
              nombre: getEjercicioById(selectedRegistro.ejercicio)?.nombre || 'Ejercicio'
            },
            sesion: {
              id: selectedRegistro.sesion,
              nombre: 'Sesión',
              tipoEntrenamiento: sesion?.tipoEntrenamiento || 'Fuerza',
              fecha: sesion?.fecha || new Date().toISOString()
            },
            cargaUtilizada: selectedRegistro.cargaUtilizada || 0,
            repeticionesRealizadas: selectedRegistro.repeticionesRealizadas,
            seriesCompletadas: selectedRegistro.seriesCompletadas,
            tiempoDescanso: selectedRegistro.tiempoDescanso || 0,
            nivelEsfuerzo: selectedRegistro.nivelEsfuerzo,
            completado: selectedRegistro.completado,
            notas: selectedRegistro.notas || '',
            fecha: selectedRegistro.fecha
          }}
        />
      )}

      {selectedRegistro && (
        <ModalEditarRegistro
          opened={modalEditarOpened}
          onClose={() => {
            setModalEditarOpened(false);
            setSelectedRegistro(null);
          }}
          registro={selectedRegistro}
          ejercicio={typeof selectedRegistro.ejercicio === 'string' 
            ? getEjercicioById(selectedRegistro.ejercicio) || {} as Ejercicio
            : selectedRegistro.ejercicio as Ejercicio
          }
          onSuccess={handleActualizacionExitosa}
        />
      )}

      {sesionCompleta && (
        <ModalSesionCompleta
          opened={modalSesionCompletaOpened}
          onClose={() => setModalSesionCompletaOpened(false)}
          sesionCompleta={sesionCompleta}
          onConfirmar={handleConfirmarSesionCompleta}
        />
      )}
    </Container>
  );
};

export default ClientTrainingSessionPage;
