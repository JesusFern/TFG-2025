import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProfilePage as ProfilePageComponent } from '../components/organisms/ProfilePage';
import { DatosSaludYNutricion, DatosActividadFisica, ProfileFormData, UserProfile } from '../types/profile';
import { Container, Text, Stack, Alert, Loader, Center } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

const ProfilePage: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [datosSalud, setDatosSalud] = useState<DatosSaludYNutricion | null>(null);
  const [datosActividad, setDatosActividad] = useState<DatosActividadFisica | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  useEffect(() => {
    if (user && !hasLoadedData) {
      fetchUserData();
    }
  }, [user, hasLoadedData]);

  const fetchUserData = async () => {
    if (!token || !user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        
        const hasChanges = JSON.stringify(userData) !== JSON.stringify(user);
        if (hasChanges) {
          updateUser(userData);
        }
        
        if (userData.datosSaludYNutricion) {
          setDatosSalud(userData.datosSaludYNutricion);
        }
        if (userData.datosActividadFisica) {
          setDatosActividad(userData.datosActividadFisica);
        }
        
        setHasLoadedData(true);
      } else {
        setError('Error al cargar los datos del perfil');
      }
    } catch {
      setError('Error de conexión al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (data: ProfileFormData): Promise<void> => {
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        updateUser(result.user);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el perfil');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleUpdatePhoto = async (file: File): Promise<void> => {
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 10MB permitido.`);
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Solo se permiten archivos de imagen.');
    }

    try {
      const compressionSettings = getCompressionSettings(file.size);
      const compressedImage = await compressImage(file, compressionSettings);
      
      const response = await fetch('/api/users/me/photo', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePicture: compressedImage }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (!user) {
          throw new Error('Usuario no encontrado');
        }
        
        const updatedUser: UserProfile = {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          gender: user.gender,
          birthDate: user.birthDate,
          workerType: user.workerType,
          biography: user.biography,
          availability: user.availability,
          satisfactionRating: user.satisfactionRating,
          datosSaludYNutricion: user.datosSaludYNutricion,
          datosActividadFisica: user.datosActividadFisica,
          profilePicture: result.user.profilePicture
        };
        updateUser(updatedUser);
      } else {
        let errorMessage = 'Error al actualizar la foto';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          switch (response.status) {
            case 413:
              errorMessage = 'El archivo es demasiado grande para el servidor. Intenta con una imagen más pequeña.';
              break;
            case 500:
              errorMessage = 'Error interno del servidor. El problema puede ser:\n• Formato de imagen no soportado\n• Tamaño de archivo excesivo\n• Problema temporal del servidor\n\nIntenta con una imagen diferente o más pequeña.';
              break;
            case 400:
              errorMessage = 'Formato de imagen no válido. Usa JPG, PNG o GIF.';
              break;
            default:
              errorMessage = `Error del servidor (${response.status}). Intenta nuevamente.`;
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const getCompressionSettings = (fileSize: number) => {
    if (fileSize > 8 * 1024 * 1024) {
      // Archivos muy grandes: compresión agresiva
      return { quality: 0.5, maxDimension: 600, format: 'image/jpeg' };
    } else if (fileSize > 5 * 1024 * 1024) {
      // Archivos grandes: compresión media
      return { quality: 0.6, maxDimension: 700, format: 'image/jpeg' };
    } else if (fileSize > 2 * 1024 * 1024) {
      // Archivos medianos: compresión ligera
      return { quality: 0.7, maxDimension: 800, format: 'image/jpeg' };
    } else {
      // Archivos pequeños: mínima compresión
      return { quality: 0.8, maxDimension: 900, format: 'image/jpeg' };
    }
  };

  const compressImage = (file: File, settings: { quality: number; maxDimension: number; format: string }): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const { maxDimension, quality, format } = settings;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        const compressedDataUrl = canvas.toDataURL(format, quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Error al procesar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  };

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Cargando perfil...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
        >
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="No autenticado"
          color="red"
          variant="light"
        >
          <Text>Debes iniciar sesión para ver tu perfil.</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <ProfilePageComponent
      profile={user}
      datosSalud={datosSalud || undefined}
      datosActividad={datosActividad || undefined}
      onUpdateProfile={handleUpdateProfile}
      onUpdatePhoto={handleUpdatePhoto}
    />
  );
};

export default ProfilePage;
