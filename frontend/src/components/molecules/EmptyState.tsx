import React from 'react';
import {
  Paper,
  Stack,
  Title,
  Text,
  Button
} from '@mantine/core';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  buttonIcon?: React.ReactNode;
  buttonColor?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  buttonIcon,
  buttonColor = "nutroos-green"
}) => {
  const isDark = useThemeDetection();
  const theme = useMantineTheme();

  return (
    <Paper
      p="xl"
      radius="md"
      withBorder
      bg={isDark ? "dark.7" : "white"}
      style={{
        borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
        textAlign: 'center'
      }}
    >
      <Stack align="center" gap="md">
        {icon}
        <Title order={3} c={isDark ? "gray.3" : "gray.6"}>
          {title}
        </Title>
        <Text c="dimmed" size="lg" maw={400}>
          {description}
        </Text>
        {buttonText && onButtonClick && (
          <Button
            variant="light"
            color={buttonColor}
            leftSection={buttonIcon}
            onClick={onButtonClick}
            mt="md"
          >
            {buttonText}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default EmptyState;
