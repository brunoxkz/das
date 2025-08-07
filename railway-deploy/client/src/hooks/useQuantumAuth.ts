import { useState, useEffect } from 'react';

// Interface para dados do usuário Quantum
interface QuantumUser {
  id: string;
  email: string;
  name: string;
}

// Hook de autenticação independente para Quantum Tasks
export const useQuantumAuth = () => {
  const [user, setUser] = useState<QuantumUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const storedUser = localStorage.getItem('quantum-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Limpar dados corrompidos
        localStorage.removeItem('quantum-user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login simples para demo
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Demo login - aceita qualquer email/senha para simplicidade
    if (email && password) {
      const userData: QuantumUser = {
        id: 'quantum-user-1',
        email: email,
        name: email.split('@')[0]
      };
      
      localStorage.setItem('quantum-user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('quantum-user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  };
};