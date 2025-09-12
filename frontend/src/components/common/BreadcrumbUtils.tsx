import React from 'react';
import { Group, Text, Badge, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconHome } from '@tabler/icons-react';
import type { BreadcrumbItem } from '../../types/trainingCommon';

// Utilidades para breadcrumbs
export const createBreadcrumbItems = (baseItems: BreadcrumbItem[], additionalItems: BreadcrumbItem[] = []): React.ReactNode[] => {
  const allItems = [
    ...baseItems.map(item => ({ ...item, icon: item.title === 'Inicio' ? <IconHome size={14} /> : undefined })),
    ...additionalItems
  ];

  return allItems.map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm" c="nutroos-green">
      {item.icon && (
        <Group gap={4}>
          {item.icon}
          <span>{item.title}</span>
        </Group>
      )}
      {!item.icon && item.title}
    </Anchor>
  ));
};

// Utilidades para renderizado de información de cliente
export const renderClientInfo = (clienteNombre?: string, clientId?: string | null): React.ReactNode => (
  <Group gap="xs">
    {clienteNombre ? (
      <>
        <Text c="dimmed">Para:</Text>
        <Text fw={600}>{clienteNombre}</Text>
        <Badge color="nutroos-green">Cliente</Badge>
      </>
    ) : clientId ? (
      <>
        <Text c="dimmed">Para cliente con ID:</Text>
        <Text fw={600}>{clientId}</Text>
        <Badge color="nutroos-green">Cliente</Badge>
      </>
    ) : (
      <Text c="dimmed">Plan de entrenamiento general</Text>
    )}
  </Group>
);
