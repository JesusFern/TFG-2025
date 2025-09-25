import { useState, useEffect, useCallback } from 'react';
import { buscarIngredientes, buscarIngredientesLocales, BuscarIngredientesResponse, IngredienteUnificado } from '../services/ingredientesService';

interface UseIngredientesSearchResult {
  resultados: IngredienteUnificado[];
  loading: boolean;
  error: string | null;
  buscar: (termino: string) => void;
  limpiar: () => void;
  hayMasResultados: boolean;
  cargarMas: () => void;
  cargarMasOpenFoodFacts: () => void;
  sinResultados: boolean;
  terminoBusqueda: string;
  openFoodFactsCargado: boolean;
}

interface UseIngredientesSearchOptions {
  debounceDelay?: number;
  maxResultadosPorPagina?: number;
  busquedaMinima?: number;
}

/**
 * Hook personalizado para búsqueda de ingredientes con debounce y paginación
 */
export const useIngredientesSearch = (
  options: UseIngredientesSearchOptions = {}
): UseIngredientesSearchResult => {
  const {
    debounceDelay = 300,
    maxResultadosPorPagina = 10,
    busquedaMinima = 2
  } = options;

  const [resultados, setResultados] = useState<IngredienteUnificado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terminoActual, setTerminoActual] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [hayMasResultados, setHayMasResultados] = useState(false);
  const [sinResultados, setSinResultados] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [openFoodFactsCargado, setOpenFoodFactsCargado] = useState(false);
  const [paginaOpenFoodFacts, setPaginaOpenFoodFacts] = useState(1);

  // Función para realizar la búsqueda local
  const realizarBusquedaLocal = useCallback(async (termino: string, pagina: number = 1, esNuevaBusqueda: boolean = true) => {
    if (termino.trim().length < busquedaMinima) {
      setResultados([]);
      setHayMasResultados(false);
      setSinResultados(false);
      setOpenFoodFactsCargado(false);
      setPaginaOpenFoodFacts(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: BuscarIngredientesResponse = await buscarIngredientesLocales(
        termino,
        pagina,
        maxResultadosPorPagina
      );

      if (esNuevaBusqueda) {
        setResultados(response.alimentos);
        setPaginaActual(1);
        setTerminoBusqueda(termino);
        setOpenFoodFactsCargado(false);
        setPaginaOpenFoodFacts(1);
      } else {
        // Agregar resultados para paginación
        setResultados(prev => [...prev, ...response.alimentos]);
        setPaginaActual(pagina);
      }

      setHayMasResultados(response.paginacion.hayMasResultados);
      setSinResultados(response.alimentos.length === 0 && esNuevaBusqueda);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar ingredientes');
      if (esNuevaBusqueda) {
        setResultados([]);
        setSinResultados(true);
        setOpenFoodFactsCargado(false);
        setPaginaOpenFoodFacts(1);
      }
      setHayMasResultados(false);
    } finally {
      setLoading(false);
    }
  }, [busquedaMinima, maxResultadosPorPagina]);

  // Función para cargar más resultados de OpenFoodFacts
  const cargarMasOpenFoodFacts = useCallback(async () => {
    if (!terminoBusqueda || terminoBusqueda.trim().length < busquedaMinima) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const siguientePagina = openFoodFactsCargado ? paginaOpenFoodFacts + 1 : 1;
      
      const response: BuscarIngredientesResponse = await buscarIngredientes(
        terminoBusqueda,
        siguientePagina,
        maxResultadosPorPagina
      );

      // Agregar resultados de OpenFoodFacts a los existentes
      setResultados(prev => [...prev, ...response.alimentos]);
      setOpenFoodFactsCargado(true);
      setPaginaOpenFoodFacts(siguientePagina);
      setHayMasResultados(response.paginacion.hayMasResultados);
      setSinResultados(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar ingredientes en OpenFoodFacts');
    } finally {
      setLoading(false);
    }
  }, [terminoBusqueda, busquedaMinima, maxResultadosPorPagina, openFoodFactsCargado, paginaOpenFoodFacts]);

  // Función para buscar con debounce
  const buscar = useCallback((termino: string) => {
    setTerminoActual(termino);

    // Limpiar timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Si el término es muy corto, limpiar resultados inmediatamente
    if (termino.trim().length < busquedaMinima) {
      setResultados([]);
      setHayMasResultados(false);
      setSinResultados(false);
      setLoading(false);
      setError(null);
      return;
    }

    // Mostrar loading inmediatamente para términos válidos
    setLoading(true);
    setError(null);

    // Configurar nuevo timeout para debounce
    const newTimeoutId = setTimeout(() => {
      realizarBusquedaLocal(termino, 1, true);
    }, debounceDelay);

    setTimeoutId(newTimeoutId);
  }, [debounceDelay, busquedaMinima, realizarBusquedaLocal, timeoutId]);

  // Función para cargar más resultados (paginación local)
  const cargarMas = useCallback(() => {
    if (hayMasResultados && !loading && terminoActual.trim().length >= busquedaMinima) {
      realizarBusquedaLocal(terminoActual, paginaActual + 1, false);
    }
  }, [hayMasResultados, loading, terminoActual, paginaActual, busquedaMinima, realizarBusquedaLocal]);

  // Función para limpiar resultados
  const limpiar = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setResultados([]);
    setLoading(false);
    setError(null);
    setTerminoActual('');
    setTerminoBusqueda('');
    setPaginaActual(1);
    setHayMasResultados(false);
    setSinResultados(false);
    setOpenFoodFactsCargado(false);
    setPaginaOpenFoodFacts(1);
  }, [timeoutId]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
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
  };
};

