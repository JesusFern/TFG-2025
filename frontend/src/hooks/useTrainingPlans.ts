import { useState, useEffect, useCallback } from 'react';
import trainingService from '../services/trainingService';
import { getClientById } from '../services/authService';
import type { PlanEntrenamiento } from '../types/training';

interface UseTrainingPlansProps {
  workerId: string | null;
  clientId: string | null;
  hasPermission: boolean;
}

interface UseTrainingPlansReturn {
  planes: PlanEntrenamiento[];
  clientInfo: { id: string; fullName: string; email: string; role: string } | null;
  loading: boolean;
  loadingClient: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTrainingPlans = ({ 
  workerId, 
  clientId, 
  hasPermission 
}: UseTrainingPlansProps): UseTrainingPlansReturn => {
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([]);
  const [clientInfo, setClientInfo] = useState<{ id: string; fullName: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingClient, setLoadingClient] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanes = useCallback(async () => {
    if (!workerId || !clientId) {
      setError('ID de entrenador o cliente no encontrado');
      setLoading(false);
      return;
    }

    if (!hasPermission) {
      setError('No tienes permisos para acceder a esta página. Solo los entrenadores pueden ver planes de entrenamiento.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const planesData = await trainingService.obtenerPlanes({ 
        entrenador: workerId, 
        cliente: clientId 
      });
      setPlanes(planesData);
    } catch (err) {
      console.error("Error al obtener planes de entrenamiento:", err);
      setError('Error al cargar los planes de entrenamiento');
    } finally {
      setLoading(false);
    }
  }, [workerId, clientId, hasPermission]);

  const fetchClientInfo = useCallback(async () => {
    if (!clientId) return;
    
    try {
      setLoadingClient(true);
      const clientData = await getClientById(clientId);
      setClientInfo({
        id: clientData._id,
        fullName: clientData.fullName,
        email: clientData.email,
        role: clientData.role
      });
    } catch (err) {
      console.error("Error al obtener información del cliente:", err);
    } finally {
      setLoadingClient(false);
    }
  }, [clientId]);

  useEffect(() => {
    void fetchPlanes();
  }, [fetchPlanes]);

  useEffect(() => {
    void fetchClientInfo();
  }, [fetchClientInfo]);

  return {
    planes,
    clientInfo,
    loading,
    loadingClient,
    error,
    refetch: fetchPlanes
  };
};
