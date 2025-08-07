import React, { createContext, useContext, useEffect, useState } from "react";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto refresh token when it expires
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (!refreshTokenValue) {
        throw new Error("No refresh token");
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      return data.accessToken;
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      throw error;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401) {
          // Token expired, try to refresh
          try {
            await refreshToken();
            // Retry verification with new token
            const newToken = localStorage.getItem("accessToken");
            const retryResponse = await fetch("/api/auth/verify", {
              headers: { "Authorization": `Bearer ${newToken}` }
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              setUser(retryData.user);
            } else {
              throw new Error("Token refresh failed");
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
          }
        } else {
          throw new Error("Authentication failed");
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      
      // Refresh page to update all components
      window.location.reload();
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      
      // Refresh page to update all components
      window.location.reload();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};