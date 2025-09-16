import React, { useState } from 'react';
import { 
  Container, 
  Alert, 
  Center,
  Loader,
  Stack
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import FormularioCrearReceta from '../components/forms/recetas/FormularioCrearReceta';
import { useReceta } from '../hooks/useReceta';
import RecetaPageHeader from '../components/molecules/RecetaPageHeader';
import StatusMessage from '../components/molecules/StatusMessage';
import { IconAlertCircle } from '@tabler/icons-react';

const EditarRecetaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { receta, loading, error } = useReceta(id);
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success', texto: string } | null>(null);

  const handleRecetaActualizada = () => {
    setMensaje({
      tipo: 'success',
      texto: 'Receta actualizada correctamente'
    });
    
    // Redirigir después de un breve delay
    setTimeout(() => {
      navigate('/mis-recetas');
    }, 2000);
  };

  const handleError = (error: Error) => {
    setMensaje({
      tipo: 'error',
      texto: error.message || 'Error al actualizar la receta'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMensaje(null), 5000);
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center style={{ height: '50vh' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" color="nutroos-green" />
            <p>Cargando receta...</p>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error || !receta) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
          mb="md"
        >
          {error || 'Receta no encontrada'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <RecetaPageHeader 
        title="Editar Receta"
        subtitle={`Modifica los datos de la receta "${receta?.nombreReceta || ''}"`}
      />
      
      <StatusMessage 
        mensaje={mensaje} 
        onClose={() => setMensaje(null)}
      />
        
      <FormularioCrearReceta 
        onSuccess={handleRecetaActualizada}
        onError={handleError}
        modoEdicion={true}
        recetaInicial={receta}
      />
    </Container>
  );
};

export default EditarRecetaPage;

