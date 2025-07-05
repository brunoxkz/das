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

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Detecta automaticamente qual endpoint usar
      const endpoint = authSystem === 'sqlite' ? '/api/user' : '/api/me';
      const response = await apiRequest("GET", endpoint);
      setUser(response);
    } catch (error) {
      console.log("Auth check failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
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
      
      // Forçar redirecionamento após login bem-sucedido
      window.location.href = "/";
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      // Detecta automaticamente qual endpoint usar
      const endpoint = authSystem === 'sqlite' ? '/api/auth/register' : '/api/register';
      const response = await apiRequest("POST", endpoint, userData);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setUser(response.user);
      
      // Forçar redirecionamento após registro bem-sucedido
      window.location.href = "/";
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Detecta automaticamente qual endpoint usar
      const endpoint = authSystem === 'sqlite' ? '/api/auth/logout' : '/api/logout';
      await apiRequest("POST", endpoint);
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      window.location.href = "/login";
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, isAuthenticated }}>
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