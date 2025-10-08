import React, { useEffect, useMemo, useState } from 'react';
import { Card, Grid, Group, Stack, Text, Button, NumberInput, Select, Alert, Box, Modal, Divider, FileInput, Image, ActionIcon, useMantineColorScheme, Paper } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { IconUpload, IconX, IconPhoto, IconVideo, IconMaximize } from '@tabler/icons-react';
import { userTrackingService } from '../../services/userTrackingService';
import { UserTrackingDto } from '../../types/userTracking';
import WeekPanel from './shared/WeekPanel';
import HistorialSelector from './shared/HistorialSelector';

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { week: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7), year: d.getUTCFullYear() };
}

const MiProgresoTab: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [trackings, setTrackings] = useState<UserTrackingDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(getISOWeek(new Date()).week);
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(getISOWeek(new Date()).year);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [editingTracking, setEditingTracking] = useState<UserTrackingDto | null>(null);
  const [parametroGrafica, setParametroGrafica] = useState<'peso' | 'grasa' | 'masaMuscular' | 'cintura' | 'cadera' | 'pecho' | 'brazos' | 'muslos'>('peso');
  const [mostrarHistorial, setMostrarHistorial] = useState<boolean>(false);

  // Campos del modal completo
  const [peso, setPeso] = useState<number | ''>('');
  const [grasa, setGrasa] = useState<number | ''>('');
  const [masaMuscular, setMasaMuscular] = useState<number | ''>('');
  const [cintura, setCintura] = useState<number | ''>('');
  const [cadera, setCadera] = useState<number | ''>('');
  const [pecho, setPecho] = useState<number | ''>('');
  const [brazoIzq, setBrazoIzq] = useState<number | ''>('');
  const [brazoDer, setBrazoDer] = useState<number | ''>('');
  const [musloIzq, setMusloIzq] = useState<number | ''>('');
  const [musloDer, setMusloDer] = useState<number | ''>('');
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [subiendoArchivos, setSubiendoArchivos] = useState<boolean>(false);
  const [errorArchivos, setErrorArchivos] = useState<string | null>(null);
  
  // Estado para modal de imagen ampliada
  const [imagenAmpliada, setImagenAmpliada] = useState<{ src: string; nombre: string } | null>(null);

  const { week: currentWeek, year: currentYear } = useMemo(() => getISOWeek(new Date()), []);

  // Cargar datos de seguimiento
  useEffect(() => {
    const loadTracking = async () => {
      try {
        setLoading(true);
        const response = await userTrackingService.getMe();
        if (response.success) {
          setTrackings(response.data);
        } else {
          setError('Error al cargar el seguimiento');
        }
      } catch (err) {
        console.error('Error cargando seguimiento:', err);
        setError('Error al cargar el seguimiento');
      } finally {
        setLoading(false);
      }
    };

    loadTracking();
  }, []);


  const abrirModal = () => {
    setError(null);
    setErrorArchivos(null);
    const ultimoRegistro = getUltimoRegistroSemanaActual;
    
    if (ultimoRegistro) {
      setEditingTracking(ultimoRegistro);
      // Cargar valores existentes si hay registro
      setPeso(ultimoRegistro.pesoCorporal || '');
      setGrasa(ultimoRegistro.porcentajeGrasaCorporal || '');
      setMasaMuscular(ultimoRegistro.porcentajeMasaMuscular || '');
      setCintura(ultimoRegistro.perimetroCintura || '');
      setCadera(ultimoRegistro.perimetroCadera || '');
      setPecho(ultimoRegistro.perimetroPecho || '');
      setBrazoIzq(ultimoRegistro.perimetroBrazoIzquierdo || '');
      setBrazoDer(ultimoRegistro.perimetroBrazoDerecho || '');
      setMusloIzq(ultimoRegistro.perimetroMusloIzquierdo || '');
      setMusloDer(ultimoRegistro.perimetroMusloDerecho || '');
    } else {
      setEditingTracking(null);
      // Limpiar campos si no hay registro
      setPeso('');
      setGrasa('');
      setMasaMuscular('');
      setCintura('');
      setCadera('');
      setPecho('');
      setBrazoIzq('');
      setBrazoDer('');
      setMusloIzq('');
      setMusloDer('');
      setArchivosSeleccionados([]);
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditingTracking(null);
    setError(null);
    setErrorArchivos(null);
    // Limpiar campos
    setPeso('');
    setGrasa('');
    setMasaMuscular('');
    setCintura('');
    setCadera('');
    setPecho('');
    setBrazoIzq('');
    setBrazoDer('');
    setMusloIzq('');
    setMusloDer('');
    setArchivosSeleccionados([]);
  };

  // Función para ampliar imagen
  const ampliarImagen = (src: string, nombre: string) => {
    setImagenAmpliada({ src, nombre });
  };

  // Función para cerrar imagen ampliada
  const cerrarImagenAmpliada = () => {
    setImagenAmpliada(null);
  };

  const handleGuardar = async () => {
    try {
      setError(null);
      setErrorArchivos(null);
      setSubiendoArchivos(false);

      // Validar que al menos un campo esté relleno
      const tieneCamposRellenos = 
        peso !== '' || grasa !== '' || masaMuscular !== '' || cintura !== '' || cadera !== '' || pecho !== '' ||
        brazoIzq !== '' || brazoDer !== '' || musloIzq !== '' || musloDer !== '' ||
        archivosSeleccionados.length > 0;

      if (!tieneCamposRellenos) {
        setError('Debes proporcionar al menos un campo de seguimiento');
        return;
      }

      // Crear o actualizar el registro
      let trackingResult;
      if (editingTracking) {
        // Actualizar registro existente
        trackingResult = await userTrackingService.update(editingTracking._id, {
          pesoCorporal: peso !== '' ? Number(peso) : undefined,
          porcentajeGrasaCorporal: grasa !== '' ? Number(grasa) : undefined,
          porcentajeMasaMuscular: masaMuscular !== '' ? Number(masaMuscular) : undefined,
          perimetroCintura: cintura !== '' ? Number(cintura) : undefined,
          perimetroCadera: cadera !== '' ? Number(cadera) : undefined,
          perimetroPecho: pecho !== '' ? Number(pecho) : undefined,
          perimetroBrazoIzquierdo: brazoIzq !== '' ? Number(brazoIzq) : undefined,
          perimetroBrazoDerecho: brazoDer !== '' ? Number(brazoDer) : undefined,
          perimetroMusloIzquierdo: musloIzq !== '' ? Number(musloIzq) : undefined,
          perimetroMusloDerecho: musloDer !== '' ? Number(musloDer) : undefined
        });
      } else {
        // Crear nuevo registro
        trackingResult = await userTrackingService.guardarSeguimientoCompleto({
          pesoCorporal: peso !== '' ? Number(peso) : undefined,
          porcentajeGrasaCorporal: grasa !== '' ? Number(grasa) : undefined,
          porcentajeMasaMuscular: masaMuscular !== '' ? Number(masaMuscular) : undefined,
          perimetroCintura: cintura !== '' ? Number(cintura) : undefined,
          perimetroCadera: cadera !== '' ? Number(cadera) : undefined,
          perimetroPecho: pecho !== '' ? Number(pecho) : undefined,
          perimetroBrazoIzquierdo: brazoIzq !== '' ? Number(brazoIzq) : undefined,
          perimetroBrazoDerecho: brazoDer !== '' ? Number(brazoDer) : undefined,
          perimetroMusloIzquierdo: musloIzq !== '' ? Number(musloIzq) : undefined,
          perimetroMusloDerecho: musloDer !== '' ? Number(musloDer) : undefined
        });
      }

      if (trackingResult.success) {
        // Subir archivos si hay alguno seleccionado
        if (archivosSeleccionados.length > 0) {
          setSubiendoArchivos(true);
          const trackingId = editingTracking ? editingTracking._id : trackingResult.data._id;
          
          for (const archivo of archivosSeleccionados) {
            try {
              await userTrackingService.uploadArchivoMultimedia(trackingId, archivo);
            } catch (error) {
              console.error('Error subiendo archivo:', error);
              setErrorArchivos('Error al subir algunos archivos');
            }
          }
          setSubiendoArchivos(false);
        }

        // Recargar datos
        const response = await userTrackingService.getMe();
        if (response.success) {
          setTrackings(response.data);
        }
        
        cerrarModal();
      } else {
        setError('Error al guardar el seguimiento');
      }
    } catch (error) {
      console.error('Error guardando seguimiento:', error);
      setError('Error al guardar el seguimiento');
      setSubiendoArchivos(false);
    }
  };

  const handleArchivoSeleccionado = (archivos: File[]) => {
    setErrorArchivos(null);
    
    if (archivos.length === 0) {
      setArchivosSeleccionados([]);
      return;
    }

    // Validar archivos
    const archivosValidos: File[] = [];
    const errores: string[] = [];

    archivos.forEach(archivo => {
      // Verificar tipo de archivo
      const esImagen = archivo.type.startsWith('image/');
      const esVideo = archivo.type.startsWith('video/');
      
      if (!esImagen && !esVideo) {
        errores.push(`${archivo.name}: Solo se permiten imágenes y videos`);
        return;
      }

      // Verificar tamaño (10MB)
      if (archivo.size > 10 * 1024 * 1024) {
        errores.push(`${archivo.name}: El archivo es demasiado grande (máximo 10MB)`);
        return;
      }

      archivosValidos.push(archivo);
    });

    if (errores.length > 0) {
      setErrorArchivos(errores.join(', '));
      return;
    }

    if (archivosValidos.length > 3) {
      setErrorArchivos('Máximo 3 archivos multimedia por seguimiento');
      return;
    }

    setArchivosSeleccionados(archivosValidos);
  };

  const removerArchivo = (index: number) => {
    setErrorArchivos(null);
    const nuevosArchivos = archivosSeleccionados.filter((_, i) => i !== index);
    setArchivosSeleccionados(nuevosArchivos);
  };

  const eliminarArchivoExistente = async (trackingId: string, archivoPath: string) => {
    try {
      await userTrackingService.removeArchivoMultimedia(trackingId, archivoPath);
      // Recargar datos
      const response = await userTrackingService.getMe();
      if (response.success) {
        setTrackings(response.data);
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      setError('Error al eliminar el archivo');
    }
  };

  const tieneCamposRellenos = useMemo(() => {
    return peso !== '' || grasa !== '' || masaMuscular !== '' || cintura !== '' || cadera !== '' || pecho !== '' ||
           brazoIzq !== '' || brazoDer !== '' || musloIzq !== '' || musloDer !== '' ||
           archivosSeleccionados.length > 0;
  }, [peso, grasa, masaMuscular, cintura, cadera, pecho, brazoIzq, brazoDer, musloIzq, musloDer, archivosSeleccionados]);

  // Obtener registros de la semana seleccionada
  const getRegistrosSemanaActual = useMemo(() => {
    return trackings.filter(tracking => {
      const { week, year } = getISOWeek(new Date(tracking.fechaSeguimiento));
      return week === semanaSeleccionada && year === añoSeleccionado;
    }).sort((a, b) => new Date(a.fechaSeguimiento).getTime() - new Date(b.fechaSeguimiento).getTime());
  }, [trackings, semanaSeleccionada, añoSeleccionado]);

  // Obtener el último registro de la semana seleccionada
  const getUltimoRegistroSemanaActual = useMemo(() => {
    const registros = getRegistrosSemanaActual;
    return registros.length > 0 ? registros[registros.length - 1] : null;
  }, [getRegistrosSemanaActual]);

  if (loading) return <Text>Cargando...</Text>;
  if (error && !modalAbierto) return <Alert color="red">{error}</Alert>;

  const registrosSemanaActual = getRegistrosSemanaActual;
  const ultimoRegistro = getUltimoRegistroSemanaActual;

  return (
    <Stack gap="lg">
      {/* Panel de semana actual */}
      <WeekPanel 
        semanaSeleccionada={semanaSeleccionada}
        añoSeleccionado={añoSeleccionado}
        isCurrentWeek={semanaSeleccionada === currentWeek && añoSeleccionado === currentYear}
        onRefresh={() => {
          // Recargar datos
          const loadTracking = async () => {
            try {
              const response = await userTrackingService.getMe();
              if (response.success) {
                setTrackings(response.data);
              }
            } catch (err) {
              console.error('Error recargando seguimiento:', err);
            }
          };
          loadTracking();
        }}
        onToggleHistorial={() => {
          setMostrarHistorial(!mostrarHistorial);
        }}
        mostrarHistorial={mostrarHistorial}
      />

      {/* Selector de historial - Solo visible cuando mostrarHistorial es true */}
      {mostrarHistorial && (
        <HistorialSelector 
          semanaSeleccionada={semanaSeleccionada}
          añoSeleccionado={añoSeleccionado}
          onSemanaChange={setSemanaSeleccionada}
          onAñoChange={setAñoSeleccionado}
          onVolverActual={() => {
            setSemanaSeleccionada(currentWeek);
            setAñoSeleccionado(currentYear);
          }}
          getCurrentWeekNumber={() => currentWeek}
        />
      )}

      {/* Card para registrar seguimiento */}
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={600}>
              {ultimoRegistro ? 'Editar registro de esta semana' : 'Registrar seguimiento de esta semana'}
            </Text>
            <Button 
              onClick={abrirModal}
              leftSection={<IconUpload size={16} />}
            >
              {ultimoRegistro ? 'Editar Registro' : 'Nuevo Registro'}
            </Button>
          </Group>
          
          {ultimoRegistro && (
            <Text size="sm" c="dimmed">
              Último registro: {new Date(ultimoRegistro.fechaSeguimiento).toLocaleDateString('es-ES')}
            </Text>
          )}
        </Stack>
      </Card>

      {/* Modal para seguimiento completo */}
      <Modal
        opened={modalAbierto}
        onClose={cerrarModal}
        title={editingTracking ? 'Editar registro de esta semana' : 'Nuevo registro de seguimiento'}
        size="lg"
        centered
        zIndex={1000}
      >
        <Stack gap="md">
          {(error || errorArchivos) && (
            <Alert color="red" title="Error">
              {error || errorArchivos}
            </Alert>
          )}

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Peso corporal (kg)"
                value={peso}
                onChange={(val) => setPeso(val as number | '')}
                min={0}
                max={1000}
                decimalScale={1}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Grasa corporal (%)"
                value={grasa}
                onChange={(val) => setGrasa(val as number | '')}
                min={0}
                max={100}
                decimalScale={1}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Masa muscular (%)"
                value={masaMuscular}
                onChange={(val) => setMasaMuscular(val as number | '')}
                min={0}
                max={100}
                decimalScale={1}
              />
            </Grid.Col>
          </Grid>

          <Divider label="Perímetros" />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Cintura (cm)"
                value={cintura}
                onChange={(val) => setCintura(val as number | '')}
                min={0}
                max={200}
                decimalScale={1}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Cadera (cm)"
                value={cadera}
                onChange={(val) => setCadera(val as number | '')}
                min={0}
                max={200}
                decimalScale={1}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Pecho (cm)"
                value={pecho}
                onChange={(val) => setPecho(val as number | '')}
                min={0}
                max={200}
                decimalScale={1}
              />
            </Grid.Col>
          </Grid>

          <Divider label="Perímetros bilaterales" />

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Brazo izquierdo (cm)"
                value={brazoIzq}
                onChange={(val) => setBrazoIzq(val as number | '')}
                min={0}
                max={200}
                decimalScale={1}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Brazo derecho (cm)"
                value={brazoDer}
                onChange={(val) => setBrazoDer(val as number | '')}
                min={0}
                max={200}
                decimalScale={1}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Muslo izquierdo (cm)"
                value={musloIzq}
                onChange={(val) => setMusloIzq(val as number | '')}
                min={0}
                max={200}
                decimalScale={1}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Muslo derecho (cm)"
                value={musloDer}
                onChange={(val) => setMusloDer(val as number | '')}
                min={0}
                max={200}
                decimalScale={1}
              />
            </Grid.Col>
          </Grid>

          <Divider label="Archivos multimedia" />

          <FileInput
            label="Subir imágenes o videos"
            placeholder="Selecciona archivos..."
            accept="image/*,video/*"
            multiple
            value={archivosSeleccionados}
            onChange={handleArchivoSeleccionado}
            description="Máximo 3 archivos, 10MB cada uno"
            error={errorArchivos}
          />

          {/* Mostrar archivos seleccionados */}
          {archivosSeleccionados.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>Archivos seleccionados:</Text>
              {archivosSeleccionados.map((archivo, index) => (
                <Group key={index} justify="space-between" p="xs" style={{ border: '1px solid #e9ecef', borderRadius: '4px' }}>
                  <Group gap="xs">
                    {archivo.type.startsWith('image/') ? <IconPhoto size={16} /> : <IconVideo size={16} />}
                    <Text size="sm">{archivo.name}</Text>
                    <Text size="xs" c="dimmed">({(archivo.size / 1024 / 1024).toFixed(1)} MB)</Text>
                  </Group>
                  <ActionIcon color="red" variant="subtle" onClick={() => removerArchivo(index)}>
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          )}

          {/* Mostrar archivos existentes si estamos editando */}
          {editingTracking && editingTracking.archivosMultimedia.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>Archivos actuales:</Text>
              {editingTracking.archivosMultimedia.map((archivo, index) => {
                const archivoNormalizado = archivo.replace(/\\/g, '/');
                const extension = archivoNormalizado.toLowerCase().split('.').pop();
                const esVideo = extension === 'mp4' || extension === 'mov' || extension === 'avi' || extension === 'webm' || extension === 'mkv';
                const esImagen = extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' || extension === 'webp';
                
                return (
                  <Group key={index} justify="space-between" p="xs" style={{ border: '1px solid #e9ecef', borderRadius: '4px' }}>
                    <Group gap="xs">
                      {esImagen ? <IconPhoto size={16} /> : esVideo ? <IconVideo size={16} /> : <IconPhoto size={16} />}
                      <Text size="sm">{archivoNormalizado.split('/').pop()}</Text>
                    </Group>
                    <ActionIcon 
                      color="red" 
                      variant="subtle" 
                      onClick={() => eliminarArchivoExistente(editingTracking._id, archivo)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                );
              })}
            </Stack>
          )}

          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGuardar}
              loading={subiendoArchivos}
              disabled={!tieneCamposRellenos}
            >
              {editingTracking ? 'Actualizar Seguimiento' : 'Guardar Seguimiento'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Registros de la semana actual */}
      {registrosSemanaActual.length > 0 && (
        <Card withBorder shadow="sm">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Text size="xl" fw={700} c={isDark ? 'white' : 'dark'}>
                📊 Registro de esta semana
              </Text>
              <Text size="sm" c="dimmed">
                {registrosSemanaActual.length} registro{registrosSemanaActual.length !== 1 ? 's' : ''}
              </Text>
            </Group>
            
            {registrosSemanaActual.map((registro) => (
              <Card key={registro._id} withBorder shadow="xs">
                <Stack gap="md">
                  {/* Mediciones */}
                  <Box p="md" style={{ borderRadius: '8px' }}>
                    <Text size="sm" fw={600} mb="md" c={isDark ? 'white' : 'dark'}>
                      📏 Mediciones registradas
                    </Text>
                    <Grid>
                      {registro.pesoCorporal && (
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <Paper p="xs" bg={isDark ? 'dark.6' : 'gray.0'} style={{ borderRadius: '6px', textAlign: 'center' }} withBorder>
                            <Text size="xs" c="dimmed" fw={500}>PESO</Text>
                            <Text size="lg" fw={700} c={isDark ? 'white' : 'dark'}>{registro.pesoCorporal} kg</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.porcentajeGrasaCorporal && (
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <Paper p="xs" bg={isDark ? 'dark.6' : 'gray.0'} style={{ borderRadius: '6px', textAlign: 'center' }} withBorder>
                            <Text size="xs" c="dimmed" fw={500}>GRASA</Text>
                            <Text size="lg" fw={700} c={isDark ? 'white' : 'dark'}>{registro.porcentajeGrasaCorporal}%</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.porcentajeMasaMuscular && (
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <Paper p="xs" bg={isDark ? 'dark.6' : 'gray.0'} style={{ borderRadius: '6px', textAlign: 'center' }} withBorder>
                            <Text size="xs" c="dimmed" fw={500}>MASA MUSCULAR</Text>
                            <Text size="lg" fw={700} c={isDark ? 'white' : 'dark'}>{registro.porcentajeMasaMuscular}%</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.perimetroCintura && (
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <Paper p="xs" bg={isDark ? 'dark.6' : 'gray.0'} style={{ borderRadius: '6px', textAlign: 'center' }} withBorder>
                            <Text size="xs" c="dimmed" fw={500}>CINTURA</Text>
                            <Text size="lg" fw={700} c={isDark ? 'white' : 'dark'}>{registro.perimetroCintura} cm</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.perimetroCadera && (
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <Paper p="xs" bg={isDark ? 'dark.6' : 'gray.0'} style={{ borderRadius: '6px', textAlign: 'center' }} withBorder>
                            <Text size="xs" c="dimmed" fw={500}>CADERA</Text>
                            <Text size="lg" fw={700} c={isDark ? 'white' : 'dark'}>{registro.perimetroCadera} cm</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.perimetroPecho && (
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <Paper p="xs" bg={isDark ? 'dark.6' : 'gray.0'} style={{ borderRadius: '6px', textAlign: 'center' }} withBorder>
                            <Text size="xs" c="dimmed" fw={500}>PECHO</Text>
                            <Text size="lg" fw={700} c={isDark ? 'white' : 'dark'}>{registro.perimetroPecho} cm</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {(registro.perimetroBrazoIzquierdo || registro.perimetroBrazoDerecho) && (
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <Paper p="xs" bg={isDark ? 'dark.6' : 'gray.0'} style={{ borderRadius: '6px', textAlign: 'center' }} withBorder>
                            <Text size="xs" c="dimmed" fw={500}>BRAZOS</Text>
                            <Text size="lg" fw={700} c={isDark ? 'white' : 'dark'}>
                              {registro.perimetroBrazoIzquierdo && registro.perimetroBrazoDerecho 
                                ? `${((registro.perimetroBrazoIzquierdo + registro.perimetroBrazoDerecho) / 2).toFixed(1)} cm`
                                : `${registro.perimetroBrazoIzquierdo || registro.perimetroBrazoDerecho} cm`
                              }
                            </Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {(registro.perimetroMusloIzquierdo || registro.perimetroMusloDerecho) && (
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <Paper p="xs" bg={isDark ? 'dark.6' : 'gray.0'} style={{ borderRadius: '6px', textAlign: 'center' }} withBorder>
                            <Text size="xs" c="dimmed" fw={500}>MUSLOS</Text>
                            <Text size="lg" fw={700} c={isDark ? 'white' : 'dark'}>
                              {registro.perimetroMusloIzquierdo && registro.perimetroMusloDerecho 
                                ? `${((registro.perimetroMusloIzquierdo + registro.perimetroMusloDerecho) / 2).toFixed(1)} cm`
                                : `${registro.perimetroMusloIzquierdo || registro.perimetroMusloDerecho} cm`
                              }
                            </Text>
                          </Paper>
                        </Grid.Col>
                      )}
                    </Grid>
                  </Box>

                  {/* Archivos multimedia */}
                  {registro.archivosMultimedia.length > 0 && (
                    <Box p="md" style={{ borderRadius: '8px' }}>
                      <Text size="sm" fw={600} mb="md" c={isDark ? 'white' : 'dark'}>
                        📎 Archivos multimedia ({registro.archivosMultimedia.length})
                      </Text>
                      <Grid>
                        {registro.archivosMultimedia.map((archivo, archivoIndex) => {
                          const archivoNormalizado = archivo.replace(/\\/g, '/');
                          const extension = archivoNormalizado.toLowerCase().split('.').pop();
                          const esVideo = extension === 'mp4' || extension === 'mov' || extension === 'avi' || extension === 'webm' || extension === 'mkv';
                          const esImagen = extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' || extension === 'webp';
                          
                          const fileUrl = `/uploads/${archivoNormalizado}`;
                          
                          return (
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={archivoIndex}>
                              <Box style={{ border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
                                {esImagen ? (
                                  <Box 
                                    style={{ 
                                      cursor: 'pointer',
                                      position: 'relative'
                                    }}
                                    onClick={() => ampliarImagen(fileUrl, archivoNormalizado.split('/').pop() || '')}
                                  >
                                    <Image
                                      src={fileUrl}
                                      alt="Imagen de seguimiento"
                                      height={180}
                                      fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjY2NjIi8+Cjwvc3ZnPgo="
                                    />
                                    <Box
                                      style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <IconMaximize size={18} color="white" />
                                    </Box>
                                  </Box>
                                ) : esVideo ? (
                                  <Box h={180} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'dark.6' : 'gray.0' }}>
                                    <video
                                      src={fileUrl}
                                      controls
                                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                                      preload="metadata"
                                      crossOrigin="anonymous"
                                    >
                                      Tu navegador no soporta videos.
                                    </video>
                                  </Box>
                                ) : (
                                  <Box h={180} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'dark.6' : 'gray.0' }}>
                                    <Group>
                                      <IconPhoto size={32} color="gray" />
                                      <Text size="sm" c="dimmed">Archivo multimedia</Text>
                                    </Group>
                                  </Box>
                                )}
                              </Box>
                            </Grid.Col>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>
      )}

      {/* Gráfica de evolución */}
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={600}>Evolución por fechas</Text>
            <Select
              value={parametroGrafica}
              onChange={(v) => setParametroGrafica((v as 'peso' | 'grasa' | 'masaMuscular' | 'cintura' | 'cadera' | 'pecho' | 'brazos' | 'muslos') || 'peso')}
              data={[
                { value: 'peso', label: 'Peso corporal (kg)' },
                { value: 'grasa', label: 'Grasa corporal (%)' },
                { value: 'masaMuscular', label: 'Masa muscular (%)' },
                { value: 'cintura', label: 'Perímetro cintura (cm)' },
                { value: 'cadera', label: 'Perímetro cadera (cm)' },
                { value: 'pecho', label: 'Perímetro pecho (cm)' },
                { value: 'brazos', label: 'Perímetro brazos (cm, promedio)' },
                { value: 'muslos', label: 'Perímetro muslos (cm, promedio)' }
              ]}
              w={280}
            />
          </Group>

          {trackings.length > 0 ? (
            <Box h={300} style={{ width: '100%', overflow: 'hidden' }}>
              <LineChart
                h={300}
                data={(() => {
                  
                  const points: Array<{ fecha: string; valor: number }> = [];

                  trackings.forEach((tracking) => {
                    
                    let valor: number | null = null;

                    if (parametroGrafica === 'peso' && tracking.pesoCorporal) {
                      valor = tracking.pesoCorporal;
                    } else if (parametroGrafica === 'grasa' && tracking.porcentajeGrasaCorporal) {
                      valor = tracking.porcentajeGrasaCorporal;
                    } else if (parametroGrafica === 'masaMuscular' && tracking.porcentajeMasaMuscular) {
                      valor = tracking.porcentajeMasaMuscular;
                    } else if (parametroGrafica === 'cintura' && tracking.perimetroCintura) {
                      valor = tracking.perimetroCintura;
                    } else if (parametroGrafica === 'cadera' && tracking.perimetroCadera) {
                      valor = tracking.perimetroCadera;
                    } else if (parametroGrafica === 'pecho' && tracking.perimetroPecho) {
                      valor = tracking.perimetroPecho;
                    } else if (parametroGrafica === 'brazos') {
                      const izq = tracking.perimetroBrazoIzquierdo || 0;
                      const der = tracking.perimetroBrazoDerecho || 0;
                      if (izq > 0 || der > 0) {
                        valor = (izq + der) / ([tracking.perimetroBrazoIzquierdo, tracking.perimetroBrazoDerecho].filter(v => v && v > 0).length || 1);
                      }
                    } else if (parametroGrafica === 'muslos') {
                      const izq = tracking.perimetroMusloIzquierdo || 0;
                      const der = tracking.perimetroMusloDerecho || 0;
                      if (izq > 0 || der > 0) {
                        valor = (izq + der) / ([tracking.perimetroMusloIzquierdo, tracking.perimetroMusloDerecho].filter(v => v && v > 0).length || 1);
                      }
                    }


                    if (valor !== null) {
                      points.push({ fecha: tracking.fechaSeguimiento, valor });
                    }
                  });


                  // Ordenar por fecha y mostrar cada registro individual desde el más antiguo
                  const result = points
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                    .map((point, index) => {
                      const fecha = new Date(point.fecha);
                      const dia = fecha.getDate().toString().padStart(2, '0');
                      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                      const año = fecha.getFullYear();
                      const fechaFormateada = `${dia}/${mes}/${año}`;
                      return {
                        fecha: fechaFormateada, // Usar fecha completa para el tooltip
                        valor: point.valor,
                        // Agregar un identificador único para evitar problemas de duplicados
                        id: `punto_${index}_${fecha.getTime()}`
                      };
                    });

                  
                  return result;
                })()}
                dataKey="fecha"
                series={[{ name: 'valor', color: 'teal.6' }]}
                withLegend
                withDots
                strokeDasharray="0"
                curveType="linear"
                xAxisProps={{ 
                  padding: { left: 30, right: 30 }
                }}
                yAxisProps={{
                  tickCount: 8
                }}
                activeDotProps={{ r: 8 }}
                style={{ width: '100%' }}
              />
            </Box>
          ) : (
            <Text size="sm" c="dimmed">Sin datos</Text>
          )}
        </Stack>
      </Card>

      {/* Modal para imagen ampliada */}
      <Modal
        opened={!!imagenAmpliada}
        onClose={cerrarImagenAmpliada}
        title={imagenAmpliada?.nombre}
        size="xl"
        centered
        zIndex={1001}
      >
        {imagenAmpliada && (
          <Box style={{ textAlign: 'center' }}>
            <Image
              src={imagenAmpliada.src}
              alt={imagenAmpliada.nombre}
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjY2NjIi8+Cjwvc3ZnPgo="
            />
          </Box>
        )}
      </Modal>
    </Stack>
  );
};

export default MiProgresoTab;