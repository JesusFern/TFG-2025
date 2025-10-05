import React, { useState } from 'react';
import {
  TextInput,
  Paper,
  Stack,
  Group,
  Text,
  ActionIcon,
  Button,
  NumberInput,
  Image,
  Badge,
  Box,
  Alert,
  ScrollArea
} from '@mantine/core';
import { IconSearch, IconPlus, IconAlertCircle, IconTrash } from '@tabler/icons-react';
import { useIngredientesSearch } from '../../hooks/useIngredientesSearch';
import { AlimentoOpenFoodFacts, Ingrediente } from '../../types/diets';
import { IngredienteUnificado, IngredienteLocal } from '../../services/ingredientesService';
import { useThemeDetection } from '../../hooks/useThemeDetection';
import { useMantineTheme } from '@mantine/core';

interface BuscadorIngredientesProps {
  onSeleccionar: (ingrediente: Ingrediente) => void;
  ingredientesAgregados?: Ingrediente[];
  onEliminarIngrediente?: (index: number) => void;
  onActualizarPeso?: (index: number, nuevoPeso: number) => void;
  placeholder?: string;
}

const BuscadorIngredientes: React.FC<BuscadorIngredientesProps> = ({
  onSeleccionar,
  ingredientesAgregados = [],
  onEliminarIngrediente,
  onActualizarPeso,
  placeholder = "Buscar ingrediente..."
}) => {
  const [termino, setTermino] = useState('');
  const [pesoSeleccionado, setPesoSeleccionado] = useState<number>(100);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | null>(null);
  const [mensajeDuplicado, setMensajeDuplicado] = useState<string | null>(null);
  
  const isDark = useThemeDetection();
  const theme = useMantineTheme();
  
  const {
    resultados,
    loading,
    error,
    buscar,
    limpiar,
    hayMasResultados,
    cargarMas,
    cargarMasOpenFoodFacts,
    sinResultados,
    terminoBusqueda,
    openFoodFactsCargado
  } = useIngredientesSearch({
    debounceDelay: 300,
    maxResultadosPorPagina: 8,
    busquedaMinima: 2
  });

  const handleInputChange = (value: string) => {
    setTermino(value);
    setIngredienteSeleccionado(null);
    // No buscar automáticamente, solo limpiar si es necesario
    if (value.trim().length < 2) {
      limpiar();
    }
  };

  const handleBuscar = () => {
    if (termino.trim().length >= 2) {
      buscar(termino);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevenir el envío del formulario padre
      handleBuscar();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevenir el envío del formulario padre
      handleBuscar();
    }
  };

  // Función auxiliar para determinar si es un ingrediente local
  const esIngredienteLocal = (ingrediente: IngredienteUnificado): ingrediente is IngredienteLocal => {
    return '_id' in ingrediente;
  };


  const handleSeleccionarIngrediente = (alimento: IngredienteUnificado) => {
    // Determinar si es ingrediente local o de OpenFoodFacts
    const esLocal = esIngredienteLocal(alimento);
    
    // Convertir a formato Ingrediente estándar
    const ingrediente: Ingrediente = {
      nombre: alimento.nombre,
      peso: 100, // Peso por defecto
      informacionNutricional: obtenerInfoNutricional(alimento), // Usar función normalizada
      marca: obtenerMarcaRender(alimento),
      id: esLocal ? alimento._id : null, // null para OpenFoodFacts
      imagenIngrediente: obtenerImagenRender(alimento),
      fuente: esLocal ? (alimento as IngredienteLocal).fuente : 'Openfoodfacts' // Usar la fuente del ingrediente local o 'Openfoodfacts'
    };
    
    setIngredienteSeleccionado(ingrediente);
    setTermino(alimento.nombre);
    setMensajeDuplicado(null); // Limpiar mensaje de duplicado
    limpiar();
  };

  const handleAgregarIngrediente = () => {
    if (!ingredienteSeleccionado || !pesoSeleccionado || pesoSeleccionado <= 0) return;

    // Verificar si el ingrediente ya existe
    const nombreIngrediente = ingredienteSeleccionado.nombre.toLowerCase().trim();
    const ingredienteExistente = ingredientesAgregados.find(
      ing => ing.nombre.toLowerCase().trim() === nombreIngrediente
    );

    if (ingredienteExistente) {
      // Si ya existe, mostrar mensaje de error
      setMensajeDuplicado(`"${ingredienteSeleccionado.nombre}" ya está agregado a la lista`);
      setTimeout(() => setMensajeDuplicado(null), 3000); // Limpiar mensaje después de 3 segundos
      return;
    }

    // Crear el ingrediente final con el peso seleccionado
    const ingrediente: Ingrediente = {
      nombre: ingredienteSeleccionado.nombre,
      peso: pesoSeleccionado,
      informacionNutricional: ingredienteSeleccionado.informacionNutricional,
      marca: ingredienteSeleccionado.marca,
      id: ingredienteSeleccionado.id,
      imagenIngrediente: ingredienteSeleccionado.imagenIngrediente
    };

    onSeleccionar(ingrediente);
    
    // Limpiar todo y cerrar el buscador
    setIngredienteSeleccionado(null);
    setPesoSeleccionado(100);
    setTermino('');
    limpiar();
  };

  const formatearNutrientes = (info: AlimentoOpenFoodFacts['informacionNutricional']) => {
    return `${info.calorias} kcal | P: ${info.proteinas}g | C: ${info.carbohidratos}g | G: ${info.grasas}g`;
  };

  // Calcular información nutricional total
  const calcularTotalNutricional = () => {
    return ingredientesAgregados.reduce((total, ingrediente) => {
      const factor = ingrediente.peso / 100;
      return {
        calorias: total.calorias + (ingrediente.informacionNutricional.calorias * factor),
        proteinas: total.proteinas + (ingrediente.informacionNutricional.proteinas * factor),
        carbohidratos: total.carbohidratos + (ingrediente.informacionNutricional.carbohidratos * factor),
        grasas: total.grasas + (ingrediente.informacionNutricional.grasas * factor)
      };
    }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
  };

  // Función para normalizar valores nutricionales (convertir strings a números)
  const normalizarValoresNutricionales = (info: Record<string, unknown>): AlimentoOpenFoodFacts['informacionNutricional'] => {
    return {
      calorias: typeof info.calorias === 'string' ? parseFloat(info.calorias) || 0 : (info.calorias as number) || 0,
      proteinas: typeof info.proteinas === 'string' ? parseFloat(info.proteinas) || 0 : (info.proteinas as number) || 0,
      carbohidratos: typeof info.carbohidratos === 'string' ? parseFloat(info.carbohidratos) || 0 : (info.carbohidratos as number) || 0,
      grasas: typeof info.grasas === 'string' ? parseFloat(info.grasas) || 0 : (info.grasas as number) || 0,
      fibra: typeof info.fibra === 'string' ? parseFloat(info.fibra) || 0 : (info.fibra as number) || 0,
      azucares: typeof info.azucares === 'string' ? parseFloat(info.azucares) || 0 : (info.azucares as number) || 0,
      sal: typeof info.sal === 'string' ? parseFloat(info.sal) || 0 : (info.sal as number) || 0,
      sodio: typeof info.sodio === 'string' ? parseFloat(info.sodio) || 0 : (info.sodio as number) || 0
    };
  };

  // Función para obtener la información nutricional de cualquier tipo de ingrediente
  const obtenerInfoNutricional = (ingrediente: IngredienteUnificado): AlimentoOpenFoodFacts['informacionNutricional'] => {
    if (esIngredienteLocal(ingrediente)) {
      return {
        calorias: ingrediente.calorias,
        proteinas: ingrediente.proteinas,
        carbohidratos: ingrediente.hidratosCarbono,
        grasas: ingrediente.grasas
      };
    }
    return normalizarValoresNutricionales(ingrediente.informacionNutricional as unknown as Record<string, unknown>);
  };

  // Funciones auxiliares para acceder a propiedades de manera segura


  const obtenerCalificacionNutricional = (ingrediente: IngredienteUnificado): string | undefined => {
    return esIngredienteLocal(ingrediente) ? undefined : ingrediente.calificacionNutricional;
  };

  // Funciones auxiliares para renderizado (trabajan con IngredienteUnificado)
  const obtenerIdRender = (alimento: IngredienteUnificado): string => {
    return esIngredienteLocal(alimento) ? alimento._id : alimento.id;
  };

  const obtenerImagenRender = (alimento: IngredienteUnificado): string | undefined => {
    return esIngredienteLocal(alimento) ? undefined : alimento.imagen;
  };

  const obtenerMarcaRender = (alimento: IngredienteUnificado): string | undefined => {
    return esIngredienteLocal(alimento) ? undefined : alimento.marca;
  };

  // Funciones auxiliares para ingredientes agregados (trabajan con Ingrediente)
  const obtenerImagenAgregado = (ingrediente: Ingrediente): string | undefined => {
    return ingrediente.imagenIngrediente;
  };

  const obtenerInfoNutricionalAgregado = (ingrediente: Ingrediente): AlimentoOpenFoodFacts['informacionNutricional'] => {
    return ingrediente.informacionNutricional;
  };

  // Funciones auxiliares para determinar el tipo de ingrediente agregado
  const esIngredienteLocalAgregado = (ingrediente: Ingrediente): boolean => {
    return ingrediente.id !== undefined && ingrediente.id !== null;
  };


  return (
    <Stack gap="sm">
      {/* Campo de búsqueda */}
      <Group gap="xs">
        <TextInput
          placeholder={placeholder}
          value={termino}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
        />
        <Button
          onClick={handleBuscar}
          loading={loading}
          disabled={termino.trim().length < 2}
          variant="filled"
          color="nutroos-green"
        >
          Buscar
        </Button>
      </Group>

      {/* Mostrar error si existe */}
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}

      {/* Mostrar mensaje cuando no hay resultados */}
      {sinResultados && !loading && terminoBusqueda && (
        <Box>
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light" mb="md">
            No se han encontrado resultados para "{terminoBusqueda}"
          </Alert>
          <Group justify="center">
            <Button
              variant="outline"
              color="blue"
              onClick={cargarMasOpenFoodFacts}
              loading={loading}
              leftSection={<IconPlus size={16} />}
            >
              {openFoodFactsCargado ? 'Cargar más de OpenFoodFacts' : 'Buscar en OpenFoodFacts'}
            </Button>
          </Group>
        </Box>
      )}

      {/* Mostrar mensaje de ingrediente duplicado */}
      {mensajeDuplicado && (
        <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light" mb="md">
          {mensajeDuplicado}
        </Alert>
      )}


      {/* Lista de resultados */}
      {resultados.length > 0 && !ingredienteSeleccionado && (
        <Paper shadow="xs" p="md" withBorder style={{ zIndex: 2100, position: 'relative' }}>
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" fw={500}>
              Resultados de búsqueda:
            </Text>
            <Group gap="xs">
              <Badge size="xs" variant="light" color="green">
                🏠 Local
              </Badge>
            </Group>
          </Group>
          
          <ScrollArea.Autosize mah={300}>
            <Stack gap="xs">
              {resultados.map((alimento) => (
                <Paper
                  key={obtenerIdRender(alimento)}
                  p="sm"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSeleccionarIngrediente(alimento)}
                  className="hover:bg-gray-50"
                >
                  <Group gap="sm">
                    {obtenerImagenRender(alimento) && (
                      <Image
                        src={obtenerImagenRender(alimento)!}
                        alt={alimento.nombre}
                        w={40}
                        h={40}
                        radius="sm"
                        fallbackSrc="/api/placeholder/40/40"
                      />
                    )}
                    
                    <Box style={{ flex: 1 }}>
                        <Group justify="space-between" align="flex-start">
                          <Box>
                            <Group gap="xs" align="center">
                              <Text size="sm" fw={500} lineClamp={1}>
                                {alimento.nombre}
                              </Text>
                              {esIngredienteLocal(alimento) && (
                                <Badge size="xs" variant="filled" color="green">
                                  🏠
                                </Badge>
                              )}
                            </Group>
                            {obtenerMarcaRender(alimento) && (
                              <Text size="xs" c="dimmed">
                                {obtenerMarcaRender(alimento)}
                              </Text>
                            )}
                            <Text size="xs" c="blue">
                              {formatearNutrientes(obtenerInfoNutricional(alimento))}
                            </Text>
                          </Box>
                        
                        <Group gap="xs">
                          {obtenerCalificacionNutricional(alimento) && (
                            <Badge
                              size="sm"
                              color={
                                obtenerCalificacionNutricional(alimento) === 'A' ? 'green' :
                                obtenerCalificacionNutricional(alimento) === 'B' ? 'lime' :
                                obtenerCalificacionNutricional(alimento) === 'C' ? 'yellow' :
                                obtenerCalificacionNutricional(alimento) === 'D' ? 'orange' : 'red'
                              }
                            >
                              {obtenerCalificacionNutricional(alimento)}
                            </Badge>
                          )}
                          <ActionIcon variant="light" size="sm">
                            <IconPlus size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Box>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea.Autosize>

          {/* Botones cargar más */}
          <Group justify="center" mt="sm">
            {hayMasResultados && (
              <Button
                variant="light"
                size="xs"
                onClick={cargarMas}
                loading={loading}
                leftSection={<IconPlus size={14} />}
              >
                Cargar más resultados locales
              </Button>
            )}
            
            {terminoBusqueda && terminoBusqueda.trim().length >= 2 && (
              <Button
                variant="outline"
                size="xs"
                color="blue"
                onClick={cargarMasOpenFoodFacts}
                loading={loading}
                leftSection={<IconPlus size={14} />}
              >
                {openFoodFactsCargado ? 'Cargar más de OpenFoodFacts' : 'Buscar en OpenFoodFacts'}
              </Button>
            )}
          </Group>
        </Paper>
      )}

      {/* Ingrediente seleccionado y configuración de peso */}
      {ingredienteSeleccionado && (
        <Paper shadow="xs" p="md" withBorder>
          <Text size="sm" fw={500} mb="sm">
            Ingrediente seleccionado:
          </Text>
          
          <Group align="flex-start" gap="sm" mb="md">
            {obtenerImagenAgregado(ingredienteSeleccionado) && (
              <Image
                src={obtenerImagenAgregado(ingredienteSeleccionado)!}
                alt={ingredienteSeleccionado.nombre}
                w={60}
                h={60}
                radius="sm"
                fallbackSrc="/api/placeholder/60/60"
              />
            )}
            
            <Box style={{ flex: 1 }}>
              <Group gap="xs" align="center">
                <Text fw={500}>{ingredienteSeleccionado.nombre}</Text>
                {esIngredienteLocalAgregado(ingredienteSeleccionado) && (
                  <Badge size="xs" variant="filled" color="green">
                    🏠 {ingredienteSeleccionado.fuente}
                  </Badge>
                )}
              </Group>
              {!esIngredienteLocalAgregado(ingredienteSeleccionado) && ingredienteSeleccionado.marca && (
                <Text size="sm" c="dimmed">
                  {ingredienteSeleccionado.marca}
                </Text>
              )}
              <Text size="sm" c="blue">
                Por 100g: {formatearNutrientes(obtenerInfoNutricionalAgregado(ingredienteSeleccionado))}
              </Text>
            </Box>
          </Group>

          <Group align="flex-end" gap="sm">
            <NumberInput
              label="Peso (gramos)"
              placeholder="100"
              value={pesoSeleccionado}
              onChange={(value) => setPesoSeleccionado(Number(value) || 0)}
              min={1}
              max={5000}
              step={10}
              style={{ flex: 1 }}
            />
            
            <Button
              onClick={handleAgregarIngrediente}
              disabled={!pesoSeleccionado || pesoSeleccionado <= 0}
              leftSection={<IconPlus size={16} />}
            >
              Agregar
            </Button>
          </Group>

          {/* Información nutricional calculada para el peso seleccionado */}
          {pesoSeleccionado > 0 && (
            <Box 
              mt="sm" 
              p="xs" 
              style={{ 
                borderRadius: 4,
                backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.gray[0],
                border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`
              }}
            >
              <Text size="xs" c="dimmed" mb="2">
                Información nutricional para {pesoSeleccionado}g:
              </Text>
              <Text size="xs" c={isDark ? "gray.0" : "dark.9"}>
                {(() => {
                  const info = obtenerInfoNutricionalAgregado(ingredienteSeleccionado);
                  return `Calorías: ${Math.round((info.calorias * pesoSeleccionado) / 100)}kcal, Proteínas: ${((info.proteinas * pesoSeleccionado) / 100).toFixed(1)}g, Carbohidratos: ${((info.carbohidratos * pesoSeleccionado) / 100).toFixed(1)}g, Grasas: ${((info.grasas * pesoSeleccionado) / 100).toFixed(1)}g`;
                })()}
              </Text>
            </Box>
          )}
        </Paper>
      )}

      {/* Lista de ingredientes agregados */}
      {ingredientesAgregados.length > 0 && (
        <Paper shadow="xs" p="md" withBorder style={{ zIndex: 2100, position: 'relative' }}>
          <Text size="lg" fw={500} mb="md">
            Ingredientes agregados ({ingredientesAgregados.length}):
          </Text>
          
          <Stack gap="md">
            {ingredientesAgregados.map((ingrediente, index) => (
              <Paper 
                key={index} 
                p="md" 
                withBorder 
                radius="md"
                style={{ 
                  backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.gray[0],
                  borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3]
                }}
              >
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Group gap="sm" align="center" mb="xs">
                      <Text fw={600} size="md" c={isDark ? "gray.0" : "dark.8"}>
                        {ingrediente.nombre}
                      </Text>
                      {ingrediente.marca && (
                        <Badge size="sm" variant="light" color="blue">
                          {ingrediente.marca}
                        </Badge>
                      )}
                    </Group>
                    
                    <Text size="xs" c="dimmed" mt="xs" ta="center">
                      📊 Para {ingrediente.peso}g: 
                      <Text component="span" c={isDark ? "orange.3" : "orange.6"} fw={500}>🔥 {Math.round(ingrediente.informacionNutricional.calorias * ingrediente.peso / 100)} kcal</Text> | 
                      <Text component="span" c={isDark ? "green.3" : "green.6"} fw={500}>💪 {((ingrediente.informacionNutricional.proteinas * ingrediente.peso) / 100).toFixed(1)}g proteínas</Text> | 
                      <Text component="span" c={isDark ? "yellow.3" : "yellow.6"} fw={500}>🍞 {((ingrediente.informacionNutricional.carbohidratos * ingrediente.peso) / 100).toFixed(1)}g carbohidratos</Text> | 
                      <Text component="span" c={isDark ? "red.3" : "red.6"} fw={500}>🧈 {((ingrediente.informacionNutricional.grasas * ingrediente.peso) / 100).toFixed(1)}g grasas</Text>
                    </Text>
                  </Box>
                  
                  <Group gap="sm" align="center">
                    <Box>
                      <Text size="xs" c="dimmed" mb="xs" ta="center">
                        Peso (g)
                      </Text>
                      <NumberInput
                        value={ingrediente.peso}
                        onChange={(value) => onActualizarPeso?.(index, Number(value) || 0)}
                        min={1}
                        max={5000}
                        step={10}
                        size="sm"
                        style={{ width: 90 }}
                      />
                    </Box>
                    <ActionIcon
                      color="red"
                      variant="light"
                      size="lg"
                      onClick={() => onEliminarIngrediente?.(index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>

          {/* Información nutricional total */}
          <Paper 
            p="lg" 
            mt="lg" 
            radius="md"
            style={{ 
              backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.green[0],
              border: `2px solid ${isDark ? theme.colors.green[6] : theme.colors.green[3]}`
            }}
          >
            <Text size="lg" fw={600} mb="md" c={isDark ? "green.3" : "green.7"} ta="center">
              📊 Información Nutricional Total
            </Text>
            
            <Group justify="center" gap="xl">
              <Box ta="center">
                <Text size="xs" c="dimmed" mb="xs">CALORÍAS</Text>
                <Text size="xl" fw={700} c={isDark ? "orange.3" : "orange.6"}>
                  {(() => {
                    const total = calcularTotalNutricional();
                    return Math.round(total.calorias);
                  })()}
                </Text>
                <Text size="xs" c="dimmed">kcal</Text>
              </Box>
              
              <Box ta="center">
                <Text size="xs" c="dimmed" mb="xs">PROTEÍNAS</Text>
                <Text size="xl" fw={700} c={isDark ? "green.3" : "green.6"}>
                  {(() => {
                    const total = calcularTotalNutricional();
                    return total.proteinas.toFixed(1);
                  })()}
                </Text>
                <Text size="xs" c="dimmed">g</Text>
              </Box>
              
              <Box ta="center">
                <Text size="xs" c="dimmed" mb="xs">CARBOHIDRATOS</Text>
                <Text size="xl" fw={700} c={isDark ? "yellow.3" : "yellow.6"}>
                  {(() => {
                    const total = calcularTotalNutricional();
                    return total.carbohidratos.toFixed(1);
                  })()}
                </Text>
                <Text size="xs" c="dimmed">g</Text>
              </Box>
              
              <Box ta="center">
                <Text size="xs" c="dimmed" mb="xs">GRASAS</Text>
                <Text size="xl" fw={700} c={isDark ? "red.3" : "red.6"}>
                  {(() => {
                    const total = calcularTotalNutricional();
                    return total.grasas.toFixed(1);
                  })()}
                </Text>
                <Text size="xs" c="dimmed">g</Text>
              </Box>
            </Group>
          </Paper>
        </Paper>
      )}
    </Stack>
  );
};

export default BuscadorIngredientes;
