import React, { useEffect, useState, ReactNode, useCallback } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { useAuth } from '../hooks/useAuth';
import { videoService } from '../services/videoService';
import { VideoContext, VideoContextType } from './VideoContextValue';


interface VideoProviderProps {
  children: ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const initializeClient = useCallback(async () => {
    if (!user || client) return;

    setIsLoading(true);
    setError(null);

    try {
      // Obtener token de Stream.io del backend
      const tokenData = await videoService.getUserToken();
      
      if (!tokenData.token) {
        throw new Error('No se pudo obtener el token de Stream.io');
      }

      // Crear el cliente de Stream.io
      const newClient = new StreamVideoClient({
        apiKey: import.meta.env.VITE_STREAM_API_KEY || 'mmhfdzb5evj2',
        user: {
          id: user._id,
          name: user.fullName,
          image: user.profilePicture || undefined,
        },
        token: tokenData.token,
      });

      // Conectar el cliente
      await newClient.connectUser({
        id: user._id,
        name: user.fullName,
        image: user.profilePicture || undefined,
      }, tokenData.token);
      
      setClient(newClient);
      setIsConnected(true);
      
    } catch (err) {
      console.error('Error al inicializar cliente de video:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, client]);

  const disconnect = useCallback(async () => {
    if (client) {
      try {
        await client.disconnectUser();
      } catch (err) {
        console.error('Error al desconectar cliente de video:', err);
      }
      setClient(null);
      setIsConnected(false);
    }
  }, [client]);

  // Inicializar cliente cuando el usuario esté disponible
  useEffect(() => {
    if (user && !client && !isLoading) {
      initializeClient();
    }
  }, [user, client, isLoading, initializeClient]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (client) {
        disconnect();
      }
    };
  }, [client, disconnect]);

  const value: VideoContextType = {
    client,
    isConnected,
    isLoading,
    error,
    initializeClient,
    disconnect,
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};
