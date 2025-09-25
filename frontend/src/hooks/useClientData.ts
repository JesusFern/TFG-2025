import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUserById } from '../services/userService';

export interface ClientData {
  clientId: string | null;
  clienteNombre: string;
  isLoading: boolean;
  error: string | null;
}

export const useClientData = (): ClientData => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      setIsLoading(true);
      setError(null);
      
      (async () => {
        try {
          const userData = await getUserById(clientId);
          setClienteNombre(userData.fullName);
        } catch (err) {
          setError('Error al cargar datos del cliente');
          console.error('Error loading client data:', err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [clientId]);

  return {
    clientId,
    clienteNombre,
    isLoading,
    error
  };
};
