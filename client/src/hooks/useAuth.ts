
import { useQuery, useQueryClient } from "@tanstack/react-query";

async function fetchUser() {
  const token = localStorage.getItem("accessToken");
  
  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch("/api/auth/user", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Try to refresh token if access token expired
    if (response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (refreshToken) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();
          localStorage.setItem("accessToken", tokens.accessToken);
          localStorage.setItem("refreshToken", tokens.refreshToken);
          
          // Retry original request with new token
          const retryResponse = await fetch("/api/auth/user", {
            headers: {
              "Authorization": `Bearer ${tokens.accessToken}`,
            },
          });
          
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
      }
      
      // Clear invalid tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    logout,
  };
}
