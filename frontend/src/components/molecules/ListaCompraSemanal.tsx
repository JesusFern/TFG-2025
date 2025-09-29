import React, { useState, useEffect } from 'react';
import {
  Card,
  Text,
  Group,
  Badge,
  Stack,
  Grid,
  Button,
  Loader,
  Alert,
  Divider,
  Paper,
  Box,
  useMantineColorScheme
} from '@mantine/core';
import { IconShoppingCart, IconCalendar, IconAlertCircle, IconDownload } from '@tabler/icons-react';
import { listaCompraService, ListaCompraSemanal } from '../../services/listaCompraService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extender jsPDF para incluir lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

interface ListaCompraSemanalProps {
  dietaId: string;
  semana: number;
  onError?: (error: Error) => void;
}

const ListaCompraSemanalComponent: React.FC<ListaCompraSemanalProps> = ({
  dietaId,
  semana,
  onError
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [listaCompra, setListaCompra] = useState<ListaCompraSemanal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarListaCompra = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await listaCompraService.generarListaCompraSemana(dietaId, semana);
        setListaCompra(response.semana);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar la lista de compra';
        setError(errorMessage);
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setLoading(false);
      }
    };

    if (dietaId && semana) {
      cargarListaCompra();
    }
  }, [dietaId, semana, onError]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearPeso = (peso: number) => {
    return listaCompraService.formatearPeso(peso);
  };

  const generarPDF = () => {
    if (!listaCompra) return;

    const doc = new jsPDF();
    
    // Configuración de colores
    const primaryColor = [34, 197, 94]; // Verde nutroos
    const darkGray = [71, 85, 105];
    
    // Título principal centrado
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth('Lista de Compra');
    doc.text('Lista de Compra', (doc.internal.pageSize.width - titleWidth) / 2, 30);
    
    // Información de la semana centrada
    doc.setFontSize(14);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    const weekText = `Semana ${listaCompra.semana}`;
    const weekWidth = doc.getTextWidth(weekText);
    doc.text(weekText, (doc.internal.pageSize.width - weekWidth) / 2, 45);
    
    const dateText = `${formatearFecha(listaCompra.fechaInicio)} - ${formatearFecha(listaCompra.fechaFin)}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, (doc.internal.pageSize.width - dateWidth) / 2, 55);
    
    // Línea separadora centrada
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    const lineStart = 20;
    const lineEnd = doc.internal.pageSize.width - 20;
    doc.line(lineStart, 65, lineEnd, 65);
    
    // Preparar datos para la tabla
    const ingredientesOrdenados = listaCompra.ingredientes
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
      .map(ingrediente => [
        ingrediente.nombre,
        formatearPeso(ingrediente.pesoTotal),
        '' // Campo vacío para el checkbox
      ]);
    
    // Configuración de la tabla con autoTable
    autoTable(doc, {
      startY: 75,
      head: [['Ingrediente', 'Cantidad']],
      body: ingredientesOrdenados,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94] as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: 'bold',
        fontSize: 12,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 11,
        halign: 'left',
        cellPadding: 8
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] as [number, number, number]
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 120 }, // Ingrediente
        1: { halign: 'center', cellWidth: 50 }, // Cantidad
        2: { halign: 'center', cellWidth: 20 }  // Checkbox (solo en el cuerpo)
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      didDrawCell: (data: { column: { index: number }; row: { index: number }; cell: { x: number; y: number; width: number; height: number } }) => {
        // Dibujar checkboxes en la tercera columna
        if (data.column.index === 2 && data.row.index >= 0) {
          const x = data.cell.x + data.cell.width / 2 - 3;
          const y = data.cell.y + data.cell.height / 2 - 3;
          
          // Crear checkbox visual
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.rect(x, y, 6, 6);
        }
      }
    });
    
    // Obtener la posición final de la tabla
    const finalY = doc.lastAutoTable.finalY + 20;
    
    // Fecha de generación centrada
    const generatedText = `Generado el: ${new Date().toLocaleDateString('es-ES')}`;
    const generatedWidth = doc.getTextWidth(generatedText);
    doc.setFontSize(10);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(generatedText, (doc.internal.pageSize.width - generatedWidth) / 2, finalY + 20);
    
    // Descargar el PDF
    const fileName = `Lista_Compra_Semana_${listaCompra.semana}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };


  if (loading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="center" py="xl">
          <Loader size="lg" />
          <Text>Cargando lista de compra...</Text>
        </Group>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        variant="light"
      >
        {error}
      </Alert>
    );
  }

  if (!listaCompra) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Sin datos"
        color="blue"
        variant="light"
      >
        No se encontró la lista de compra para la semana {semana}
      </Alert>
    );
  }


  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Header de la semana */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="xs" mb="xs">
              <IconShoppingCart size={24} color="var(--mantine-color-nutroos-green-6)" />
              <Text size="xl" fw={700} c="nutroos-green.6">
                Lista de Compra - Semana {listaCompra.semana}
              </Text>
            </Group>
                    <Group gap="md">
                      <Group gap="xs">
                        <IconCalendar size={16} />
                        <Text size="sm" c="dimmed">
                          {formatearFecha(listaCompra.fechaInicio)} - {formatearFecha(listaCompra.fechaFin)}
                        </Text>
                      </Group>
                    </Group>
          </div>
          <Badge size="lg" color="nutroos-green" variant="light">
            {listaCompra.totalIngredientes} ingredientes
          </Badge>
        </Group>

        <Divider />

        {/* Resumen */}
        <Paper p="md" radius="md" withBorder style={{ backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)' }}>
          <Grid>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <Text size="sm" c="dimmed">Total Ingredientes</Text>
              <Text size="lg" fw={600}>{listaCompra.totalIngredientes}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <Text size="sm" c="dimmed">Ingredientes Únicos</Text>
              <Text size="lg" fw={600}>{listaCompra.totalIngredientes}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <Text size="sm" c="dimmed">Días Incluidos</Text>
              <Text size="lg" fw={600}>{listaCompra.diasIncluidos.length}</Text>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Lista de ingredientes */}
        <Stack gap="xs">
          {listaCompra.ingredientes
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
            .map((ingrediente, index) => (
            <Paper
              key={`${ingrediente.ingredienteId}-${index}`}
              p="lg"
              radius="lg"
              withBorder
              style={{ 
                backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
                border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)'}`,
                transition: 'all 0.3s ease',
                boxShadow: isDark 
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Group justify="space-between" align="center">
                <Group gap="lg" align="center">
                  <Box
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: 'var(--mantine-color-nutroos-green-6)',
                      boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)'
                    }}
                  />
                  <Text fw={600} size="xl" c={isDark ? "gray.0" : "gray.9"}>
                    {ingrediente.nombre}
                  </Text>
                </Group>
                <Text 
                  fw={700} 
                  size="xl" 
                  c="nutroos-green.6"
                  style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {formatearPeso(ingrediente.pesoTotal)}
                </Text>
              </Group>
            </Paper>
          ))}
        </Stack>

        {/* Botón de acción */}
        <Group justify="center" mt="md">
          <Button
            leftSection={<IconDownload size={16} />}
            color="nutroos-green"
            size="md"
            onClick={generarPDF}
          >
            Descargar PDF
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default ListaCompraSemanalComponent;

