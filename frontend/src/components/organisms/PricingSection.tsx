import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  SimpleGrid, 
  Group, 
  SegmentedControl, 
  Button,
  Center,
  Loader
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { PricingCard } from '../molecules/PricingCard';
import { getPlansWithUserStatus, SuscriptionPlan } from '../../services/suscriptionPlanService';
import { useAuth } from '../../hooks/useAuth';

export const PricingSection: React.FC = () => {
  const [frecuenciaPago, setFrecuenciaPago] = useState<'mensual' | 'trimestral' | 'anual'>('mensual');
  const [planes, setPlanes] = useState<SuscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlanes = async () => {
      setIsLoading(true);
      try {
        console.log('Intentando obtener planes del backend...');
        const response = await getPlansWithUserStatus();
        
        if (response && response.success && response.data.plans && response.data.plans.length > 0) {
          // Procesar los planes para mostrar los beneficios de la API
          const planesConBeneficios = response.data.plans.map(plan => ({
            ...plan,
            beneficios: plan.beneficios || []
          }));
          
          console.log('Planes obtenidos de la API:', planesConBeneficios);
          setPlanes(planesConBeneficios);
        } else {
          console.warn('No se obtuvieron planes de la API');
          setPlanes([]);
        }
      } catch (error) {
        console.error('Error al obtener los planes:', error);
        setPlanes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanes();
  }, []);

  const handleSelectPlan = (planId: string) => {
    // Encontrar el plan seleccionado
    const planSeleccionado = planes.find(plan => plan._id === planId);
    
    if (!planSeleccionado) return;
    
    // Si es plan gratuito, redirigir a registro si no está autenticado
    if (planSeleccionado.tipoPrecio === 'Gratuito') {
      if (!isAuthenticated) {
        console.log('Redirigiendo a registro para plan gratuito');
        navigate('/register');
      } else {
        alert('Ya tienes acceso a las funciones gratuitas');
      }
      return;
    }
    
    // Si el usuario ya tiene este plan, mostrar un mensaje
    if (planSeleccionado.isUserSubscribed) {
      alert('Ya estás suscrito a este plan');
      return;
    }
    
    // Si el usuario no está autenticado, redirigir a login
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          redirectTo: '/planes-suscripcion',
          selectedPlanId: planId,
          frecuenciaPago 
        } 
      });
      return;
    }
    
    // Si es un plan de pago, redirigir al proceso de pago
    navigate('/checkout', { 
      state: { 
        planId, 
        frecuenciaPago 
      } 
    });
  };

  return (
    <Container size="lg" py={80} id="precios">
      <Title ta="center" mb="lg" order={2}>
        Elige el plan que mejor se adapte a ti
      </Title>
      
      <Text c="dimmed" ta="center" mb={50}>
        Ofrecemos diferentes planes para adaptarnos a tus necesidades. Todos incluyen funcionalidades para ayudarte a alcanzar tus objetivos de salud y bienestar.
      </Text>
      
      <Group justify="center" mb={50}>
        <SegmentedControl
          value={frecuenciaPago}
          onChange={(value) => setFrecuenciaPago(value as 'mensual' | 'trimestral' | 'anual')}
          data={[
            { label: 'Mensual', value: 'mensual' },
            { label: 'Trimestral', value: 'trimestral' },
            { label: 'Anual', value: 'anual' }
          ]}
        />
      </Group>
      
      {isLoading ? (
        <Center my={50}>
          <Loader size="lg" />
        </Center>
      ) : planes.length > 0 ? (
        <SimpleGrid
          cols={{ base: 1, sm: 1, md: 2, lg: 3 }}
          spacing="xl"
        >
          {planes.map((plan) => (
            <PricingCard
              key={plan._id}
              plan={{
                id: plan._id,
                nombre: plan.nombre,
                descripcion: plan.descripcion,
                tipoPrecio: plan.tipoPrecio,
                tipoPlan: plan.tipoPlan,
                precioMensual: plan.precioMensual,
                precioTrimestral: plan.precioTrimestral,
                precioAnual: plan.precioAnual,
                beneficios: plan.beneficios || []
              }}
              frecuenciaPago={frecuenciaPago}
              destacado={plan.tipoPrecio === 'Pro'} // Destacamos el plan Pro
              onSelectPlan={handleSelectPlan}
              isUserSubscribed={plan.isUserSubscribed}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center my={50}>
          <Text size="lg" fw={500} c="dimmed">
            No se pudieron cargar los planes de suscripción. Por favor, intenta más tarde.
          </Text>
        </Center>
      )}
      
      <Center mt={50}>
        <Button 
          component={Link} 
          to="/planes-suscripcion" 
          variant="outline" 
          size="lg"
        >
          Ver todos los planes
        </Button>
      </Center>
    </Container>
  );
};
