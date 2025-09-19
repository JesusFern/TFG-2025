import { useContext } from 'react';
import { VideoContext } from '../contexts/VideoContextValue';

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo debe usarse dentro de VideoProvider');
  }
  return context;
};
