import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  plan: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Detecta automaticamente qual sistema de auth usar
const detectAuthSystem = () => {
  // Permitir troca manual via localStorage para flexibilidade
  const authSystem = localStorage.getItem('vendzz_auth_system');
  
  if (authSystem === 'postgres') return 'postgres';
  if (authSystem === 'jwt') return 'postgres'; // Alias para postgres/jwt
  
  // Padrão: SQLite para desenvolvimento local independente
  return 'sqlite';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authSystem = detectAuthSystem();

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Verificar se token é válido
      checkCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkCurrentUser = async (): Promise<User> => {
    const endpoint = authSystem === 'sqlite' ? '/api/user' : '/api/user';
    return await apiRequest("GET", endpoint);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Detecta automaticamente qual endpoint usar
      const endpoint = authSystem === 'sqlite' ? '/api/auth/login' : '/api/login';
      const response = await apiRequest("POST", endpoint, {
        email,
        password,
      });

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }): Promise<void> => {
    setIsLoading(true);
    try {
      // Detecta automaticamente qual endpoint usar
      const endpoint = authSystem === 'sqlite' ? '/api/auth/register' : '/api/register';
      const response = await apiRequest("POST", endpoint, userData);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const endpoint = authSystem === 'sqlite' ? '/api/auth/logout' : '/api/logout';
      await apiRequest("POST", endpoint);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}