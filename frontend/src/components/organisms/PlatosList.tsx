import React from 'react';
import { Stack } from '@mantine/core';
import PlatoCard from './PlatoCard';
import EmptyPlatoCard from './EmptyPlatoCard';

interface PlatosListProps {
  platos: Array<{
    nombre?: string | null;
    receta?: string | null;
  }>;
  isDark: boolean;
  isMobile?: boolean;
  onVerReceta: (recetaId: string) => void;
}

const PlatosList: React.FC<PlatosListProps> = ({ platos, isDark, isMobile = false, onVerReceta }) => {
  const filteredPlatos = platos.filter(plato => plato.nombre !== null || plato.receta !== null);

  if (filteredPlatos.length === 0) {
    return <EmptyPlatoCard isDark={isDark} isMobile={isMobile} />;
  }

  return (
    <Stack gap="xs" mt="sm">
      {filteredPlatos.map((plato, platoIndex) => (
        <PlatoCard
          key={platoIndex}
          plato={plato}
          isDark={isDark}
          isMobile={isMobile}
          onVerReceta={onVerReceta}
        />
      ))}
    </Stack>
  );
};

export default PlatosList;
