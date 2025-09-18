import { useState } from 'react';

export const useLoadingState = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const setErrorState = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  const reset = () => {
    setLoading(false);
    setError(null);
  };

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setErrorState,
    reset
  };
};
