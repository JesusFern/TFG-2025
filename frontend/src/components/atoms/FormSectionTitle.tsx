import { Title } from '@mantine/core';
import React from 'react';

type FormSectionTitleProps = {
  children: React.ReactNode;
  className?: string;
};

const FormSectionTitle: React.FC<FormSectionTitleProps> = ({ children, className }) => (
  <Title order={2} className={className}>
    {children}
  </Title>
);

export default FormSectionTitle;


