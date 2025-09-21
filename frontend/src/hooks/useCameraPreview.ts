import { useState, useRef, useEffect } from 'react';

interface CameraPreviewState {
  showCameraPreview: boolean;
  setShowCameraPreview: (show: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  videoEnabled: boolean;
  setVideoEnabled: (enabled: boolean) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  cameraError: string | null;
  setCameraError: (error: string | null) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  streamRef: React.RefObject<MediaStream | null>;
  handleStartCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  handleCancelPreview: () => void;
  handleCloseModal: () => void;
  handleJoinWithSettings: (onJoinCall: (settings: { videoEnabled: boolean; audioEnabled: boolean }) => Promise<void>) => Promise<void>;
}

export const useCameraPreview = (onClose: () => void): CameraPreviewState => {
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para la previsualización de cámara
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleStartCall = () => {
    setShowCameraPreview(true);
  };

  // Inicializar cámara cuando se muestra la previsualización
  useEffect(() => {
    if (showCameraPreview) {
      const initializeCamera = async () => {
        try {
          setIsLoading(true);
          setCameraError(null);
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          streamRef.current = mediaStream;
        } catch (err) {
          setCameraError('No se pudo acceder a la cámara o micrófono. Verifica los permisos.');
        } finally {
          setIsLoading(false);
        }
      };
      initializeCamera();
      
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
    }
  }, [showCameraPreview]);

  // Configurar video cuando hay stream
  useEffect(() => {
    if (streamRef.current && videoRef.current && showCameraPreview) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [showCameraPreview]);

  // Alternar video
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Alternar audio
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Unirse con configuración
  const handleJoinWithSettings = async (onJoinCall: (settings: { videoEnabled: boolean; audioEnabled: boolean }) => Promise<void>) => {
    try {
      setError(null);
      setShowCameraPreview(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      await onJoinCall({ videoEnabled, audioEnabled });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse a la videollamada');
      setShowCameraPreview(true);
    }
  };

  // Cancelar previsualización
  const handleCancelPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCameraPreview(false);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCameraPreview(false);
    setError(null);
    setCameraError(null);
    onClose();
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    showCameraPreview,
    setShowCameraPreview,
    error,
    setError,
    videoEnabled,
    setVideoEnabled,
    audioEnabled,
    setAudioEnabled,
    isLoading,
    setIsLoading,
    cameraError,
    setCameraError,
    videoRef,
    streamRef,
    handleStartCall,
    toggleVideo,
    toggleAudio,
    handleCancelPreview,
    handleCloseModal,
    handleJoinWithSettings,
  };
};
