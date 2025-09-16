import React, { useState } from 'react';
import { Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import FormularioCrearReceta from '../components/forms/recetas/FormularioCrearReceta';
import RecetaPageHeader from '../components/molecules/RecetaPageHeader';
import StatusMessage from '../components/molecules/StatusMessage';

const CrearRecetaPage: React.FC = () => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success', texto: string } | null>(null);
  
  const handleRecetaCreada = () => {
    setMensaje({
      tipo: 'success',
      texto: 'Receta creada correctamente'
    });
    
    setTimeout(() => {
      navigate('/mis-recetas');
    }, 2000);
  };

  const handleError = (error: Error) => {
    setMensaje({
      tipo: 'error',
      texto: error.message || 'Error al crear la receta'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMensaje(null), 5000);
  };

  return (
    <Container size="md" py="xl">
      <RecetaPageHeader 
        title="Crear Nueva Receta"
        subtitle="Crea una nueva receta con ingredientes, pasos de preparación e información nutricional"
      />
      
      <StatusMessage 
        mensaje={mensaje} 
        onClose={() => setMensaje(null)}
      />
        
      <FormularioCrearReceta 
        onSuccess={handleRecetaCreada}
        onError={handleError}
      />
    </Container>
  );
};

export default CrearRecetaPage;
