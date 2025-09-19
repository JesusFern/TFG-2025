import { createContext } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';

export interface VideoContextType {
  client: StreamVideoClient | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  initializeClient: () => Promise<void>;
  disconnect: () => void;
}

export const VideoContext = createContext<VideoContextType | undefined>(undefined);
