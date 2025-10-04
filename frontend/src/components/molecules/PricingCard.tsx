import React from 'react';
import { Card, Text, Badge, Button, Group, Stack, Title, List, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

interface PricingPlan {
  id: string;
  nombre: string;
  descripcion: string;
  tipoPrecio: 'Gratuito' | 'Básico' | 'Pro';
  tipoPlan: string | null;
  precioMensual: number;
  precioTrimestral: number;
  precioAnual: number;
  beneficios: string[];
}

interface PricingCardProps {
  plan: PricingPlan;
  frecuenciaPago?: 'mensual' | 'trimestral' | 'anual';
  destacado?: boolean;
  onSelectPlan: (planId: string) => void;
  isUserSubscribed?: boolean;
  isSubmitting?: boolean;
  hasActiveSubscription?: boolean;
  currentPlan?: PricingPlan | null;
}

export const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  frecuenciaPago = 'mensual', 
  destacado = false,
  onSelectPlan,
  isUserSubscribed = false,
  isSubmitting = false,
  hasActiveSubscription = false,
  currentPlan = null
}) => {
  const getPrecio = () => {
    switch (frecuenciaPago) {
      case 'mensual':
        return plan.precioMensual;
      case 'trimestral':
        return plan.precioTrimestral;
      case 'anual':
        return plan.precioAnual;
      default:
        return plan.precioMensual;
    }
  };

  const precio = getPrecio();
  
  
  
  // Verificar si el usuario ya tiene un plan del mismo tipo
  const tienePlanDelMismoTipo = currentPlan && 
                               currentPlan.tipoPlan !== 'Nutrición y entrenamiento personal' && 
                               plan.tipoPlan === currentPlan.tipoPlan;

  
  const getPeriodoTexto = () => {
    switch (frecuenciaPago) {
      case 'mensual':
        return '/mes';
      case 'trimestral':
        return '/trimestre';
      case 'anual':
        return '/año';
      default:
        return '/mes';
    }
  };

  const getColor = () => {
    switch (plan.tipoPrecio) {
      case 'Gratuito':
        return 'gray';
      case 'Básico':
        return 'nutroos-green';
      case 'Pro':
        return 'nutroos-green';
      default:
        return 'nutroos-green';
    }
  };

  const beneficios = Array.isArray(plan.beneficios) && plan.beneficios.length > 0 
    ? plan.beneficios 
    : plan.descripcion.split('. ').filter(item => item.trim() !== '');
    
  const nombrePlan = plan.nombre.replace(/Plan (Gratuito|Básico|Pro) -? ?(.*)/, (_, tipo, subtipo) => {
    return subtipo ? `Plan ${tipo}` : plan.nombre;
  });

  const getButtonVariant = () => {
    if (isUserSubscribed) return 'light';
    if (plan.tipoPrecio === 'Gratuito') return 'outline';
    if (tienePlanDelMismoTipo) return 'outline';
    return 'filled';
  };

  const getButtonText = () => {
    if (isUserSubscribed) return 'Tu plan actual';
    if (plan.tipoPrecio === 'Gratuito') return 'Acceder gratis';
    if (tienePlanDelMismoTipo) return 'Ya tienes este tipo de plan';
    
    // Si el usuario tiene una suscripción activa, mostrar "Cambiar mi plan de suscripción"
    if (currentPlan) {
      return 'Cambiar mi plan de suscripción';
    }
    
    return 'Suscribirse';
  };

  return (
    <Card 
      shadow="sm" 
      p="sm" 
      radius="md" 
      withBorder
      style={{ 
        width: '100%',
        maxWidth: '300px',
        height: '480px',
        display: 'flex',
        flexDirection: 'column',
        transform: destacado ? 'scale(1.02)' : 'scale(1)',
        border: isUserSubscribed 
          ? '1px solid var(--mantine-color-dimmed)' 
          : destacado 
            ? `2px solid var(--mantine-color-${getColor()}-6)` 
            : undefined,
        backgroundColor: isUserSubscribed 
          ? 'var(--mantine-color-body)' 
          : undefined,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = destacado ? 'scale(1.05)' : 'scale(1.02)';
        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = destacado ? 'scale(1.02)' : 'scale(1)';
        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
      }}
    >
      <Stack gap="xs" style={{ height: '100%' }}>
        {isUserSubscribed && (
          <Badge color="green" variant="light" size="sm" style={{ alignSelf: 'center' }}>
            ✓ Tu plan actual
          </Badge>
        )}
        
        <Title order={4} fw={700} c={getColor()} ta="center" size="md">
          {nombrePlan}
        </Title>
        
        <Group justify="center" align="end" wrap="nowrap">
          <div style={{ textAlign: 'center' }}>
            <Text size="lg" fw={700}>
              {plan.tipoPrecio === 'Gratuito' ? 'Gratis' : `${precio}€`}
            </Text>
            {plan.tipoPrecio !== 'Gratuito' && (
              <Text size="xs" c="dimmed">
                {getPeriodoTexto()}
              </Text>
            )}
          </div>
        </Group>
        
        <Text size="sm" c="dimmed" ta="center" lineClamp={2} style={{ wordBreak: 'break-word' }}>
          {plan.descripcion}
        </Text>
        
        <List
          size="sm"
          center
          icon={
            <ThemeIcon color={getColor()} size={16} radius="xl">
              <IconCheck size={10} stroke={1.5} />
            </ThemeIcon>
          }
          style={{ flex: 1, overflow: 'hidden' }}
        >
          {beneficios.map((beneficio) => (
            <List.Item key={beneficio} style={{ fontSize: '11px', lineHeight: '1.3', wordBreak: 'break-word' }}>
              {beneficio}
            </List.Item>
          ))}
        </List>
        


        {/* Mostrar botón siempre, pero deshabilitado si no puede suscribirse */}
        {!(plan.tipoPrecio === 'Gratuito' && hasActiveSubscription) && (
          <Button 
            fullWidth 
            color={tienePlanDelMismoTipo ? 'orange' : getColor()}
            onClick={() => onSelectPlan(plan.id)}
            variant={getButtonVariant()}
            disabled={isUserSubscribed || isSubmitting || !!tienePlanDelMismoTipo}
            loading={isSubmitting}
            size="sm"
            style={{ marginTop: 'auto' }}
          >
            {getButtonText()}
          </Button>
        )}
      </Stack>
    </Card>
  );
};