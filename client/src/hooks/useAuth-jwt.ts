import { useState, useEffect } from "react";
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

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("Checking authentication, token exists:", !!token);
    
    if (token) {
      // Verify token with server
      fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      .then(async res => {
        console.log("Token verification response:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("User data:", data.user);
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          console.log("Token verification failed");
          // Token is invalid, remove it
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsAuthenticated(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.error("Token verification error:", error);
        // Token verification failed, remove it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      console.log("No token found, user not authenticated");
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Attempting login for:", email);
    
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response:", response.status, data);

    if (response.ok) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      setIsAuthenticated(true);
      console.log("Login successful, user authenticated");
      
      // Force a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force immediate page refresh to trigger auth state check
      console.log("Triggering page refresh to update auth state");
      window.location.href = "/dashboard";
      
      return data;
    } else {
      console.error("Login failed:", data.message);
      throw new Error(data.message || "Login failed");
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    console.log("Attempting register for:", userData.email);
    
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("Register response:", response.status, data);

    if (response.ok) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      setIsAuthenticated(true);
      console.log("Registration successful, user authenticated");
      
      // Force a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force immediate page refresh to trigger auth state check
      console.log("Triggering page refresh to update auth state");
      window.location.href = "/dashboard";
      
      return data;
    } else {
      console.error("Registration failed:", data.message);
      throw new Error(data.message || "Registration failed");
    }
  };

  const logout = () => {
    console.log("Logging out user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
    
    // Optional: call logout endpoint
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }
    }).catch(console.error);
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