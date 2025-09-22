import { useState, useCallback } from 'react';
import { getOptimizedImageForStream, isImageTooBigForStream } from '../utils/imageOptimizer';

/**
 * Hook para manejar la optimización de imágenes para Stream.io
 */
export const useImageOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  const optimizeImage = useCallback(async (imageUrl: string | null | undefined) => {
    if (!imageUrl) {
      return undefined;
    }

    setIsOptimizing(true);
    setOptimizationError(null);

    try {
      const optimizedImage = await getOptimizedImageForStream(imageUrl);
      return optimizedImage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al optimizar imagen';
      setOptimizationError(errorMessage);
      console.warn('Error al optimizar imagen:', error);
      return undefined;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const checkIfImageNeedsOptimization = useCallback((imageUrl: string | null | undefined): boolean => {
    if (!imageUrl) return false;
    return isImageTooBigForStream(imageUrl);
  }, []);

  return {
    optimizeImage,
    checkIfImageNeedsOptimization,
    isOptimizing,
    optimizationError,
  };
};
