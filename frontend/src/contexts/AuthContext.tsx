import React, { useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types/profile';
import { AuthContext, AuthContextType } from './AuthContextValue';



interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la app
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('userData');
    
    console.log('🔍 Debug AuthContext - Token guardado:', savedToken ? 'Presente' : 'Ausente');
    console.log('🔍 Debug AuthContext - User guardado:', savedUser ? 'Presente' : 'Ausente');
    
    if (savedToken && savedUser) {
      try {
        // Validar que el token no haya expirado (JWT exp)
        const tokenPayload = JSON.parse(atob(savedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        console.log('🔍 Debug AuthContext - Token exp:', tokenPayload.exp);
        console.log('🔍 Debug AuthContext - Tiempo actual:', currentTime);
        
        if (tokenPayload.exp && tokenPayload.exp > currentTime) {
          // Token válido, restaurar usuario normalizando _id
          console.log('✅ Token válido, restaurando usuario');
          setToken(savedToken);
          const parsed = JSON.parse(savedUser) as UserProfile & { id?: string };
          const normalized: UserProfile = parsed._id
            ? parsed
            : { ...parsed, _id: (parsed.id as string) } as unknown as UserProfile;
          setUser(normalized);
        } else {
          // Token expirado, limpiar
          console.log('Token expirado, limpiando datos');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error parsing saved user data or token:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } else {
      console.log('❌ No hay token o usuario guardado');
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    // Normalizar _id si viene como id
    const normalized: UserProfile = (newUser as UserProfile & { id?: string })._id
      ? newUser
      : { ...newUser, _id: (newUser as unknown as { id?: string }).id || '' } as unknown as UserProfile;
    setUser(normalized);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userData', JSON.stringify(normalized));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    updateUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};