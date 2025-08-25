import React, { useState, useEffect } from 'react';
import { ProfilePage as ProfilePageComponent } from '../components/organisms/ProfilePage';
import { UserProfile, DatosSaludYNutricion, DatosActividadFisica } from '../types/profile';

// Mock data para desarrollo - en producción esto vendría de la API
const mockProfile: UserProfile = {
  _id: '1',
  fullName: 'Juan Pérez García',
  email: 'juan.perez@example.com',
  phoneNumber: '+34 612 345 678',
  role: 'user',
  gender: 'Masculino',
  birthDate: new Date('1990-05-15'),
  profilePicture: null,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

const mockDatosSalud: DatosSaludYNutricion = {
  _id: '1',
  userId: '1',
  altura: 175,
  pesoActual: 75,
  objetivoPeso: 70,
  condicionesMedicas: ['Hipertensión leve'],
  restriccionesDieteticas: ['Sin gluten'],
  alergiasIntolerancias: ['Lactosa'],
  medicacionActual: ['Enalapril'],
  preferenciasAlimentarias: ['Vegetariano'],
  horariosComidas: [
    { comida: 'Desayuno', hora: '08:00' },
    { comida: 'Media mañana', hora: '11:00' },
    { comida: 'Almuerzo', hora: '14:00' },
    { comida: 'Merienda', hora: '17:00' },
    { comida: 'Cena', hora: '20:00' }
  ]
};

const mockDatosActividad: DatosActividadFisica = {
  _id: '1',
  userId: '1',
  frecuenciaEjercicio: 'Regular',
  tipoEjercicioPractica: ['Cardio', 'Musculación', 'Yoga'],
  objetivosPrincipales: ['Pérdida de peso', 'Salud general'],
  preferenciasEjercicios: ['Running', 'Pesas'],
  limitacionesFisicas: ['Lesión antigua en rodilla'],
  numeroContactoEmergencia: '+34 600 000 000'
};

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [datosSalud, setDatosSalud] = useState<DatosSaludYNutricion | undefined>(mockDatosSalud);
  const [datosActividad, setDatosActividad] = useState<DatosActividadFisica | undefined>(mockDatosActividad);

  // En producción, aquí se harían las llamadas a la API
  useEffect(() => {
    // fetchProfile();
    // fetchDatosSalud();
    // fetchDatosActividad();
  }, []);

  const handleUpdateProfile = async (data: any): Promise<void> => {
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Actualizar el estado local
    setProfile(prev => ({
      ...prev,
      ...data,
      updatedAt: new Date().toISOString()
    }));
    
    // En producción: await api.updateProfile(data);
  };

  const handleUpdatePhoto = async (file: File): Promise<void> => {
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Crear URL temporal para la imagen
    const imageUrl = URL.createObjectURL(file);
    
    // Actualizar el estado local
    setProfile(prev => ({
      ...prev,
      profilePicture: imageUrl,
      updatedAt: new Date().toISOString()
    }));
    
    // En producción: await api.uploadProfilePhoto(file);
  };

  return (
    <ProfilePageComponent
      profile={profile}
      datosSalud={datosSalud}
      datosActividad={datosActividad}
      onUpdateProfile={handleUpdateProfile}
      onUpdatePhoto={handleUpdatePhoto}
    />
  );
};

export default ProfilePage;
