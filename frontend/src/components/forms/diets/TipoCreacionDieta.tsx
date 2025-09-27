import React, { useState, useEffect } from 'react';
import {
  Card,
  Group,
  Text,
  Button,
  Stack,
  Title,
  Paper,
  Loader,
  Alert,
  SimpleGrid,
  Badge,
  Box
} from '@mantine/core';
import {
  IconPlus,
  IconTemplate,
  IconCopy,
  IconAlertCircle,
  IconInfoCircle,
  IconCheck
} from '@tabler/icons-react';
import { dietTemplateService, TipoArquetipo } from '../../../services/dietTemplateService';
import { getMyCreatedDiets } from '../../../services/dietService';
import { DietaResponse } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';

export type TipoCreacion = 'desde-cero' | 'desde-plantilla' | 'desde-existente';

interface TipoCreacionDietaProps {
  onSeleccionarTipo: (tipo: TipoCreacion, datosExtra?: {
    tipoArquetipo?: string;
    plantillaInfo?: TipoArquetipo;
    dietaOrigenId?: string;
    dietaInfo?: DietaResponse;
  }) => void;
  clienteId: string;
}

const TipoCreacionDieta: React.FC<TipoCreacionDietaProps> = ({ onSeleccionarTipo, clienteId }) => {
  const { user } = useAuth();
  
  const [plantillas, setPlantillas] = useState<TipoArquetipo[]>([]);
  const [dietasExistentes, setDietasExistentes] = useState<DietaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoCreacion | null>(null);
  const [datosExtra, setDatosExtra] = useState<{
    tipoArquetipo?: string;
    plantillaInfo?: TipoArquetipo;
    dietaOrigenId?: string;
    dietaInfo?: DietaResponse;
  } | null>(null);
  
  // Verificar si el usuario es un nutricionista
  const esNutricionista = user && (
    user.role === 'admin' || 
    (user.role === 'worker' && (
      user.workerType === 'Nutricionista' || 
      user.workerType === 'Nutricionista y Entrenador personal'
    ))
  );

  // Debug: Log del usuario actual
  console.log('🔍 Debug TipoCreacionDieta - Usuario actual:', {
    id: user?._id,
    role: user?.role,
    workerType: user?.workerType,
    esNutricionista
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        if (!esNutricionista) {
          // Si no es nutricionista, solo permitir crear desde cero
          setLoading(false);
          return;
        }
        
        // Solo cargar datos si es nutricionista
        const promises = [];
        
        // Cargar plantillas
        promises.push(
          dietTemplateService.obtenerTiposArquetipo().catch(err => {
            console.warn('Error al cargar plantillas:', err);
            return { success: false, data: [] };
          })
        );
        
        // Cargar dietas existentes del nutricionista
        promises.push(
          getMyCreatedDiets().catch(err => {
            console.warn('Error al cargar dietas existentes:', err);
            return { dietas: [] };
          })
        );

        const [plantillasResponse, dietasResponse] = await Promise.all(promises);

        if ('success' in plantillasResponse && plantillasResponse.success && plantillasResponse.data) {
          setPlantillas(plantillasResponse.data);
        }

        if ('dietas' in dietasResponse && dietasResponse.dietas) {
          // Filtrar solo dietas que no estén en modo borrador y que no estén asignadas al cliente actual
          const dietasDisponibles = dietasResponse.dietas.filter((dieta: DietaResponse) => 
             
            (!dieta.asignadaA || !dieta.asignadaA.includes(clienteId))
          );
          setDietasExistentes(dietasDisponibles);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [clienteId, esNutricionista]);

  const handleSeleccionarTipo = (tipo: TipoCreacion) => {
    setTipoSeleccionado(tipo);
    
    if (tipo === 'desde-cero') {
      onSeleccionarTipo(tipo);
    }
  };

  const handleSeleccionarPlantilla = (plantilla: TipoArquetipo) => {
    const datos = { tipoArquetipo: plantilla.tipo, plantillaInfo: plantilla };
    setDatosExtra(datos);
    onSeleccionarTipo('desde-plantilla', datos);
  };

  const handleSeleccionarDietaExistente = (dieta: DietaResponse) => {
    const datos = { dietaOrigenId: dieta._id, dietaInfo: dieta };
    setDatosExtra(datos);
    onSeleccionarTipo('desde-existente', datos);
  };

  if (loading) {
    return (
      <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--app-paper-bg)' }}>
        <Group justify="center" mb="md">
          <Loader size="md" color="nutroos-green" />
        </Group>
        <Text ta="center" c="dimmed">Cargando opciones de creación...</Text>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        variant="filled"
        withCloseButton
        onClose={() => setError(null)}
      >
        {error}
      </Alert>
    );
  }

  // Si no es nutricionista, solo mostrar la opción de crear desde cero
  if (!esNutricionista) {
    return (
      <Paper 
        p="xl" 
        radius="lg" 
        withBorder 
        style={{ 
          backgroundColor: 'var(--app-paper-bg)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid var(--app-border-color)'
        }}
      >
        <Stack align="center" gap="lg" mb="xl">
          <Box
            style={{
              backgroundColor: 'var(--mantine-color-nutroos-green-1)',
              borderRadius: '50%',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
          >
            <IconPlus size={40} color="var(--mantine-color-nutroos-green-6)" />
          </Box>
          
          <Title order={2} ta="center" c="nutroos-green.7" fw={700}>
            Crear Nueva Dieta
          </Title>
          
          <Text ta="center" c="dimmed" size="lg" maw={500}>
            Como cliente, puedes crear una dieta personalizada desde cero con tus propias recetas y configuraciones
          </Text>
        </Stack>

        <SimpleGrid cols={1} spacing="xl">
          <Card
            shadow="lg"
            padding="xl"
            radius="lg"
            withBorder
            style={{
              cursor: 'pointer',
              backgroundColor: 'var(--mantine-color-nutroos-green-0)',
              borderColor: 'var(--mantine-color-nutroos-green-4)',
              borderWidth: '2px',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => handleSeleccionarTipo('desde-cero')}
          >
            <Stack align="center" gap="lg">
              <Box
                style={{
                  backgroundColor: 'var(--mantine-color-nutroos-green-6)',
                  borderRadius: '50%',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <IconPlus size={48} color="white" />
              </Box>
              
              <Title order={2} ta="center" c="nutroos-green.7" fw={600}>
                Crear desde cero
              </Title>
              
              <Text ta="center" size="md" c="dimmed" maw={400}>
                Crear una dieta completamente nueva con tus propias recetas, ingredientes y configuraciones personalizadas
              </Text>

              <Badge
                color="nutroos-green"
                variant="filled"
                size="xl"
                radius="xl"
                style={{ fontWeight: 600, fontSize: '16px' }}
              >
                ¡Comienza ahora!
              </Badge>
            </Stack>
          </Card>
        </SimpleGrid>
      </Paper>
    );
  }

  return (
    <Paper 
      p="xl" 
      radius="lg" 
      withBorder 
      style={{ 
        backgroundColor: 'var(--app-paper-bg)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--app-border-color)'
      }}
    >
      <Stack align="center" gap="lg" mb="xl">
        <Box
          style={{
            backgroundColor: 'var(--mantine-color-nutroos-green-1)',
            borderRadius: '50%',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}
        >
          <IconTemplate size={40} color="var(--mantine-color-nutroos-green-6)" />
        </Box>
        
        <Title order={2} ta="center" c="nutroos-green.7" fw={700}>
          ¿Cómo quieres crear la dieta?
        </Title>
        
        <Text ta="center" c="dimmed" size="lg" maw={600}>
          Selecciona una de las siguientes opciones para comenzar a crear la dieta personalizada
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
        {/* Crear desde cero */}
        <Card
          shadow={tipoSeleccionado === 'desde-cero' ? 'lg' : 'sm'}
          padding="xl"
          radius="lg"
          withBorder
          style={{
            cursor: 'pointer',
            backgroundColor: tipoSeleccionado === 'desde-cero' ? 'var(--mantine-color-nutroos-green-0)' : 'var(--app-paper-bg)',
            borderColor: tipoSeleccionado === 'desde-cero' ? 'var(--mantine-color-nutroos-green-4)' : 'var(--app-border-color)',
            borderWidth: tipoSeleccionado === 'desde-cero' ? '2px' : '1px',
            transition: 'all 0.3s ease',
            transform: tipoSeleccionado === 'desde-cero' ? 'translateY(-4px)' : 'translateY(0)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (tipoSeleccionado !== 'desde-cero') {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (tipoSeleccionado !== 'desde-cero') {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
            }
          }}
          onClick={() => handleSeleccionarTipo('desde-cero')}
        >
          {tipoSeleccionado === 'desde-cero' && (
            <Box
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--mantine-color-nutroos-green-4) 0%, var(--mantine-color-nutroos-green-6) 100%)',
                clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: '8px'
              }}
            >
              <IconCheck size={16} color="white" />
            </Box>
          )}
          
          <Stack align="center" gap="lg">
            <Box
              style={{
                backgroundColor: tipoSeleccionado === 'desde-cero' ? 'var(--mantine-color-nutroos-green-6)' : 'var(--mantine-color-nutroos-green-1)',
                borderRadius: '50%',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <IconPlus size={36} color={tipoSeleccionado === 'desde-cero' ? 'white' : 'var(--mantine-color-nutroos-green-6)'} />
            </Box>
            
            <Title order={3} ta="center" c={tipoSeleccionado === 'desde-cero' ? 'nutroos-green.7' : 'dark'} fw={600}>
              Desde cero
            </Title>
            
            <Text ta="center" size="sm" c="dimmed" maw={200}>
              Crear una dieta completamente nueva con tus propias recetas y configuraciones personalizadas
            </Text>

            <Badge
              color="nutroos-green"
              variant={tipoSeleccionado === 'desde-cero' ? 'filled' : 'light'}
              size="lg"
              radius="xl"
              style={{ fontWeight: 500 }}
            >
              Total control
            </Badge>

            {tipoSeleccionado === 'desde-cero' && (
              <Button
                color="nutroos-green"
                leftSection={<IconCheck size={16} />}
                size="md"
                fullWidth
                radius="xl"
                style={{ fontWeight: 600 }}
              >
                Seleccionado
              </Button>
            )}
          </Stack>
        </Card>

        {/* Crear desde plantilla */}
        <Card
          shadow={tipoSeleccionado === 'desde-plantilla' ? 'lg' : 'sm'}
          padding="xl"
          radius="lg"
          withBorder
          style={{
            cursor: 'pointer',
            backgroundColor: tipoSeleccionado === 'desde-plantilla' ? 'var(--mantine-color-blue-0)' : 'var(--app-paper-bg)',
            borderColor: tipoSeleccionado === 'desde-plantilla' ? 'var(--mantine-color-blue-4)' : 'var(--app-border-color)',
            borderWidth: tipoSeleccionado === 'desde-plantilla' ? '2px' : '1px',
            transition: 'all 0.3s ease',
            transform: tipoSeleccionado === 'desde-plantilla' ? 'translateY(-4px)' : 'translateY(0)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (tipoSeleccionado !== 'desde-plantilla') {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (tipoSeleccionado !== 'desde-plantilla') {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
            }
          }}
          onClick={() => handleSeleccionarTipo('desde-plantilla')}
        >
          {tipoSeleccionado === 'desde-plantilla' && (
            <Box
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--mantine-color-blue-4) 0%, var(--mantine-color-blue-6) 100%)',
                clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: '8px'
              }}
            >
              <IconCheck size={16} color="white" />
            </Box>
          )}
          
          <Stack align="center" gap="lg">
            <Box
              style={{
                backgroundColor: tipoSeleccionado === 'desde-plantilla' ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-blue-1)',
                borderRadius: '50%',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <IconTemplate size={36} color={tipoSeleccionado === 'desde-plantilla' ? 'white' : 'var(--mantine-color-blue-6)'} />
            </Box>
            
            <Title order={3} ta="center" c={tipoSeleccionado === 'desde-plantilla' ? 'blue.7' : 'dark'} fw={600}>
              Desde plantilla
            </Title>
            
            <Text ta="center" size="sm" c="dimmed" maw={200}>
              Usar una plantilla predefinida como base y personalizarla según las necesidades específicas
            </Text>

            <Badge
              color="blue"
              variant="light"
              size="lg"
              radius="xl"
              style={{ fontWeight: 500 }}
            >
              {plantillas.length} plantillas
            </Badge>

            {tipoSeleccionado === 'desde-plantilla' && (
              <Stack gap="sm" w="100%">
                {plantillas.map((plantilla) => (
                  <Button
                    key={plantilla.tipo}
                    variant="outline"
                    color="blue"
                    size="sm"
                    fullWidth
                    radius="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeleccionarPlantilla(plantilla);
                    }}
                    style={{ fontWeight: 500 }}
                  >
                    {plantilla.nombre}
                  </Button>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>

        {/* Crear desde dieta existente */}
        <Card
          shadow={tipoSeleccionado === 'desde-existente' ? 'lg' : 'sm'}
          padding="xl"
          radius="lg"
          withBorder
          style={{
            cursor: 'pointer',
            backgroundColor: tipoSeleccionado === 'desde-existente' ? 'var(--mantine-color-orange-0)' : 'var(--app-paper-bg)',
            borderColor: tipoSeleccionado === 'desde-existente' ? 'var(--mantine-color-orange-4)' : 'var(--app-border-color)',
            borderWidth: tipoSeleccionado === 'desde-existente' ? '2px' : '1px',
            transition: 'all 0.3s ease',
            transform: tipoSeleccionado === 'desde-existente' ? 'translateY(-4px)' : 'translateY(0)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (tipoSeleccionado !== 'desde-existente') {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (tipoSeleccionado !== 'desde-existente') {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
            }
          }}
          onClick={() => handleSeleccionarTipo('desde-existente')}
        >
          {tipoSeleccionado === 'desde-existente' && (
            <Box
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--mantine-color-orange-4) 0%, var(--mantine-color-orange-6) 100%)',
                clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: '8px'
              }}
            >
              <IconCheck size={16} color="white" />
            </Box>
          )}
          
          <Stack align="center" gap="lg">
            <Box
              style={{
                backgroundColor: tipoSeleccionado === 'desde-existente' ? 'var(--mantine-color-orange-6)' : 'var(--mantine-color-orange-1)',
                borderRadius: '50%',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <IconCopy size={36} color={tipoSeleccionado === 'desde-existente' ? 'white' : 'var(--mantine-color-orange-6)'} />
            </Box>
            
            <Title order={3} ta="center" c={tipoSeleccionado === 'desde-existente' ? 'orange.7' : 'dark'} fw={600}>
              Desde dieta existente
            </Title>
            
            <Text ta="center" size="sm" c="dimmed" maw={200}>
              Copiar una de tus dietas anteriores como base para crear una nueva versión personalizada
            </Text>

            <Badge
              color="orange"
              variant="light"
              size="lg"
              radius="xl"
              style={{ fontWeight: 500 }}
            >
              {dietasExistentes.length} dietas
            </Badge>

            {tipoSeleccionado === 'desde-existente' && (
              <Stack gap="sm" w="100%" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {dietasExistentes.length > 0 ? (
                  dietasExistentes.slice(0, 5).map((dieta) => (
                    <Button
                      key={dieta._id}
                      variant="outline"
                      color="orange"
                      size="sm"
                      fullWidth
                      radius="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeleccionarDietaExistente(dieta);
                      }}
                      style={{ fontWeight: 500 }}
                    >
                      <Text truncate>{dieta.nombre}</Text>
                    </Button>
                  ))
                ) : (
                  <Alert
                    icon={<IconInfoCircle size={16} />}
                    color="blue"
                    variant="light"
                    radius="lg"
                  >
                    No tienes dietas disponibles para copiar
                  </Alert>
                )}
              </Stack>
            )}
          </Stack>
        </Card>
      </SimpleGrid>

      {tipoSeleccionado && datosExtra && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginTop: '2rem' }}
        >
          <Alert
            icon={<IconCheck size={20} />}
            title="¡Opción seleccionada!"
            color="green"
            variant="light"
            radius="lg"
            style={{ 
              border: '2px solid var(--mantine-color-green-3)',
              backgroundColor: 'var(--mantine-color-green-0)'
            }}
          >
            <Text size="md" fw={500}>
              {tipoSeleccionado === 'desde-plantilla' && (
                <>Has seleccionado la plantilla: <Text span c="green.7" fw={600}>{datosExtra?.plantillaInfo?.nombre}</Text></>
              )}
              {tipoSeleccionado === 'desde-existente' && (
                <>Has seleccionado la dieta: <Text span c="green.7" fw={600}>{datosExtra?.dietaInfo?.nombre}</Text></>
              )}
            </Text>
          </Alert>
        </motion.div>
      )}
    </Paper>
  );
};

export default TipoCreacionDieta;
