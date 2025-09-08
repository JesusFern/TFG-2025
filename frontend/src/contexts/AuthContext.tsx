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
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
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
          // Token válido, restaurar usuario
          console.log('✅ Token válido, restaurando usuario');
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          // Token expirado, limpiar
          console.log('❌ Token expirado, limpiando datos');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('❌ Error parsing saved user data or token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('❌ No hay token o usuario guardado');
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
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
