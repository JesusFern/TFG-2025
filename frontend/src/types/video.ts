export interface VideoCall {
  id: string;
  type: 'default' | 'livestream' | 'audio_room';
  created_by_id: string;
  created_at: string;
  updated_at: string;
  ended_at?: string;
  custom: {
    title?: string;
    description?: string;
  };
}

export interface VideoCallParticipant {
  user_id: string;
  role: 'user' | 'admin' | 'moderator';
  joined_at?: string;
  left_at?: string;
}

export interface VideoCallState {
  call: VideoCall | null;
  participants: VideoCallParticipant[];
  isActive: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  error: string | null;
}

export interface VideoCallSettings {
  audio: boolean;
  video: boolean;
  screenShare: boolean;
  recording: boolean;
}
