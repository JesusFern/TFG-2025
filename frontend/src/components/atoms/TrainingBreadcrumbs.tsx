import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs, Anchor, Group } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

interface BreadcrumbItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface TrainingBreadcrumbsProps {
  items: BreadcrumbItem[];
}

const TrainingBreadcrumbs: React.FC<TrainingBreadcrumbsProps> = ({ items }) => {
  const breadcrumbItems = items.map((item, index) => (
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

  return (
    <Breadcrumbs separator={<IconChevronRight size={14} />}>
      {breadcrumbItems}
    </Breadcrumbs>
  );
};

export default TrainingBreadcrumbs;
