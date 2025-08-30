import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Stack, 
  Group, 
  Button, 
  Modal, 
  Title, 
  useMantineTheme,
  Alert,
  Text,
  Tabs,
  Box,
  Grid,
  Badge
} from '@mantine/core';
import { 
  IconEdit, 
  IconCamera, 
  IconUser, 
  IconHeart, 
  IconActivity,
  IconSettings,
  IconShield,
  IconAlertCircle,
  IconClock,
  IconTarget,
  IconAlertTriangle,
  IconPhone
} from '@tabler/icons-react';
import { ProfileHeader } from '../molecules/ProfileHeader';
import { ProfileStats } from '../molecules/ProfileStats';
import { ProfileForm } from '../molecules/ProfileForm';
import { UserProfile, DatosSaludYNutricion, DatosActividadFisica, ProfileFormData } from '../../types/profile';

interface ProfilePageProps {
  profile: UserProfile;
  datosSalud?: DatosSaludYNutricion;
  datosActividad?: DatosActividadFisica;
  onUpdateProfile: (data: ProfileFormData) => Promise<void>;
  onUpdatePhoto: (file: File) => Promise<void>;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  datosSalud,
  datosActividad,
  onUpdateProfile,
  onUpdatePhoto
}) => {
  const theme = useMantineTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    title?: string;
    message: string;
  } | null>(null);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleEditPhoto = () => {
    setIsPhotoModalOpen(true);
  };

  const handleProfileSubmit = async (formData: ProfileFormData) => {
    try {
      setIsLoading(true);
      await onUpdateProfile(formData);
      
      setIsEditModalOpen(false);
      console.log('Perfil actualizado exitosamente, mostrando alerta...');
      
      setAlert({
        type: 'success',
        title: '¡Perfil actualizado!',
        message: 'Tu perfil se ha actualizado correctamente'
      });
      
    } catch {
      console.log('Error al actualizar perfil');
      setIsEditModalOpen(false);
      
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar el perfil'
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSubmit = async (file: File) => {
    try {
      setIsPhotoUploading(true);
      await onUpdatePhoto(file);
      
      setIsPhotoModalOpen(false);
      console.log('Foto subida exitosamente, mostrando alerta...');
      
      setAlert({
        type: 'success',
        title: '¡Foto actualizada!',
        message: 'Tu foto de perfil se ha actualizado correctamente.'
      });
      
    } catch (error) {
      console.log('Error al subir foto:', error);
      setIsPhotoModalOpen(false);
      
      setAlert({
        type: 'error',
        title: 'Error al subir foto',
        message: error instanceof Error ? error.message : 'Error desconocido al subir la foto'
      });
      
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const closeAlert = () => setAlert(null);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {alert && (
          <Alert
            color={alert.type === 'success' ? 'nutroos-green' : 'red'}
            variant="light"
            withCloseButton
            onClose={closeAlert}
            icon={alert.type === 'success' ? <IconShield size={16} /> : undefined}
            title={alert.title}
          >
            <Text size="sm">{alert.message}</Text>
          </Alert>
        )}

        <Paper p="xl" radius="lg" withBorder>
          <ProfileHeader
            profile={profile}
            onEditProfile={handleEditProfile}
            onEditPhoto={handleEditPhoto}
          />
        </Paper>

        <Paper p="xl" radius="lg" withBorder>
          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Tab 
                value="overview" 
                leftSection={<IconUser size={16} />}
                fw={500}
              >
                Resumen
              </Tabs.Tab>
              <Tabs.Tab 
                value="health" 
                leftSection={<IconHeart size={16} />}
                fw={500}
              >
                Salud
              </Tabs.Tab>
              <Tabs.Tab 
                value="activity" 
                leftSection={<IconActivity size={16} />}
                fw={500}
              >
                Actividad
              </Tabs.Tab>
              <Tabs.Tab 
                value="settings" 
                leftSection={<IconSettings size={16} />}
                fw={500}
              >
                Configuración
              </Tabs.Tab>
            </Tabs.List>

            <Box pt="lg">
              <Tabs.Panel value="overview">
                <ProfileStats
                  profile={profile}
                  datosSalud={datosSalud}
                  datosActividad={datosActividad}
                />
              </Tabs.Panel>

              <Tabs.Panel value="health">
                {datosSalud ? (
                  <Stack gap="lg">
                    <Title order={3} c={theme.colors.gray[8]}>
                      Información de Salud y Nutrición
                    </Title>
                    
                    <Grid gutter="md">
                      {/* Medidas Corporales */}
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder style={{ height: '100%' }}>
                          <Stack gap="md">
                            <Group gap="xs">
                              <IconHeart size={20} color={theme.colors.red[6]} />
                              <Text size="lg" fw={600} c={theme.colors.gray[8]}>
                                Medidas Corporales
                              </Text>
                            </Group>
                            
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" c={theme.colors.gray[6]}>
                                  <strong>Altura:</strong>
                                </Text>
                                <Text size="sm" fw={500} c={theme.colors.gray[8]}>
                                  {datosSalud.altura} cm
                                </Text>
                              </Group>
                              
                              <Group justify="space-between">
                                <Text size="sm" c={theme.colors.gray[6]}>
                                  <strong>Peso actual:</strong>
                                </Text>
                                <Text size="sm" fw={500} c={theme.colors.gray[8]}>
                                  {datosSalud.pesoActual} kg
                                </Text>
                              </Group>
                              
                              <Group justify="space-between">
                                <Text size="sm" c={theme.colors.gray[6]}>
                                  <strong>Objetivo:</strong>
                                </Text>
                                <Text size="sm" fw={500} c={theme.colors.gray[8]}>
                                  {datosSalud.objetivoPeso} kg
                                </Text>
                              </Group>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid.Col>

                      {/* Condiciones Médicas */}
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder style={{ height: '100%' }}>
                          <Stack gap="md">
                            <Group gap="xs">
                              <IconAlertCircle size={20} color={theme.colors.orange[6]} />
                              <Text size="lg" fw={600} c={theme.colors.gray[8]}>
                                Condiciones Médicas
                              </Text>
                            </Group>
                            
                            {datosSalud.condicionesMedicas.length > 0 ? (
                              <Stack gap="xs">
                                {datosSalud.condicionesMedicas.map((condicion, index) => (
                                  <Badge 
                                    key={index} 
                                    color="orange" 
                                    variant="light" 
                                    size="sm"
                                    style={{ alignSelf: 'flex-start' }}
                                  >
                                    {condicion}
                                  </Badge>
                                ))}
                              </Stack>
                            ) : (
                              <Text c={theme.colors.gray[5]} size="sm">
                                Ninguna condición médica registrada
                              </Text>
                            )}
                          </Stack>
                        </Paper>
                      </Grid.Col>

                      {/* Restricciones y Preferencias */}
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder style={{ height: '100%' }}>
                          <Stack gap="md">
                            <Group gap="xs">
                              <IconShield size={20} color={theme.colors.blue[6]} />
                              <Text size="lg" fw={600} c={theme.colors.gray[8]}>
                                Restricciones y Preferencias
                              </Text>
                            </Group>
                            
                            <Stack gap="md">
                              <Stack gap="xs">
                                <Text size="sm" fw={500} c={theme.colors.gray[7]}>
                                  Restricciones dietéticas:
                                </Text>
                                {datosSalud.restriccionesDieteticas.length > 0 ? (
                                  <Group gap="xs" wrap="wrap">
                                    {datosSalud.restriccionesDieteticas.map((restriccion, index) => (
                                      <Badge 
                                        key={index} 
                                        color="blue" 
                                        variant="light" 
                                        size="sm"
                                      >
                                        {restriccion}
                                      </Badge>
                                    ))}
                                  </Group>
                                ) : (
                                  <Text size="sm" c={theme.colors.gray[5]}>
                                    Ninguna restricción
                                  </Text>
                                )}
                              </Stack>
                              
                              <Stack gap="xs">
                                <Text size="sm" fw={500} c={theme.colors.gray[7]}>
                                  Alergias e intolerancias:
                                </Text>
                                {datosSalud.alergiasIntolerancias.length > 0 ? (
                                  <Group gap="xs" wrap="wrap">
                                    {datosSalud.alergiasIntolerancias.map((alergia, index) => (
                                      <Badge 
                                        key={index} 
                                        color="red" 
                                        variant="light" 
                                        size="sm"
                                      >
                                        {alergia}
                                      </Badge>
                                    ))}
                                  </Group>
                                ) : (
                                  <Text size="sm" c={theme.colors.gray[5]}>
                                    Ninguna alergia
                                  </Text>
                                )}
                              </Stack>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid.Col>

                      {/* Horarios de Comidas */}
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder style={{ height: '100%' }}>
                          <Stack gap="md">
                            <Group gap="xs">
                              <IconClock size={20} color={theme.colors.green[6]} />
                              <Text size="lg" fw={600} c={theme.colors.gray[8]}>
                                Horarios de Comidas
                              </Text>
                            </Group>
                            
                            <Stack gap="xs">
                              {datosSalud.horariosComidas.map((horario, index) => (
                                <Group key={index} justify="space-between" p="xs" bg={theme.colors.gray[0]} style={{ borderRadius: theme.radius.sm }}>
                                  <Text size="sm" fw={500} c={theme.colors.gray[8]}>
                                    {horario.comida}
                                  </Text>
                                  <Text size="sm" c={theme.colors.gray[6]}>
                                    {horario.hora}
                                  </Text>
                                </Group>
                              ))}
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid.Col>
                    </Grid>
                  </Stack>
                ) : (
                  <Text c={theme.colors.gray[5]}>
                    No hay información de salud disponible.
                  </Text>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="activity">
                {datosActividad ? (
                  <Stack gap="lg">
                    <Title order={3} c={theme.colors.gray[8]}>
                      Información de Actividad Física
                    </Title>
                    
                    <Grid gutter="md">
                      {/* Nivel de Actividad */}
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder style={{ height: '100%' }}>
                          <Stack gap="md">
                            <Group gap="xs">
                              <IconActivity size={20} color={theme.colors.blue[6]} />
                              <Text size="lg" fw={600} c={theme.colors.gray[8]}>
                                Nivel de Actividad
                              </Text>
                            </Group>
                            
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" c={theme.colors.gray[6]}>
                                  <strong>Frecuencia:</strong>
                                </Text>
                                <Badge color="blue" variant="light" size="sm">
                                  {datosActividad.frecuenciaEjercicio}
                                </Badge>
                              </Group>
                              
                              <Stack gap="xs">
                                <Text size="sm" fw={500} c={theme.colors.gray[7]}>
                                  Tipos de ejercicio:
                                </Text>
                                <Group gap="xs" wrap="wrap">
                                  {datosActividad.tipoEjercicioPractica.map((tipo, index) => (
                                    <Badge 
                                      key={index} 
                                      color="cyan" 
                                      variant="light" 
                                      size="sm"
                                    >
                                      {tipo}
                                    </Badge>
                                  ))}
                                </Group>
                              </Stack>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid.Col>

                      {/* Objetivos y Preferencias */}
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder style={{ height: '100%' }}>
                          <Stack gap="md">
                            <Group gap="xs">
                              <IconTarget size={20} color={theme.colors.green[6]} />
                              <Text size="lg" fw={600} c={theme.colors.gray[8]}>
                                Objetivos y Preferencias
                              </Text>
                            </Group>
                            
                            <Stack gap="md">
                              <Stack gap="xs">
                                <Text size="sm" fw={500} c={theme.colors.gray[7]}>
                                  Objetivos principales:
                                </Text>
                                {datosActividad.objetivosPrincipales.map((objetivo, index) => (
                                  <Text key={index} size="sm" c={theme.colors.gray[8]}>
                                    • {objetivo}
                                  </Text>
                                ))}
                              </Stack>
                              
                              {datosActividad.preferenciasEjercicios.length > 0 && (
                                <Stack gap="xs">
                                  <Text size="sm" fw={500} c={theme.colors.gray[7]}>
                                    Preferencias de ejercicio:
                                  </Text>
                                  <Group gap="xs" wrap="wrap">
                                    {datosActividad.preferenciasEjercicios.map((preferencia, index) => (
                                      <Badge 
                                        key={index} 
                                        color="green" 
                                        variant="light" 
                                        size="sm"
                                      >
                                        {preferencia}
                                      </Badge>
                                    ))}
                                  </Group>
                                </Stack>
                              )}
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid.Col>

                      {/* Limitaciones Físicas */}
                      {datosActividad.limitacionesFisicas.length > 0 && (
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <Paper p="lg" radius="md" withBorder style={{ height: '100%' }}>
                            <Stack gap="md">
                              <Group gap="xs">
                                <IconAlertTriangle size={20} color={theme.colors.orange[6]} />
                                <Text size="lg" fw={600} c={theme.colors.gray[8]}>
                                  Limitaciones Físicas
                                </Text>
                              </Group>
                              
                              <Stack gap="xs">
                                {datosActividad.limitacionesFisicas.map((limitacion, index) => (
                                  <Badge 
                                    key={index} 
                                    color="orange" 
                                    variant="light" 
                                    size="sm"
                                    style={{ alignSelf: 'flex-start' }}
                                  >
                                    {limitacion}
                                  </Badge>
                                ))}
                              </Stack>
                            </Stack>
                          </Paper>
                        </Grid.Col>
                      )}

                      {/* Contacto de Emergencia */}
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder style={{ height: '100%' }}>
                          <Stack gap="md">
                            <Group gap="xs">
                              <IconPhone size={20} color={theme.colors.red[6]} />
                              <Text size="lg" fw={600} c={theme.colors.gray[8]}>
                                Contacto de Emergencia
                              </Text>
                            </Group>
                            
                            <Stack gap="xs">
                              <Text size="sm" c={theme.colors.gray[6]}>
                                <strong>Número de contacto:</strong>
                              </Text>
                              <Text size="sm" fw={500} c={theme.colors.gray[8]}>
                                {datosActividad.numeroContactoEmergencia}
                              </Text>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid.Col>
                    </Grid>
                  </Stack>
                ) : (
                  <Text c={theme.colors.gray[5]}>
                    No hay información de actividad física disponible.
                  </Text>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="settings">
                <Stack gap="lg">
                  <Title order={3}>
                    Configuración de la Cuenta
                  </Title>
                  
                  <Group gap="md">
                    <Button
                      variant="light"
                      color="nutroos-green"
                      leftSection={<IconEdit size={16} />}
                      onClick={handleEditProfile}
                    >
                      Editar Perfil
                    </Button>
                    
                    <Button
                      variant="light"
                      color="blue"
                      leftSection={<IconCamera size={16} />}
                      onClick={handleEditPhoto}
                    >
                      Cambiar Foto
                    </Button>
                  </Group>
                  
                  <Text size="sm" c="dimmed">
                    Aquí puedes gestionar la configuración de tu cuenta y perfil.
                  </Text>
                </Stack>
              </Tabs.Panel>
            </Box>
          </Tabs>
        </Paper>
      </Stack>

      {/* Modal de edición de perfil */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Perfil"
        size="lg"
        centered
      >
        <ProfileForm
          initialData={{
            fullName: profile.fullName,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            gender: profile.gender,
            birthDate: profile.birthDate,
            profilePicture: profile.profilePicture,
            workerType: profile.workerType,
            biography: profile.biography,
            availability: profile.availability
          }}
          onSubmit={handleProfileSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Modal de cambio de foto */}
      <Modal opened={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="Cambiar Foto de Perfil" size="sm" centered>
        <Stack gap="lg">
          <Alert icon={<IconAlertCircle size={16} />} title="Información" color="blue" variant="light">
            <Text size="sm">
              • Formatos: JPG, PNG, GIF<br/>
              • Tamaño máximo: 10MB<br/>
              • Se recomienda usar imágenes cuadradas
            </Text>
          </Alert>
          <input type="file" accept="image/*" disabled={isPhotoUploading} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handlePhotoSubmit(file);
            }
          }} style={{ width: '100%' }} />
          {isPhotoUploading && (
            <Alert icon={<IconAlertCircle size={16} />} title="Procesando imagen" color="blue" variant="light">
              <Text size="sm">Comprimiendo y subiendo la imagen... Por favor espera.</Text>
            </Alert>
          )}
          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={() => setIsPhotoModalOpen(false)} disabled={isPhotoUploading}>
              Cancelar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};
