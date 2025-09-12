import { useMemo } from 'react';
import { getUserData } from '../services/authService';

export const usePermissions = () => {
  const user = getUserData();
  
  const hasPermission = useMemo(() => {
    return user && (user.role === 'worker' || user.role === 'admin');
  }, [user]);
  
  return {
    user,
    hasPermission,
    workerId: user?._id || null
  };
};
