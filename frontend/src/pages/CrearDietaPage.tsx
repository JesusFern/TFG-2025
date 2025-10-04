import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text,
  Alert, 
  Space,
  Group,
  Avatar,
  Paper,
  Box,
  Button
} from '@mantine/core';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import FormularioCrearDieta from '../components/forms/diets/FormularioCrearDieta';
import TipoCreacionDieta, { TipoCreacion } from '../components/forms/diets/TipoCreacionDieta';
import { DietaResponse } from '../types';
import { renderClientInfo } from '../components/common/BreadcrumbUtils';
import { IconAlertCircle, IconUser, IconChevronLeft, IconArrowLeft } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { getUserById } from '../services/userService';

const CrearDietaPage: React.FC = () => {
  const { clienteId } = useParams<{ clienteId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { clienteNombre?: string } | undefined;
  
  const [clienteInfo, setClienteInfo] = useState({
    id: clienteId || "",
    nombre: state?.clienteNombre || ""
  });
  const [loadingCliente, setLoadingCliente] = useState(false);
  
  const [mensaje, setMensaje] = useState<{ tipo: 'error', texto: string } | null>(null);
  const [pasoActual, setPasoActual] = useState<'seleccion' | 'formulario'>('seleccion');
  const [tipoCreacion, setTipoCreacion] = useState<TipoCreacion | null>(null);
  const [datosCreacion, setDatosCreacion] = useState<{
    tipoArquetipo?: string;
    plantillaInfo?: {
      tipo: string;
      nombre: string;
      descripcion: string;
      caloriasObjetivo: number;
    };
    dietaOrigenId?: string;
    dietaInfo?: DietaResponse;
  } | undefined>(undefined);
  
  const handleClienteInfoUpdate = (nombre: string) => {
    setClienteInfo(prev => ({ ...prev, nombre }));
  };

  // Cargar nombre del cliente si no está disponible
  useEffect(() => {
    if (clienteId && !clienteInfo.nombre) {
      setLoadingCliente(true);
      (async () => {
        try {
          const userData = await getUserById(clienteId);
          setClienteInfo(prev => ({ ...prev, nombre: userData.fullName }));
        } catch (error) {
          console.error('Error al cargar datos del cliente:', error);
        } finally {
          setLoadingCliente(false);
        }
      })();
    }
  }, [clienteId, clienteInfo.nombre]);

  const handleSeleccionarTipo = (tipo: TipoCreacion, datosExtra?: {
    tipoArquetipo?: string;
    plantillaInfo?: {
      tipo: string;
      nombre: string;
      descripcion: string;
      caloriasObjetivo: number;
    };
    dietaOrigenId?: string;
    dietaInfo?: DietaResponse;
  }) => {
    setTipoCreacion(tipo);
    setDatosCreacion(datosExtra);
    setPasoActual('formulario');
  };

  const handleVolverSeleccion = () => {
    setPasoActual('seleccion');
    setTipoCreacion(null);
    setDatosCreacion(undefined);
    setMensaje(null);
  };

  const handleDietaCreada = (dietaData: DietaResponse) => {
    // Redirigir directamente a la página de editar dieta
    if (dietaData._id) {
      navigate(`/editar-dieta/${dietaData._id}`);
    }
  };

  const handleError = (error: Error) => {
    setMensaje({
      tipo: 'error',
      texto: error.message || 'Error al crear la dieta'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleBackToClients = () => {
    navigate('/worker/dashboard-clients');
  };

  const getTituloPaso = () => {
    if (pasoActual === 'seleccion') {
      return 'Seleccionar tipo de creación';
    }
    
    switch (tipoCreacion) {
      case 'desde-cero':
        return 'Crear dieta desde cero';
      case 'desde-plantilla':
        return `Crear dieta desde plantilla: ${datosCreacion?.plantillaInfo?.nombre || ''}`;
      case 'desde-existente':
        return `Crear dieta desde: ${datosCreacion?.dietaInfo?.nombre || ''}`;
      default:
        return 'Crear Nueva Dieta';
    }
  };

  return (
    <Container size="md" py="xl">
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
        <Group mb="md" align="flex-start" justify="space-between">
          <Group align="flex-start">
            <Avatar 
              size="lg" 
              color="nutroos-green" 
              radius="xl"
            >
              <IconUser size="1.5rem" />
            </Avatar>
            
            <Box style={{ flex: 1 }}>
              <Title order={2} mb={5} c="nutroos-green.6">{getTituloPaso()}</Title>
              <Text size="sm" c="dimmed">
                Para cliente: {loadingCliente ? 'Cargando...' : (clienteInfo.nombre || 'Cliente no encontrado')}
              </Text>
            </Box>
          </Group>

          <Group gap="sm">
            {pasoActual === 'formulario' && (
              <Button
                variant="outline"
                color="gray"
                leftSection={<IconChevronLeft size={16} />}
                onClick={handleVolverSeleccion}
                size="sm"
              >
                Cambiar tipo
              </Button>
            )}
            {pasoActual === 'seleccion' && (
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleBackToClients}
                color="gray"
                size="sm"
              >
                Volver a gestión de clientes
              </Button>
            )}
          </Group>
        </Group>
      </Paper>
      
      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="filled"
            mb="md"
            withCloseButton
            onClose={() => setMensaje(null)}
          >
            {mensaje.texto}
          </Alert>
          <Space h="md" />
        </motion.div>
      )}
        
      {pasoActual === 'seleccion' ? (
        <TipoCreacionDieta 
          onSeleccionarTipo={handleSeleccionarTipo}
          clienteId={clienteInfo.id}
        />
      ) : (
        <FormularioCrearDieta 
          onSuccess={handleDietaCreada}
          onError={handleError}
          clienteId={clienteInfo.id}
          clienteNombre={clienteInfo.nombre}
          onClienteNombreLoaded={handleClienteInfoUpdate}
          tipoCreacion={tipoCreacion}
          datosCreacion={datosCreacion}
        />
      )}
    </Container>
  );
};

export default CrearDietaPage;