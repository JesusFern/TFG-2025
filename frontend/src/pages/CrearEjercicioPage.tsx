import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconHome, IconBarbell } from '@tabler/icons-react';
import GlobalNotificationOverlay from '../components/atoms/GlobalNotificationOverlay';
import TrainingPageLayout from '../components/atoms/TrainingPageLayout';
import FormularioCrearEjercicio from '../components/forms/training/FormularioCrearEjercicio';

const CrearEjercicioPage: React.FC = () => {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const handleEjercicioCreado = () => {
    setNotice({ message: 'Ejercicio creado correctamente', type: 'success' });
    navigate('/training/ejercicios');
  };

  const handleError = (error: Error) => {
    setNotice({
      message: error.message || 'Error al crear ejercicio',
      type: 'error'
    });
  };

  const breadcrumbs = [
    { title: 'Inicio', href: '/', icon: <IconHome size={14} /> },
    { title: 'Entrenamiento', href: '/training/planes' },
    { title: 'Crear ejercicio', href: '#' },
  ];

  return (
    <TrainingPageLayout
      breadcrumbs={breadcrumbs}
      title="Crear Nuevo Ejercicio"
      subtitle="Define los detalles del ejercicio"
      icon={<IconBarbell size={18} />}
    >
      {notice && (
        <GlobalNotificationOverlay
          message={notice.message}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}
        
      <FormularioCrearEjercicio 
        onSuccess={handleEjercicioCreado}
        onError={handleError}
      />
    </TrainingPageLayout>
  );
};

export default CrearEjercicioPage;


