import { useCallback } from 'react';
import { useVideoCallBase } from './useVideoCallBase';
import { Call } from '@stream-io/video-react-sdk';
import { Cita } from '../types/citas';

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
  const baseVideoCall = useVideoCallBase({ onCallEnded, onCallStarted });

  // NOTA: Se eliminó la conexión automática a videollamadas
  // Ahora el usuario debe hacer clic explícitamente en "Unirse" para conectarse

  // Función para iniciar llamada
  const startCall = useCallback(async () => {
    if (!cita) {
      baseVideoCall.setError('Cita no encontrada');
      return;
    }

    const customCallId = callId || `cita-${cita._id}`;
    await baseVideoCall.startCallWithValidation(customCallId);
  }, [cita, callId, baseVideoCall]);

  // Función para unirse a llamada existente
  const joinCall = useCallback(async () => {
    if (!cita) {
      baseVideoCall.setError('Cita no encontrada');
      return;
    }

    const customCallId = callId || `cita-${cita._id}`;
    await baseVideoCall.startCallWithValidation(customCallId);
  }, [cita, callId, baseVideoCall]);

  // Función para iniciar llamada con configuración de cámara específica para citas
  const startCallWithSettings = useCallback(async (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    if (!cita) {
      baseVideoCall.setError('Cita no encontrada');
      return;
    }

    const customCallId = callId || `cita-${cita._id}`;
    await baseVideoCall.startCallWithValidation(customCallId, settings);
  }, [cita, callId, baseVideoCall]);

  return {
    call: baseVideoCall.call,
    isLoadingCall: baseVideoCall.isLoadingCall,
    error: baseVideoCall.error,
    callingState: baseVideoCall.callingState,
    participants: baseVideoCall.participants,
    localParticipant: baseVideoCall.localParticipant,
    otherParticipant: baseVideoCall.otherParticipant,
    startCall,
    joinCall,
    startCallWithSettings,
    toggleMic: baseVideoCall.toggleMic,
    toggleCamera: baseVideoCall.toggleCamera,
    toggleScreenShare: baseVideoCall.toggleScreenShare,
    endCall: baseVideoCall.endCall,
  };
};