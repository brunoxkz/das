import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  plan: string;
  profileImageUrl?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Verify token with server
      fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, remove it
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      })
      .catch(() => {
        // Token verification failed, remove it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } else {
      throw new Error(data.message || "Login failed");
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } else {
      throw new Error(data.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
  };
}