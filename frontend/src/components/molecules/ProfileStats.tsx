import React from 'react';
import { Group, Paper, Stack, Text, useMantineTheme } from '@mantine/core';
import { 
  IconUser, 
  IconCalendar, 
  IconTarget, 
  IconTrophy,
  IconHeart,
  IconActivity
} from '@tabler/icons-react';
import { UserProfile, DatosSaludYNutricion, DatosActividadFisica } from '../../types/profile';

interface ProfileStatsProps {
  profile: UserProfile;
  datosSalud?: DatosSaludYNutricion;
  datosActividad?: DatosActividadFisica;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ 
  profile, 
  datosSalud, 
  datosActividad 
}) => {
  const theme = useMantineTheme();

  const getAge = (birthDate?: Date) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = () => {
    if (!datosSalud?.altura || !datosSalud?.pesoActual) return null;
    const heightInMeters = datosSalud.altura / 100;
    const bmi = datosSalud.pesoActual / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: 'blue' };
    if (bmi < 25) return { category: 'Peso normal', color: 'nutroos-green' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'yellow' };
    return { category: 'Obesidad', color: 'red' };
  };

  const stats = [
    {
      icon: IconUser,
      label: 'Edad',
      value: getAge(profile.birthDate) ? `${getAge(profile.birthDate)} años` : 'No especificada',
      color: 'blue'
    },
    {
      icon: IconCalendar,
      label: 'Miembro desde',
      value: new Date(profile.createdAt).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long' 
      }),
      color: 'nutroos-green'
    },
    {
      icon: IconTarget,
      label: 'Objetivo de peso',
      value: datosSalud?.objetivoPeso ? `${datosSalud.objetivoPeso} kg` : 'No especificado',
      color: 'orange'
    },
    {
      icon: IconTrophy,
      label: 'Nivel de actividad',
      value: datosActividad?.frecuenciaEjercicio || 'No especificado',
      color: 'purple'
    }
  ];

  return (
    <Stack gap="lg">
      {/* Main Stats */}
      <Group gap="md" grow>
        {stats.map((stat, index) => (
          <Paper
            key={index}
            p="md"
            radius="md"
            withBorder
            style={{
              backgroundColor: theme.colors.gray[0],
              borderColor: theme.colors.gray[3]
            }}
          >
            <Group gap="sm" align="center">
              <stat.icon 
                size={24} 
                color={theme.colors[stat.color as keyof typeof theme.colors]?.[6] || theme.colors.gray[6]} 
              />
              <Stack gap={4}>
                <Text size="xs" c={theme.colors.gray[6]} fw={500}>
                  {stat.label}
                </Text>
                <Text size="sm" fw={600} c={theme.colors.gray[8]}>
                  {stat.value}
                </Text>
              </Stack>
            </Group>
          </Paper>
        ))}
      </Group>

      {/* Health Metrics */}
      {datosSalud && (
        <Paper p="lg" radius="md" withBorder>
          <Text size="lg" fw={600} c={theme.colors.gray[8]} mb="md">
            <IconHeart size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Métricas de Salud
          </Text>
          
          <Group gap="xl">
            <Stack gap="xs">
              <Text size="sm" c={theme.colors.gray[6]}>
                <strong>Altura:</strong> {datosSalud.altura} cm
              </Text>
              <Text size="sm" c={theme.colors.gray[6]}>
                <strong>Peso actual:</strong> {datosSalud.pesoActual} kg
              </Text>
              <Text size="sm" c={theme.colors.gray[6]}>
                <strong>Objetivo:</strong> {datosSalud.objetivoPeso} kg
              </Text>
            </Stack>
            
            {calculateBMI() && (
              <Stack gap="xs">
                <Text size="sm" c={theme.colors.gray[6]}>
                  <strong>IMC:</strong> {calculateBMI()}
                </Text>
                <Text 
                  size="sm" 
                  c={theme.colors[getBMICategory(Number(calculateBMI())).color as keyof typeof theme.colors]?.[6]}
                  fw={500}
                >
                  {getBMICategory(Number(calculateBMI())).category}
                </Text>
              </Stack>
            )}
          </Group>
        </Paper>
      )}

      {/* Activity Metrics */}
      {datosActividad && (
        <Paper p="lg" radius="md" withBorder>
          <Text size="lg" fw={600} c={theme.colors.gray[8]} mb="md">
            <IconActivity size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Métricas de Actividad
          </Text>
          
          <Group gap="xl">
            <Stack gap="xs">
              <Text size="sm" c={theme.colors.gray[6]}>
                <strong>Frecuencia:</strong> {datosActividad.frecuenciaEjercicio}
              </Text>
              <Text size="sm" c={theme.colors.gray[6]}>
                <strong>Tipos de ejercicio:</strong> {datosActividad.tipoEjercicioPractica.join(', ')}
              </Text>
              <Text size="sm" c={theme.colors.gray[6]}>
                <strong>Objetivos:</strong> {datosActividad.objetivosPrincipales.join(', ')}
              </Text>
            </Stack>
          </Group>
        </Paper>
      )}
    </Stack>
  );
};
