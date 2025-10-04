import React from 'react';
import { Card, Text, Box, Paper } from '@mantine/core';
import { BarChart } from '@mantine/charts';

interface BarChartComponentProps {
  title: string;
  data: Array<{ tipo: string; cantidad: number }>;
  height?: number;
  emptyMessage?: string;
  tooltipLabel?: string;
  color?: string;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  title,
  data,
  height = 300,
  emptyMessage = "No hay datos disponibles",
  tooltipLabel = "ejercicios",
  color = "blue.6"
}) => {
  const filteredData = data.filter((item) => item.cantidad > 0);

  if (filteredData.length === 0) {
    return (
      <Card p="md" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">{title}</Text>
        <Text c="dimmed" ta="center">{emptyMessage}</Text>
      </Card>
    );
  }

  const chartData = filteredData.map((item) => ({
    tipo: item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1),
    cantidad: item.cantidad
  }));

  return (
    <Card p="md" radius="md" withBorder>
      <Text size="lg" fw={600} mb="md">{title}</Text>
      <Box h={height}>
        <BarChart
          h={height}
          data={chartData}
          dataKey="tipo"
          series={[{ name: 'cantidad', color }]}
          withLegend
          legendProps={{ verticalAlign: 'bottom' }}
          withTooltip
          tooltipProps={{
            content: ({ label, payload }) => (
              <Paper p="sm" withBorder>
                <Text size="sm" fw={500}>{label}</Text>
                <Text size="sm" c={color.split('.')[0]}>
                  {payload?.[0]?.value} {tooltipLabel}
                </Text>
              </Paper>
            ),
          }}
        />
      </Box>
    </Card>
  );
};

export default BarChartComponent;
