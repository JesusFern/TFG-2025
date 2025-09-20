import { useState, useEffect, useCallback } from 'react';
import { useVideo } from './useVideo';
import { Call } from '@stream-io/video-react-sdk';
import { Conversacion } from '../types/chat';
import { useAuth } from './useAuth';

interface StreamParticipant {
  userId: string;
  name?: string;
  image?: string;
  publishedTracks?: {
    audioTrack?: boolean;
    videoTrack?: boolean;
    screenShareTrack?: boolean;
  };
}

interface StreamLocalParticipant {
  publishedTracks?: {
    audioTrack?: boolean;
    videoTrack?: boolean;
    screenShareTrack?: boolean;
  };
}

interface UseVideoCallProps {
  conversation?: Conversacion;
  callType: 'start' | 'join';
  callId?: string;
  onCallEnded?: () => void;
  cameraSettings?: {
    videoEnabled: boolean;
    audioEnabled: boolean;
  };
  onCallStarted?: (call: Call) => void;
}

export const useVideoCall = ({ conversation, callType, callId, onCallEnded, cameraSettings, onCallStarted }: UseVideoCallProps) => {
  const { client, isConnected, isLoading: isVideoClientLoading, error: videoClientError } = useVideo();
  const { user: currentUser } = useAuth();
  const [call, setCall] = useState<Call | null>(null);
  const [isLoadingCall, setIsLoadingCall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<StreamParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<StreamLocalParticipant | null>(null);
  const [callingState, setCallingState] = useState<string>('idle');
  const [isStarting, setIsStarting] = useState(false);

  const otherParticipant = participants.find(p => p.userId !== currentUser?._id);

  const setupCall = useCallback(async () => {
    if (!client || !isConnected || !currentUser || !conversation) {
      setIsLoadingCall(false);
      return;
    }

    setIsLoadingCall(true);
    setError(null);

    try {
      const customCallId = callId || `chat-${conversation._id}`;
      const currentCall = client.call('default', customCallId);
      
      if (callType === 'start') {
        // Crear y unirse a la llamada
        await currentCall.join({ create: true });
      } else {
        // Solo unirse a una llamada existente
        await currentCall.join();
      }

      setCall(currentCall);
      setCallingState('active');
      
      // Configurar estado inicial
      setParticipants(currentCall.state.participants as StreamParticipant[]);
      setLocalParticipant(currentCall.state.localParticipant as StreamLocalParticipant);
      
      // Notificar que la llamada ha comenzado
      onCallStarted?.(currentCall);

    } catch (err) {
      console.error('Error setting up video call:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al configurar la llamada.');
      setCall(null);
      setCallingState('idle');
    } finally {
      setIsLoadingCall(false);
    }
  }, [client, isConnected, currentUser, conversation, callType, callId, onCallStarted]);

  // Función para iniciar la llamada manualmente
  const startCall = useCallback(async () => {
    if (isStarting || isLoadingCall) {
      return; // Evitar múltiples llamadas simultáneas
    }

    setIsStarting(true);
    setError(null);

    try {
      if (call) {
        // Aplicar configuración de cámara/micrófono
        if (cameraSettings?.videoEnabled) {
          await call.camera.enable();
        } else {
          await call.camera.disable();
        }
        
        if (cameraSettings?.audioEnabled) {
          await call.microphone.enable();
        } else {
          await call.microphone.disable();
        }
      } else {
        await setupCall();
        // La configuración se aplicará en el useEffect cuando call cambie
      }
    } catch (err) {
      console.error('Error enabling camera/microphone:', err);
      setError('Error al acceder a la cámara o micrófono');
    } finally {
      setIsStarting(false);
    }
  }, [call, setupCall, isStarting, isLoadingCall, cameraSettings]);

  // Función para unirse a una llamada existente
  const joinCall = useCallback(async () => {
    if (isStarting || isLoadingCall) {
      return; // Evitar múltiples llamadas simultáneas
    }

    setIsStarting(true);
    setError(null);

    try {
      await setupCall();
      // Aplicar configuración de cámara/micrófono después de unirse
      if (call) {
        if (cameraSettings?.videoEnabled) {
          await call.camera.enable();
        } else {
          await call.camera.disable();
        }
        
        if (cameraSettings?.audioEnabled) {
          await call.microphone.enable();
        } else {
          await call.microphone.disable();
        }
      }
    } catch (err) {
      console.error('Error joining call:', err);
      setError('Error al unirse a la llamada');
    } finally {
      setIsStarting(false);
    }
  }, [setupCall, isStarting, isLoadingCall, call, cameraSettings]);

  // Aplicar configuración de cámara cuando la llamada esté lista
  useEffect(() => {
    const applyCameraSettings = async () => {
      if (call && cameraSettings) {
        try {
          if (cameraSettings.videoEnabled) {
            await call.camera.enable();
          } else {
            await call.camera.disable();
          }
          
          if (cameraSettings.audioEnabled) {
            await call.microphone.enable();
          } else {
            await call.microphone.disable();
          }
        } catch (err) {
          console.error('Error applying camera settings:', err);
        }
      }
    };

    applyCameraSettings();
  }, [call, cameraSettings]);

  // Cleanup cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (call) {
        call.leave().catch(e => console.error('Error leaving call:', e));
        setCall(null);
        setParticipants([]);
        setLocalParticipant(null);
        setCallingState('idle');
      }
    };
  }, [call]);

  const toggleMic = useCallback(async () => {
    if (call) {
      try {
        if (call.microphone.enabled) {
          await call.microphone.disable();
        } else {
          await call.microphone.enable();
        }
      } catch (err) {
        console.error('Error toggling microphone:', err);
      }
    }
  }, [call]);

  const toggleCamera = useCallback(async () => {
    if (call) {
      try {
        if (call.camera.enabled) {
          await call.camera.disable();
        } else {
          await call.camera.enable();
        }
      } catch (err) {
        console.error('Error toggling camera:', err);
      }
    }
  }, [call]);

  const toggleScreenShare = useCallback(async () => {
    if (call) {
      try {
        if (call.screenShare.enabled) {
          await call.screenShare.disable();
        } else {
          await call.screenShare.enable();
        }
      } catch (err) {
        console.error('Error toggling screen share:', err);
      }
    }
  }, [call]);

  const endCall = useCallback(async () => {
    if (call) {
      try {
        // Verificar si la llamada aún está activa antes de intentar salir
        const currentState = call.state.callingState;
        if (currentState === 'joined' || currentState === 'joining' || currentState === 'ringing') {
          await call.leave();
        }
      } catch (err) {
        console.error('Error leaving call:', err);
        // No relanzar el error, solo loguearlo
      } finally {
        // Siempre limpiar el estado local
        setCall(null);
        setParticipants([]);
        setLocalParticipant(null);
        setCallingState('idle');
        onCallEnded?.();
      }
    }
  }, [call, onCallEnded]);

  // Función para iniciar llamada con configuración de cámara
  const startCallWithSettings = useCallback(async (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    if (isStarting || isLoadingCall) {
      return; // Evitar múltiples llamadas simultáneas
    }

    setIsStarting(true);
    setError(null);

    try {
      console.log('🚀 Iniciando videollamada con configuración:', settings);
      console.log('📊 Estado del cliente:', { client: !!client, isConnected, currentUser: !!currentUser, conversation: !!conversation });
      
      if (!client || !isConnected || !currentUser || !conversation) {
        throw new Error('Cliente de video no disponible');
      }

      const customCallId = callId || `chat-${conversation._id}`;
      console.log('🔗 ID de llamada:', customCallId);
      
      const currentCall = client.call('default', customCallId);
      
      if (callType === 'start') {
        console.log('📞 Creando nueva llamada...');
        // Crear y unirse a la llamada
        await currentCall.join({ create: true });
      } else {
        console.log('📞 Uniéndose a llamada existente...');
        // Solo unirse a una llamada existente
        await currentCall.join();
      }

      console.log('✅ Llamada creada exitosamente');
      setCall(currentCall);
      setCallingState('active');
      
      // Configurar estado inicial
      setParticipants(currentCall.state.participants as StreamParticipant[]);
      setLocalParticipant(currentCall.state.localParticipant as StreamLocalParticipant);
      
      // Aplicar configuración de cámara/micrófono después de unirse
      console.log('🎥 Aplicando configuración de cámara/micrófono:', settings);
      
      if (settings.videoEnabled) {
        await currentCall.camera.enable();
        console.log('✅ Cámara habilitada');
      } else {
        await currentCall.camera.disable();
        console.log('❌ Cámara deshabilitada');
      }
      
      if (settings.audioEnabled) {
        await currentCall.microphone.enable();
        console.log('✅ Micrófono habilitado');
      } else {
        await currentCall.microphone.disable();
        console.log('❌ Micrófono deshabilitado');
      }
      
      console.log('🎉 Notificando inicio de llamada');
      // Notificar que la llamada ha comenzado
      onCallStarted?.(currentCall);

    } catch (err) {
      console.error('Error starting call with settings:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar la llamada con configuración');
      setCall(null);
      setCallingState('idle');
    } finally {
      setIsStarting(false);
    }
  }, [client, isConnected, currentUser, conversation, callType, callId, isStarting, isLoadingCall, onCallStarted]);

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
