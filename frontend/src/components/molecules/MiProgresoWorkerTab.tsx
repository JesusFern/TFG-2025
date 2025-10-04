import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Grid, Group, Select, Stack, Text, Box, Image, Modal, Divider, useMantineColorScheme, Paper } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { IconMaximize, IconPhoto, IconVideo } from '@tabler/icons-react';
import { userTrackingService } from '../../services/userTrackingService';
import { UserTrackingDto } from '../../types/userTracking';
import { getClientesAsignados, ClienteAsignado } from '../../services/workerService';
import WeekPanel from './shared/WeekPanel';
import HistorialSelector from './shared/HistorialSelector';

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { week: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7), year: d.getUTCFullYear() };
}

const MiProgresoWorkerTab: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [clientes, setClientes] = useState<ClienteAsignado[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [trackings, setTrackings] = useState<UserTrackingDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(getISOWeek(new Date()).week);
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(getISOWeek(new Date()).year);
  const [mostrarHistorial, setMostrarHistorial] = useState<boolean>(false);
  const [parametroGrafica, setParametroGrafica] = useState<'peso' | 'grasa' | 'masaMuscular' | 'cintura' | 'cadera' | 'pecho' | 'brazos' | 'muslos'>('peso');
  const [imagenAmpliada, setImagenAmpliada] = useState<{ src: string; nombre: string } | null>(null);

  const { week: currentWeek, year: currentYear } = useMemo(() => getISOWeek(new Date()), []);

  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const asignados = await getClientesAsignados();
      setClientes(asignados);
      if (asignados.length > 0) {
        setClienteSeleccionado(asignados[0].clienteId);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error cargando clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarTracking = useCallback(async (userId: string) => {
    try {
      setError(null);
      const res = await userTrackingService.getByUserIdForWorker(userId);
      if (res.success) {
        setTrackings(res.data);
      } else {
        setTrackings([]);
        setError('Error cargando seguimiento');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error cargando seguimiento');
      setTrackings([]);
    }
  }, []);

  useEffect(() => { 
    cargarClientes(); 
  }, [cargarClientes]);

  useEffect(() => { 
    if (clienteSeleccionado) {
      cargarTracking(clienteSeleccionado);
    }
  }, [clienteSeleccionado, cargarTracking]);

  // Obtener registros de la semana seleccionada
  const getRegistrosSemanaActual = useMemo(() => {
    return trackings.filter(tracking => {
      const { week, year } = getISOWeek(new Date(tracking.fechaSeguimiento));
      return week === semanaSeleccionada && year === añoSeleccionado;
    }).sort((a, b) => new Date(a.fechaSeguimiento).getTime() - new Date(b.fechaSeguimiento).getTime());
  }, [trackings, semanaSeleccionada, añoSeleccionado]);


  const ampliarImagen = (src: string, nombre: string) => {
    setImagenAmpliada({ src, nombre });
  };

  const cerrarImagenAmpliada = () => {
    setImagenAmpliada(null);
  };

  if (loading) return <Text>Cargando...</Text>;
  if (error && !clienteSeleccionado) return <Alert color="red">{error}</Alert>;

  const registrosSemanaActual = getRegistrosSemanaActual;
  const clienteActual = clientes.find(c => c.clienteId === clienteSeleccionado);

  return (
    <Stack gap="lg">
      {/* Selector de cliente */}
      <Card withBorder>
        <Select
          label="Cliente"
          placeholder="Seleccionar cliente"
          data={clientes.map(c => ({ value: c.clienteId, label: c.cliente.fullName }))}
          value={clienteSeleccionado}
          onChange={setClienteSeleccionado}
        />
      </Card>

      {error && <Alert color="red">{error}</Alert>}

      {clienteSeleccionado && clienteActual && (
        <>
          {/* Panel de semana actual */}
          <WeekPanel 
            semanaSeleccionada={semanaSeleccionada}
            añoSeleccionado={añoSeleccionado}
            isCurrentWeek={semanaSeleccionada === currentWeek && añoSeleccionado === currentYear}
            onRefresh={() => {
              if (clienteSeleccionado) {
                cargarTracking(clienteSeleccionado);
              }
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

          {/* Información del cliente */}
          <Card withBorder>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text fw={600}>Información del Cliente</Text>
              </Group>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Nombre:</Text>
                  <Text fw={500}>{clienteActual.cliente.fullName}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Tipo de asignación:</Text>
                  <Text fw={500}>{clienteActual.tipoAsignacion}</Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          {/* Registros de la semana actual */}
          {registrosSemanaActual.length > 0 && (
            <Card withBorder shadow="sm">
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text fw={600} c={isDark ? 'white' : 'dark'}>📊 Registro de esta semana</Text>
                  <Text size="sm" c="dimmed">{registrosSemanaActual.length} registro(s)</Text>
                </Group>

                {registrosSemanaActual.map((registro) => (
                  <Box key={registro._id}>
                    <Divider mb="md" />
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Fecha:</Text>
                        <Text fw={500}>{new Date(registro.fechaSeguimiento).toLocaleDateString('es-ES')}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Hora:</Text>
                        <Text fw={500}>{new Date(registro.fechaSeguimiento).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
                      </Grid.Col>
                    </Grid>

                    <Divider my="md" />

                    <Text fw={600} mb="sm" c={isDark ? 'white' : 'dark'}>Mediciones registradas</Text>
                    <Grid>
                      {registro.pesoCorporal && (
                        <Grid.Col span={4}>
                          <Paper p="sm" bg={isDark ? "dark.6" : "gray.0"} style={{ borderRadius: 8 }} withBorder>
                            <Text size="xs" c="dimmed">PESO</Text>
                            <Text fw={700} size="lg" c={isDark ? 'white' : 'dark'}>{registro.pesoCorporal} kg</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.porcentajeGrasaCorporal && (
                        <Grid.Col span={4}>
                          <Paper p="sm" bg={isDark ? "dark.6" : "gray.0"} style={{ borderRadius: 8 }} withBorder>
                            <Text size="xs" c="dimmed">GRASA</Text>
                            <Text fw={700} size="lg" c={isDark ? 'white' : 'dark'}>{registro.porcentajeGrasaCorporal}%</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.porcentajeMasaMuscular && (
                        <Grid.Col span={4}>
                          <Paper p="sm" bg={isDark ? "dark.6" : "gray.0"} style={{ borderRadius: 8 }} withBorder>
                            <Text size="xs" c="dimmed">MASA MUSCULAR</Text>
                            <Text fw={700} size="lg" c={isDark ? 'white' : 'dark'}>{registro.porcentajeMasaMuscular}%</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.perimetroCintura && (
                        <Grid.Col span={4}>
                          <Paper p="sm" bg={isDark ? "dark.6" : "gray.0"} style={{ borderRadius: 8 }} withBorder>
                            <Text size="xs" c="dimmed">CINTURA</Text>
                            <Text fw={700} size="lg" c={isDark ? 'white' : 'dark'}>{registro.perimetroCintura} cm</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.perimetroCadera && (
                        <Grid.Col span={4}>
                          <Paper p="sm" bg={isDark ? "dark.6" : "gray.0"} style={{ borderRadius: 8 }} withBorder>
                            <Text size="xs" c="dimmed">CADERA</Text>
                            <Text fw={700} size="lg" c={isDark ? 'white' : 'dark'}>{registro.perimetroCadera} cm</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.perimetroPecho && (
                        <Grid.Col span={4}>
                          <Paper p="sm" bg={isDark ? "dark.6" : "gray.0"} style={{ borderRadius: 8 }} withBorder>
                            <Text size="xs" c="dimmed">PECHO</Text>
                            <Text fw={700} size="lg" c={isDark ? 'white' : 'dark'}>{registro.perimetroPecho} cm</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.perimetroBrazoIzquierdo && registro.perimetroBrazoDerecho && (
                        <Grid.Col span={4}>
                          <Paper p="sm" bg={isDark ? "dark.6" : "gray.0"} style={{ borderRadius: 8 }} withBorder>
                            <Text size="xs" c="dimmed">BRAZOS</Text>
                            <Text fw={700} size="lg" c={isDark ? 'white' : 'dark'}>{((registro.perimetroBrazoIzquierdo + registro.perimetroBrazoDerecho) / 2).toFixed(1)} cm</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                      {registro.perimetroMusloIzquierdo && registro.perimetroMusloDerecho && (
                        <Grid.Col span={4}>
                          <Paper p="sm" bg={isDark ? "dark.6" : "gray.0"} style={{ borderRadius: 8 }} withBorder>
                            <Text size="xs" c="dimmed">MUSLOS</Text>
                            <Text fw={700} size="lg" c={isDark ? 'white' : 'dark'}>{((registro.perimetroMusloIzquierdo + registro.perimetroMusloDerecho) / 2).toFixed(1)} cm</Text>
                          </Paper>
                        </Grid.Col>
                      )}
                    </Grid>

                    {/* Archivos multimedia */}
                    {registro.archivosMultimedia && registro.archivosMultimedia.length > 0 && (
                      <>
                        <Divider my="md" />
                        <Text fw={600} mb="sm">Archivos multimedia</Text>
                        <Group gap="md">
                          {registro.archivosMultimedia.map((archivo, archivoIndex) => {
                            const archivoPath = archivo.replace(/\\/g, '/');
                            const esImagen = archivoPath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            const esVideo = archivoPath.match(/\.(mp4|webm|ogg|avi|mov)$/i);
                            
                            return (
                              <Box key={archivoIndex} style={{ position: 'relative' }}>
                                {esImagen ? (
                                  <Box
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => ampliarImagen(`http://localhost:5000/uploads/${archivoPath}`, `Archivo ${archivoIndex + 1}`)}
                                  >
                                    <Image
                                      src={`http://localhost:5000/uploads/${archivoPath}`}
                                      alt={`Archivo ${archivoIndex + 1}`}
                                      w={250}
                                      h={200}
                                      style={{ objectFit: 'cover', borderRadius: 8 }}
                                      fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjY2NjIi8+Cjwvc3ZnPgo="
                                    />
                                    <Box
                                      style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        background: 'rgba(0,0,0,0.7)',
                                        borderRadius: 6,
                                        padding: 4
                                      }}
                                    >
                                      <IconMaximize size={16} color="white" />
                                    </Box>
                                  </Box>
                                ) : esVideo ? (
                                  <Box style={{ position: 'relative' }}>
                                    <video
                                      width={300}
                                      height={200}
                                      style={{ objectFit: 'cover', borderRadius: 8 }}
                                      controls
                                      preload="metadata"
                                    >
                                      <source src={`http://localhost:5000/uploads/${archivoPath}`} type="video/mp4" />
                                      Tu navegador no soporta el elemento video.
                                    </video>
                                    <Box
                                      style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        background: 'rgba(0,0,0,0.7)',
                                        borderRadius: 6,
                                        padding: 4
                                      }}
                                    >
                                      <IconVideo size={16} color="white" />
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box
                                    w={300}
                                    h={200}
                                    style={{
                                      background: 'gray.1',
                                      borderRadius: 8,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <IconPhoto size={32} color="gray" />
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </Group>
                      </>
                    )}
                  </Box>
                ))}
              </Stack>
            </Card>
          )}

          {/* Gráfica de evolución */}
          {trackings.length > 0 && (
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

                <Box h={300} style={{ width: '100%', overflow: 'hidden' }}>
                  <LineChart
                    h={300}
                    data={(() => {
                      const points: Array<{ fecha: string; valor: number }> = [];

                      trackings.forEach(tracking => {
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

                      return points
                        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                        .map((point, index) => {
                          const fecha = new Date(point.fecha);
                          const dia = fecha.getDate().toString().padStart(2, '0');
                          const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                          const año = fecha.getFullYear();
                          const fechaFormateada = `${dia}/${mes}/${año}`;
                          return {
                            fecha: fechaFormateada,
                            valor: point.valor,
                            id: `punto_${index}_${fecha.getTime()}`
                          };
                        });
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
              </Stack>
            </Card>
          )}

          {/* Mensaje cuando no hay datos */}
          {trackings.length === 0 && (
            <Card withBorder>
              <Stack gap="md" align="center" py="xl">
                <Text size="lg" c="dimmed">Sin datos de seguimiento</Text>
                <Text size="sm" c="dimmed" ta="center">
                  Este cliente aún no ha registrado ningún seguimiento.
                </Text>
              </Stack>
            </Card>
          )}
        </>
      )}

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

export default MiProgresoWorkerTab;