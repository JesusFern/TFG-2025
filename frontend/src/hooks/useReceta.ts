import { useState, useEffect, useCallback } from 'react';
import { obtenerReceta, RecetaResponse } from '../services/recetaService';

export const useReceta = (id: string | undefined) => {
  const [receta, setReceta] = useState<RecetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarReceta = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const recetaData = await obtenerReceta(id);
      setReceta(recetaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la receta');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      cargarReceta();
    }
  }, [id, cargarReceta]);

  return {
    receta,
    loading,
    error,
    cargarReceta
  };
};
