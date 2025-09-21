import { useCallback } from 'react';
import { useVideoCallBase } from './useVideoCallBase';
import { Call } from '@stream-io/video-react-sdk';
import { Conversacion } from '../types/chat';

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

export const useVideoCall = ({ 
  conversation, 
  callId, 
  onCallEnded, 
  onCallStarted 
}: UseVideoCallProps) => {
  const baseVideoCall = useVideoCallBase({ onCallEnded, onCallStarted });

  // Función para iniciar llamada
  const startCall = useCallback(async () => {
    if (!conversation) {
      baseVideoCall.setError('Conversación no encontrada');
      return;
    }

    const customCallId = callId || `conversation-${conversation._id}`;
    await baseVideoCall.startCallWithValidation(customCallId);
  }, [conversation, callId, baseVideoCall]);

  // Función para unirse a llamada existente
  const joinCall = useCallback(async () => {
    if (!conversation) {
      baseVideoCall.setError('Conversación no encontrada');
      return;
    }

    const customCallId = callId || `conversation-${conversation._id}`;
    await baseVideoCall.startCallWithValidation(customCallId);
  }, [conversation, callId, baseVideoCall]);

  // Función para iniciar llamada con configuración de cámara
  const startCallWithSettings = useCallback(async (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    if (!conversation) {
      baseVideoCall.setError('Conversación no encontrada');
      return;
    }

    const customCallId = callId || `conversation-${conversation._id}`;
    await baseVideoCall.startCallWithValidation(customCallId, settings);
  }, [conversation, callId, baseVideoCall]);

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