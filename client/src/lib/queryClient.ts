import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { localCache } from "./performance";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Overloaded function signatures for backward compatibility
export async function apiRequest(method: string, url: string, data?: any): Promise<any>;
export async function apiRequest(url: string, options?: RequestInit): Promise<any>;

export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | RequestInit,
  data?: any
): Promise<any> {
  const token = localStorage.getItem("accessToken");

  let method: string;
  let url: string;
  let options: RequestInit;

  // Handle both signature styles
  if (typeof urlOrOptions === "string") {
    // New style: apiRequest(method, url, data)
    method = methodOrUrl;
    url = urlOrOptions;
    options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
    };
    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }
  } else {
    // Old style: apiRequest(url, options)
    url = methodOrUrl;
    options = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      ...urlOrOptions,
    };
    method = options.method || "GET";
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    // Handle token refresh for expired tokens
    if (response.status === 401 && token) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
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
            const retryOptions: RequestInit = {
              ...options,
              headers: {
                ...options.headers,
                "Authorization": `Bearer ${tokens.accessToken}`,
              },
            };

            const retryResponse = await fetch(url, retryOptions);

            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }

      // Clear invalid tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }

    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("accessToken");
    
    const res = await fetch(queryKey[0] as string, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Handle token refresh for expired tokens
    if (res.status === 401 && token) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
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
            const retryResponse = await fetch(queryKey[0] as string, {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokens.accessToken}`,
              },
            });

            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }

      // Clear invalid tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Rate limiting e deduplicação para 100k+ usuários simultâneos
const requestQueue = new Map<string, Promise<any>>();

async function deduplicatedFetch(url: string, options: RequestInit = {}) {
  const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;
  
  // Verificar cache local primeiro para GET requests
  if (!options.method || options.method === 'GET') {
    const cached = localCache.get(cacheKey);
    if (cached) return cached;
  }
  
  // Deduplicar requisições simultâneas
  if (requestQueue.has(cacheKey)) {
    return requestQueue.get(cacheKey);
  }

  const promise = fetch(url, {
    ...options,
    headers: {
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": options.method === 'GET' ? "max-age=300" : "no-cache",
      ...options.headers,
    },
  }).then(async (response) => {
    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      throw new Error("Rate limit exceeded, retrying...");
    }
    
    const result = response.ok ? await response.json() : response;
    
    // Cache successful GET requests
    if (response.ok && (!options.method || options.method === 'GET')) {
      const cacheTime = response.headers.get("X-Cache") === "HIT" ? 30000 : 300000;
      localCache.set(cacheKey, result, cacheTime);
    }
    
    return result;
  }).finally(() => {
    requestQueue.delete(cacheKey);
  });

  requestQueue.set(cacheKey, promise);
  return promise;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 segundos (otimizado para sincronização rápida)
      gcTime: 5 * 60 * 1000, // 5 minutos no garbage collector
      retry: (failureCount, error: any) => {
        // Retry otimizado para alta concorrência
        if (error?.message?.includes("Rate limit")) {
          return failureCount < 3; // Retry até 3x para rate limit
        }
        if (error?.message?.includes("500") || error?.message?.includes("502")) {
          return failureCount < 2; // Retry para erros de servidor
        }
        return false; // Não retry para outros erros
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff com jitter para evitar thundering herd
        const baseDelay = Math.min(1000 * Math.pow(2, attemptIndex), 30000);
        const jitter = Math.random() * 1000; // 0-1000ms de jitter
        return baseDelay + jitter;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.message?.includes("Rate limit")) {
          return failureCount < 2;
        }
        return false;
      },
      retryDelay: 2000,
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});