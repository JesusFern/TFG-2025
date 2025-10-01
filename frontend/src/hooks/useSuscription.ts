import { useState, useEffect, useCallback } from 'react';
import { getSuscriptionStatus, SuscriptionStatus } from '../services/suscriptionService';

export const useSuscription = () => {
  const [suscriptionStatus, setSuscriptionStatus] = useState<SuscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await getSuscriptionStatus();
      setSuscriptionStatus(status);
    } catch (err) {
      console.error('Error al cargar estado de suscripción:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar estado de suscripción');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuscriptionStatus();
  }, [loadSuscriptionStatus]);

  return {
    suscriptionStatus,
    loading,
    error,
    refetch: loadSuscriptionStatus
  };
};
