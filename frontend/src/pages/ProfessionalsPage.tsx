import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Stack,
  Loader,
  Center,
  Alert,
  Box,
  Button,
  Group,
  Badge
} from '@mantine/core';
import { IconInfoCircle, IconArrowLeft, IconCrown } from '@tabler/icons-react';
import { 
  getAvailableProfessionals, 
  ProfessionalResponse, 
  checkSubscriptionStatus, 
  getProfessionalsBySubscription
} from '../services/userService';
import Layout from '../components/layout/Layout';
import ProfessionalCard from '../components/molecules/ProfessionalCard';
import ProfessionalFilters from '../components/molecules/ProfessionalFilters';
import ProfessionalModal from '../components/molecules/ProfessionalModal';
import EmptyProfessionalsState from '../components/molecules/EmptyProfessionalsState';
import SubscriptionButton from '../components/molecules/SubscriptionButton';
import { useAuth } from '../hooks/useAuth';

const ProfessionalsPage: React.FC = () => {
  const [professionals, setProfessionals] = useState<ProfessionalResponse[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<ProfessionalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalResponse | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [showSubscriptionButton, setShowSubscriptionButton] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [viewingSubscriptionProfessionals, setViewingSubscriptionProfessionals] = useState(false);
  const [userFullPlanName, setUserFullPlanName] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAvailableProfessionals();
      setProfessionals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar profesionales');
    } finally {
      setLoading(false);
    }
  };

  const checkUserSubscriptionStatus = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'user') {
      return;
    }

    try {
      const status = await checkSubscriptionStatus();
      
      // Mostrar botón si el usuario tiene una suscripción activa (no gratuita)
      setShowSubscriptionButton(status.hasActiveSubscription);
      // Almacenar el nombre completo del plan
      setUserFullPlanName(status.fullPlanName);
    } catch (err) {
      console.error('Error al verificar estado de suscripción:', err);
      // No mostrar error al usuario, simplemente no mostrar el botón
      setShowSubscriptionButton(false);
      setUserFullPlanName(null);
    }
  }, [isAuthenticated, user]);

  const loadProfessionalsBySubscription = async () => {
    try {
      setLoadingSubscription(true);
      setError(null);
      const data = await getProfessionalsBySubscription();
      setProfessionals(data);
      setShowSubscriptionButton(false); // Ocultar el botón después de cargar
      setViewingSubscriptionProfessionals(true); // Indicar que estamos viendo profesionales filtrados
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar profesionales por suscripción');
    } finally {
      setLoadingSubscription(false);
    }
  };

  const filterProfessionals = useCallback(() => {
    let filtered = professionals;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(professional =>
        professional.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.workerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (professional.biography && professional.biography.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por tipo de trabajador
    if (selectedType) {
      filtered = filtered.filter(professional => professional.workerType === selectedType);
    }

    setFilteredProfessionals(filtered);
  }, [professionals, searchTerm, selectedType]);

  useEffect(() => {
    loadProfessionals();
    checkUserSubscriptionStatus();
  }, [checkUserSubscriptionStatus]);

  useEffect(() => {
    filterProfessionals();
  }, [filterProfessionals]);

  const handleProfessionalClick = (professional: ProfessionalResponse) => {
    setSelectedProfessional(professional);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setSelectedProfessional(null);
  };


  const handleRequestAssignment = (professional: ProfessionalResponse) => {
    console.log('Solicitud de asignación creada para:', professional.fullName);
    // Cerrar el modal después de crear la solicitud
    handleCloseModal();
    // Aquí podrías mostrar una notificación de éxito
  };


  const handleBackToAllProfessionals = async () => {
    setViewingSubscriptionProfessionals(false);
    await loadProfessionals();
    await checkUserSubscriptionStatus(); // Volver a comprobar el estado de suscripción
  };

  const workerTypes = Array.from(new Set(professionals.map(p => p.workerType)));

  if (loading) {
    return (
      <Layout>
        <Container size="lg" py="xl">
          <Center h={400}>
            <Stack align="center">
              <Loader size="lg" />
              <Text>Cargando profesionales...</Text>
            </Stack>
          </Center>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container size="lg" py="xl">
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Box>
            <Group justify="space-between" align="flex-start" mb="sm">
              <Box>
                <Title order={1}>
                  {viewingSubscriptionProfessionals ? 'Profesionales de tu Plan' : 'Profesionales Disponibles'}
                </Title>
                <Text c="dimmed" size="lg" mt="xs">
                  {viewingSubscriptionProfessionals 
                    ? 'Profesionales disponibles según tu plan de suscripción'
                    : 'Conoce a nuestros profesionales especializados en nutrición y entrenamiento personal'
                  }
                </Text>
              </Box>
              {viewingSubscriptionProfessionals && userFullPlanName && (
                <Badge 
                  leftSection={<IconCrown size={14} />}
                  color="nutroos-green"
                  variant="light"
                  size="lg"
                >
                  {userFullPlanName}
                </Badge>
              )}
            </Group>
            
            {viewingSubscriptionProfessionals && (
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleBackToAllProfessionals}
                size="sm"
                mb="md"
              >
                Ver todos los profesionales
              </Button>
            )}
          </Box>

          {/* Botón de suscripción */}
          {showSubscriptionButton && (
            <SubscriptionButton
              onClick={loadProfessionalsBySubscription}
              loading={loadingSubscription}
            />
          )}

          {/* Filtros */}
          <ProfessionalFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            workerTypes={workerTypes}
            totalCount={professionals.length}
            filteredCount={filteredProfessionals.length}
          />

          {/* Lista de profesionales */}
          {filteredProfessionals.length === 0 ? (
            <EmptyProfessionalsState hasFilters={!!(searchTerm || selectedType)} />
          ) : (
            <Grid>
              {filteredProfessionals.map((professional) => (
                <Grid.Col key={professional._id} span={{ base: 12, sm: 6, md: 4 }}>
                  <ProfessionalCard
                    professional={professional}
                    onClick={handleProfessionalClick}
                  />
                </Grid.Col>
              ))}
            </Grid>
          )}

          {/* Modal de detalles del profesional */}
          <ProfessionalModal
            opened={modalOpened}
            onClose={handleCloseModal}
            professional={selectedProfessional}
            onRequestAssignment={handleRequestAssignment}
          />
        </Stack>
      </Container>
    </Layout>
  );
};

export default ProfessionalsPage;
