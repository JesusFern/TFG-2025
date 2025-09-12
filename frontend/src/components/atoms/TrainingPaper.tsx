import React from 'react';
import { Paper } from '@mantine/core';

interface TrainingPaperProps {
  children: React.ReactNode;
  p?: string | number;
  mb?: string | number;
  withBorder?: boolean;
  radius?: string | number;
}

const TrainingPaper: React.FC<TrainingPaperProps> = ({
  children,
  p = "lg",
  mb = "md",
  withBorder = true,
  radius = "md"
}) => {
  return (
    <Paper 
      p={p}
      mb={mb}
      withBorder={withBorder}
      radius={radius}
      style={{ 
        backgroundColor: 'var(--app-paper-bg)', 
        borderColor: 'var(--app-border-color)' 
      }}
    >
      {children}
    </Paper>
  );
};

export default TrainingPaper;
