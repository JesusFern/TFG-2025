import { useState, useEffect, useCallback, useRef } from 'react';
import { useVideo } from './useVideo';
import { Call, StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { useAuth } from './useAuth';

interface UseVideoCallBaseProps {
  onCallEnded?: () => void;
  onCallStarted?: (call: Call) => void;
}

export const useVideoCallBase = ({ onCallEnded, onCallStarted }: UseVideoCallBaseProps) => {
  const { client, isConnected, isLoading: isVideoClientLoading, error: videoClientError } = useVideo();
  const { user: currentUser } = useAuth();
  const [call, setCall] = useState<Call | null>(null);
  const [isLoadingCall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<StreamVideoParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<StreamVideoParticipant | null>(null);
  const [callingState, setCallingState] = useState<string>('idle');
  const [isStarting, setIsStarting] = useState(false);

  const otherParticipant = participants.find(p => p.userId !== currentUser?._id);
  
  // Usar refs para evitar problemas de dependencias en useEffect
  const callRef = useRef<Call | null>(null);
  const onCallEndedRef = useRef(onCallEnded);
  
  // Actualizar refs cuando cambien
  useEffect(() => {
    callRef.current = call;
  }, [call]);
  
  useEffect(() => {
    onCallEndedRef.current = onCallEnded;
  }, [onCallEnded]);

  // Función helper para configurar participantes
  const setupParticipants = useCallback((currentCall: Call) => {
    // Configurar estado inicial - filtrar el participante local de la lista
    const remoteParticipants = currentCall.state.participants.filter(p => p.userId !== currentUser?._id);
    setParticipants(remoteParticipants);
    setLocalParticipant(currentCall.state.localParticipant || null);
    
    // Configurar listeners para cambios de participantes
    currentCall.state.participants$.subscribe((participants) => {
      // Filtrar el participante local para evitar doble conteo
      const remoteParticipants = participants.filter(p => p.userId !== currentUser?._id);
      setParticipants(remoteParticipants);
    });
    
    currentCall.state.localParticipant$.subscribe((localParticipant) => {
      setLocalParticipant(localParticipant || null);
    });
  }, [currentUser]);

  // Función helper para crear y unirse a una llamada
  const createAndJoinCall = useCallback(async (customCallId: string): Promise<Call> => {
    if (!client || !isConnected || !currentUser) {
      throw new Error('Cliente de video no disponible');
    }

    const currentCall = client.call('default', customCallId);
    await currentCall.join({ create: true });
    setCall(currentCall);
    setCallingState('active');
    
    // Configurar participantes
    setupParticipants(currentCall);
    
    // Notificar que la llamada ha comenzado
    onCallStarted?.(currentCall);
    
    return currentCall;
  }, [client, isConnected, currentUser, setupParticipants, onCallStarted]);

  // Función helper para manejar errores comunes
  const handleCallError = useCallback((err: unknown, context: string) => {
    setError(err instanceof Error ? err.message : `Error ${context}`);
    setCall(null);
    setCallingState('idle');
  }, []);

  // Función helper para iniciar llamada con validaciones comunes
  const startCallWithValidation = useCallback(async (
    customCallId: string,
    settings?: { videoEnabled: boolean; audioEnabled: boolean }
  ) => {
    if (isStarting || isLoadingCall) {
      return; // Evitar múltiples llamadas simultáneas
    }

    setIsStarting(true);
    setError(null);

    try {
      const currentCall = await createAndJoinCall(customCallId);
      
      // Aplicar configuración de cámara si se proporciona
      if (settings) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          if (settings.videoEnabled) {
            await currentCall.camera.enable();
          } else {
            await currentCall.camera.disable();
          }
          
          if (settings.audioEnabled) {
            await currentCall.microphone.enable();
          } else {
            await currentCall.microphone.disable();
          }
        } catch (deviceError) {
          // Si hay problemas con los dispositivos, continuar sin fallar la llamada
          console.warn('Error configuring devices:', deviceError);
        }
      }
      
    } catch (err) {
      handleCallError(err, 'al iniciar la llamada');
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, isLoadingCall, createAndJoinCall, handleCallError]);

  // Función para alternar micrófono
  const toggleMic = useCallback(async () => {
    if (call) {
      try {
        if (call.microphone.state.status === 'enabled') {
          await call.microphone.disable();
        } else {
          await call.microphone.enable();
        }
      } catch {
        setError('Error al alternar micrófono');
      }
    }
  }, [call]);

  // Función para alternar cámara
  const toggleCamera = useCallback(async () => {
    if (call) {
      try {
        if (call.camera.state.status === 'enabled') {
          await call.camera.disable();
        } else {
          await call.camera.enable();
        }
      } catch {
        setError('Error al alternar cámara');
      }
    }
  }, [call]);

  // Función para alternar pantalla compartida
  const toggleScreenShare = useCallback(async () => {
    if (call) {
      try {
        if (call.screenShare.state.status === 'enabled') {
          await call.screenShare.disable();
        } else {
          await call.screenShare.enable();
        }
      } catch {
        setError('Error al alternar pantalla compartida');
      }
    }
  }, [call]);

  // Función para terminar llamada
  const endCall = useCallback(async () => {
    if (call) {
      try {
        await call.leave();
        setCall(null);
        setParticipants([]);
        setLocalParticipant(null);
        setCallingState('idle');
        onCallEndedRef.current?.();
      } catch {
        setError('Error al terminar la llamada');
      }
    }
  }, [call]);

  // Cleanup cuando se desmonta el componente
  useEffect(() => {
    return () => {
      // Solo hacer cleanup cuando el componente se desmonta completamente
      // No cuando cambia la llamada
      if (callRef.current) {
        callRef.current.leave().catch(() => {});
        setCall(null);
        setParticipants([]);
        setLocalParticipant(null);
        setCallingState('idle');
        onCallEndedRef.current?.();
      }
    };
  }, []); // Solo se ejecuta al desmontar el componente

  return {
    // Estados
    call,
    isLoadingCall: isLoadingCall || isVideoClientLoading || isStarting,
    error: error || videoClientError,
    callingState,
    participants,
    localParticipant,
    otherParticipant,
    isConnected,
    client,
    currentUser,
    isStarting,
    
    // Funciones helper
    createAndJoinCall,
    setupParticipants,
    handleCallError,
    startCallWithValidation,
    
    // Funciones de control
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    endCall,
    setCall,
    setCallingState,
    setError,
    setIsStarting,
  };
};
