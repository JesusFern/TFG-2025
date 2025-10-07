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
  IconStar,
  IconUsers,
  IconLock
} from '@tabler/icons-react';
import { ProfileHeader } from '../molecules/ProfileHeader';
import { ProfileStats } from '../molecules/ProfileStats';
import { ProfileForm } from '../molecules/ProfileForm';
import ModalEditHealthData from '../molecules/ModalEditHealthData';
import ModalEditActivityData from '../molecules/ModalEditActivityData';
import ModalEditPhoto from '../molecules/ModalEditPhoto';
import ModalChangePassword from '../molecules/ModalChangePassword';
import WorkerRatingsTab from '../molecules/WorkerRatingsTab';
import WorkerClientsTab from '../molecules/WorkerClientsTab';
import { UserProfile, DatosSaludYNutricion, DatosActividadFisica, ProfileFormData } from '../../types/profile';

interface ProfilePageProps {
  profile: UserProfile;
  datosSalud?: DatosSaludYNutricion;
  datosActividad?: DatosActividadFisica;
  onUpdateProfile: (data: ProfileFormData) => Promise<void>;
  onUpdatePhoto: (file: File) => Promise<void>;
  viewingOtherProfile?: boolean;
  currentUserRole?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  datosSalud,
  datosActividad,
  onUpdateProfile,
  onUpdatePhoto,
  viewingOtherProfile = false,
  currentUserRole
}) => {
  const theme = useMantineTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Lógica para determinar qué pestañas mostrar
  const canViewHealthTab = () => {
    if (viewingOtherProfile) {
      // Solo mostrar si el perfil visto es de un usuario y el usuario actual es su trabajador
      return profile.role === 'user' && currentUserRole === 'worker';
    }
    return profile.role === 'user';
  };

  const canViewActivityTab = () => {
    if (viewingOtherProfile) {
      // Solo mostrar si el perfil visto es de un usuario y el usuario actual es su trabajador
      return profile.role === 'user' && currentUserRole === 'worker';
    }
    return profile.role === 'user';
  };

  const canViewRatingsTab = () => {
    if (viewingOtherProfile) {
      // Solo mostrar si el perfil visto es de un trabajador
      return profile.role === 'worker';
    }
    return profile.role === 'worker';
  };

  const canViewClientsTab = () => {
    if (viewingOtherProfile) {
      // No mostrar pestaña de clientes cuando se ve perfil de otro trabajador
      return false;
    }
    return profile.role === 'worker';
  };

  const canViewSettingsTab = () => {
    // Solo mostrar configuración en el perfil propio
    return !viewingOtherProfile;
  };
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

  const handleEditHealthData = () => {
    setIsHealthModalOpen(true);
  };

  const handleEditActivityData = () => {
    setIsActivityModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handleSaveHealthData = async (data: {
    altura: number;
    pesoActual: number;
    objetivoPeso: number;
    condicionesMedicas: string[];
    restriccionesDieteticas: string[];
    alergiasIntolerancias: string[];
    medicacionActual: string[];
    preferenciasAlimentarias: string[];
    horariosComidas: Array<{ comida: string; hora: string; }>;
  }) => {
    try {
      setIsLoading(true);
      
      // Importar el servicio dinámicamente para evitar problemas de importación circular
      const { profileService } = await import('../../services/profileService');
      
      const response = await profileService.updateHealthData(data);
      
      setAlert({
        type: 'success',
        title: '¡Datos de salud actualizados!',
        message: response.message || 'Tu información de salud se ha actualizado correctamente'
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error al guardar los datos de salud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveActivityData = async (data: {
    frecuenciaEjercicio: string;
    tipoEjercicioPractica: string[];
    objetivosPrincipales: string[];
    preferenciasEjercicios: string[];
    limitacionesFisicas: string[];
  }) => {
    try {
      setIsLoading(true);
      
      // Importar el servicio dinámicamente para evitar problemas de importación circular
      const { profileService } = await import('../../services/profileService');
      
      const response = await profileService.updateActivityData(data);
      
      setAlert({
        type: 'success',
        title: '¡Datos de actividad actualizados!',
        message: response.message || 'Tu información de actividad física se ha actualizado correctamente'
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error al guardar los datos de actividad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      
      // Importar el servicio dinámicamente
      const { profileService } = await import('../../services/profileService');
      
      const response = await profileService.changePassword(currentPassword, newPassword);
      
      setIsPasswordModalOpen(false);
      
      setAlert({
        type: 'success',
        title: '¡Contraseña actualizada!',
        message: response.message || 'Tu contraseña se ha cambiado correctamente'
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
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
      throw error; // Re-lanzar el error para que el modal lo maneje
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
            canEdit={!viewingOtherProfile}
          />
        </Paper>

        {profile.role !== 'admin' && (
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
              {canViewHealthTab() && (
                <Tabs.Tab 
                  value="health" 
                  leftSection={<IconHeart size={16} />}
                  fw={500}
                >
                  Salud
                </Tabs.Tab>
              )}
              {canViewActivityTab() && (
                <Tabs.Tab 
                  value="activity" 
                  leftSection={<IconActivity size={16} />}
                  fw={500}
                >
                  Actividad
                </Tabs.Tab>
              )}
              {canViewRatingsTab() && (
                <Tabs.Tab 
                  value="ratings" 
                  leftSection={<IconStar size={16} />}
                  fw={500}
                >
                  Valoraciones
                </Tabs.Tab>
              )}
              {canViewClientsTab() && (
                <Tabs.Tab 
                  value="clients" 
                  leftSection={<IconUsers size={16} />}
                  fw={500}
                >
                  Clientes
                </Tabs.Tab>
              )}
              {canViewSettingsTab() && (
                <Tabs.Tab 
                  value="settings" 
                  leftSection={<IconSettings size={16} />}
                  fw={500}
                >
                  Configuración
                </Tabs.Tab>
              )}
            </Tabs.List>

            <Box pt="lg">
              <Tabs.Panel value="overview">
                <ProfileStats
                  profile={profile}
                  datosSalud={datosSalud}
                  datosActividad={datosActividad}
                />
              </Tabs.Panel>

              {canViewHealthTab() && (
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

                      {/* Condiciones Médicas y Medicación */}
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder style={{ height: '100%' }}>
                          <Stack gap="md">
                            <Group gap="xs">
                              <IconAlertCircle size={20} color={theme.colors.orange[6]} />
                              <Text size="lg" fw={600} c={theme.colors.gray[8]}>
                                Condiciones Médicas
                              </Text>
                            </Group>
                            
                            <Stack gap="md">
                              <Stack gap="xs">
                                <Text size="sm" fw={500} c={theme.colors.gray[7]}>
                                  Condiciones:
                                </Text>
                                {datosSalud.condicionesMedicas.length > 0 ? (
                                  <Group gap="xs" wrap="wrap">
                                    {datosSalud.condicionesMedicas.map((condicion, index) => (
                                      <Badge 
                                        key={index} 
                                        color="orange" 
                                        variant="light" 
                                        size="sm"
                                      >
                                        {condicion}
                                      </Badge>
                                    ))}
                                  </Group>
                                ) : (
                                  <Text size="sm" c={theme.colors.gray[5]}>
                                    Ninguna condición médica
                                  </Text>
                                )}
                              </Stack>

                              <Stack gap="xs">
                                <Text size="sm" fw={500} c={theme.colors.gray[7]}>
                                  Medicación actual:
                                </Text>
                                {datosSalud.medicacionActual && datosSalud.medicacionActual.length > 0 ? (
                                  <Group gap="xs" wrap="wrap">
                                    {datosSalud.medicacionActual.map((medicamento, index) => (
                                      <Badge 
                                        key={index} 
                                        color="teal" 
                                        variant="light" 
                                        size="sm"
                                      >
                                        {medicamento}
                                      </Badge>
                                    ))}
                                  </Group>
                                ) : (
                                  <Text size="sm" c={theme.colors.gray[5]}>
                                    Ninguna medicación
                                  </Text>
                                )}
                              </Stack>
                            </Stack>
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
              )}

              {canViewActivityTab() && (
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
                    </Grid>
                  </Stack>
                ) : (
                  <Text c={theme.colors.gray[5]}>
                    No hay información de actividad física disponible.
                  </Text>
                )}
              </Tabs.Panel>
              )}

              {/* Paneles específicos para trabajadores */}
              {canViewRatingsTab() && (
                <Tabs.Panel value="ratings">
                  <WorkerRatingsTab workerId={profile._id} />
                </Tabs.Panel>
              )}
              {canViewClientsTab() && (
                <Tabs.Panel value="clients">
                  <WorkerClientsTab workerId={profile._id} />
                </Tabs.Panel>
              )}

              {canViewSettingsTab() && (
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
                    
                    {/* Botón de cambiar contraseña solo para usuarios */}
                    {profile.role === 'user' && (
                      <Button
                        variant="light"
                        color="violet"
                        leftSection={<IconLock size={16} />}
                        onClick={handleChangePassword}
                      >
                        Cambiar Contraseña
                      </Button>
                    )}
                    
                    {/* Botones solo para usuarios */}
                    {profile.role === 'user' && (
                      <>
                        <Button
                          variant="light"
                          color="red"
                          leftSection={<IconHeart size={16} />}
                          onClick={handleEditHealthData}
                        >
                          Editar Datos de Salud
                        </Button>
                        
                        <Button
                          variant="light"
                          color="orange"
                          leftSection={<IconActivity size={16} />}
                          onClick={handleEditActivityData}
                        >
                          Editar Datos de Actividad
                        </Button>
                      </>
                    )}
                  </Group>
                  
                  <Text size="sm" c="dimmed">
                    Aquí puedes gestionar la configuración de tu cuenta y perfil.
                  </Text>
                </Stack>
              </Tabs.Panel>
              )}
            </Box>
          </Tabs>
        </Paper>
        )}
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
          userRole={profile.role}
        />
      </Modal>

      {/* Modal de cambio de foto */}
      <ModalEditPhoto
        opened={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSave={handlePhotoSubmit}
        currentPhotoUrl={profile.profilePicture}
        userName={profile.fullName}
      />

      {/* Modal de edición de datos de salud */}
      <ModalEditHealthData
        opened={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        initialData={datosSalud}
        onSave={handleSaveHealthData}
      />

      {/* Modal de edición de datos de actividad */}
      <ModalEditActivityData
        opened={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        initialData={datosActividad}
        onSave={handleSaveActivityData}
      />

      {/* Modal de cambio de contraseña */}
      <ModalChangePassword
        opened={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handleSavePassword}
      />
    </Container>
  );
};
