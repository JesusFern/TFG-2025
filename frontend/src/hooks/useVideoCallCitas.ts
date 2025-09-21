import { useState, useEffect, useCallback, useRef } from 'react';
import { useVideo } from './useVideo';
import { Call, StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { Cita } from '../types/citas';
import { useAuth } from './useAuth';

interface UseVideoCallCitasProps {
  cita?: Cita;
  callId?: string;
  onCallEnded?: () => void;
  onCallStarted?: (call: Call) => void;
}

export const useVideoCallCitas = ({ 
  cita, 
  callId, 
  onCallEnded, 
  onCallStarted 
}: UseVideoCallCitasProps) => {
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

  // Auto-recuperar videollamada cuando se establece una cita
  useEffect(() => {
    const autoRecoverCall = async () => {
      if (cita && client && isConnected && currentUser && !call && !isStarting) {
        try {
          setIsStarting(true);
          setError(null);
          
          const customCallId = callId || `cita-${cita._id}`;
          
          // Crear la llamada
          const currentCall = client.call('default', customCallId);
          setCall(currentCall);
          setCallingState('joining');
          
          // Unirse a la llamada existente
          await currentCall.join({ create: true });
          
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
          
          setCallingState('joined');
          onCallStarted?.(currentCall);
          
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Error al recuperar videollamada');
          setCallingState('idle');
          setCall(null);
        } finally {
          setIsStarting(false);
        }
      }
    };

    autoRecoverCall();
  }, [cita, client, isConnected, currentUser, callId, call, isStarting, onCallStarted]);

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

  // Función para iniciar llamada
  const startCall = useCallback(async () => {
    if (isStarting || isLoadingCall) {
      return; // Evitar múltiples llamadas simultáneas
    }

    setIsStarting(true);
    setError(null);

    try {
      if (!client || !isConnected || !currentUser || !cita) {
        throw new Error('Cliente de video no disponible o cita no encontrada');
      }

      const customCallId = callId || `cita-${cita._id}`;
      
      const currentCall = client.call('default', customCallId);
      
      // Siempre intentar crear la llamada primero, si no existe se creará automáticamente
      await currentCall.join({ create: true });
      setCall(currentCall);
      setCallingState('active');
      
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
      
      // Notificar que la llamada ha comenzado
      onCallStarted?.(currentCall);

    } catch (err) {
      console.error('Error starting call for cita:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar la llamada');
      setCall(null);
      setCallingState('idle');
    } finally {
      setIsStarting(false);
    }
  }, [client, isConnected, currentUser, cita, callId, isStarting, isLoadingCall, onCallStarted]);

  // Función para unirse a llamada existente
  const joinCall = useCallback(async () => {
    if (isStarting || isLoadingCall) {
      return; // Evitar múltiples llamadas simultáneas
    }

    setIsStarting(true);
    setError(null);

    try {
      
      if (!client || !isConnected || !currentUser || !cita) {
        throw new Error('Cliente de video no disponible o cita no encontrada');
      }

      const customCallId = callId || `cita-${cita._id}`;
      
      const currentCall = client.call('default', customCallId);
      
      // Unirse a llamada existente
      await currentCall.join();

      setCall(currentCall);
      setCallingState('active');
      
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
      
      // Notificar que la llamada ha comenzado
      onCallStarted?.(currentCall);

    } catch (err) {
      console.error('Error joining call for cita:', err);
      setError(err instanceof Error ? err.message : 'Error al unirse a la llamada');
      setCall(null);
      setCallingState('idle');
    } finally {
      setIsStarting(false);
    }
  }, [client, isConnected, currentUser, cita, callId, isStarting, isLoadingCall, onCallStarted]);

  // Función para iniciar llamada con configuración de cámara específica para citas
  const startCallWithSettings = useCallback(async (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    if (isStarting || isLoadingCall) {
      return; // Evitar múltiples llamadas simultáneas
    }

    setIsStarting(true);
    setError(null);

    try {
      
      if (!client || !isConnected || !currentUser || !cita) {
        throw new Error('Cliente de video no disponible o cita no encontrada');
      }

      const customCallId = callId || `cita-${cita._id}`;
      
      const currentCall = client.call('default', customCallId);
      
      // Siempre intentar crear la llamada primero, si no existe se creará automáticamente
      await currentCall.join({ create: true });

      setCall(currentCall);
      setCallingState('active');
      
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
      
      // Esperar un poco para que la llamada se estabilice antes de aplicar configuración
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aplicar configuración de cámara/micrófono después de unirse
      
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
        console.warn('Error configurando dispositivos:', deviceError);
        // No fallar la llamada por problemas de dispositivos
      }
      
      // Notificar que la llamada ha comenzado
      onCallStarted?.(currentCall);

    } catch (err) {
      console.error('Error starting call with settings for cita:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar la llamada con configuración');
      setCall(null);
      setCallingState('idle');
    } finally {
      setIsStarting(false);
    }
  }, [client, isConnected, currentUser, cita, callId, isStarting, isLoadingCall, onCallStarted]);

  // Función para alternar micrófono
  const toggleMic = useCallback(async () => {
    if (!call) return;
    
    try {
      if (call.microphone.state.status === 'enabled') {
        await call.microphone.disable();
      } else {
        await call.microphone.enable();
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  }, [call]);

  // Función para alternar cámara
  const toggleCamera = useCallback(async () => {
    if (!call) return;
    
    try {
      if (call.camera.state.status === 'enabled') {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  }, [call]);

  // Función para alternar pantalla compartida
  const toggleScreenShare = useCallback(async () => {
    if (!call) return;
    
    try {
      if (call.screenShare.enabled) {
        await call.screenShare.disable();
      } else {
        await call.screenShare.enable();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [call]);

  // Función para terminar la llamada
  const endCall = useCallback(async () => {
    if (!call) return;
    
    try {
      await call.leave();
      setCall(null);
      setParticipants([]);
      setLocalParticipant(null);
      setCallingState('idle');
      onCallEnded?.();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }, [call, onCallEnded]);

  return {
    call,
    isLoadingCall: isLoadingCall || isVideoClientLoading || isStarting,
    error: error || videoClientError,
    callingState,
    participants,
    localParticipant,
    otherParticipant,
    startCall,
    joinCall,
    startCallWithSettings,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    endCall,
  };
};
