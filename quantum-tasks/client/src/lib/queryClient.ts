const API_BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add authentication token if available
  const token = localStorage.getItem('quantum_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    ...options,
  };

  // Add body for POST, PUT, PATCH requests
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the default error message
      }
      
      throw new ApiError(errorMessage, response.status, response.statusText);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Request failed',
      0,
      'Network Error'
    );
  }
}

// Default query function for React Query
export const defaultQueryFn = async ({ queryKey }: { queryKey: any[] }) => {
  const [endpoint, ...params] = queryKey;
  
  if (typeof endpoint !== 'string') {
    throw new Error('Query key must start with a string endpoint');
  }
  
  // Build URL with query parameters if provided
  let url = endpoint;
  if (params.length > 0) {
    const searchParams = new URLSearchParams();
    params.forEach((param, index) => {
      if (param !== undefined && param !== null) {
        searchParams.set(`param${index}`, String(param));
      }
    });
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
  }
  
  return apiRequest('GET', url);
};

// Utility functions for common patterns
export const mutationFn = {
  post: (endpoint: string) => (data: any) => apiRequest('POST', endpoint, data),
  put: (endpoint: string) => (data: any) => apiRequest('PUT', endpoint, data),
  patch: (endpoint: string) => (data: any) => apiRequest('PATCH', endpoint, data),
  delete: (endpoint: string) => (id?: string | number) => 
    apiRequest('DELETE', id ? `${endpoint}/${id}` : endpoint),
};

// Query key factories
export const queryKeys = {
  // Auth
  auth: {
    user: () => ['/auth/me'] as const,
  },
  
  // Tasks
  tasks: {
    all: () => ['/tasks'] as const,
    byId: (id: string) => ['/tasks', id] as const,
    byProject: (projectId: string) => ['/tasks', { projectId }] as const,
    byStatus: (status: string) => ['/tasks', { status }] as const,
    search: (query: string) => ['/tasks/search', query] as const,
  },
  
  // Projects
  projects: {
    all: () => ['/projects'] as const,
    byId: (id: string) => ['/projects', id] as const,
    stats: (id: string) => ['/projects', id, 'stats'] as const,
  },
  
  // Recurring patterns
  recurring: {
    patterns: () => ['/recurring/patterns'] as const,
    patternById: (id: string) => ['/recurring/patterns', id] as const,
    reminders: (taskId: string) => ['/recurring/reminders/task', taskId] as const,
  },
  
  // Email
  email: {
    accounts: () => ['/email/accounts'] as const,
    messages: (accountId: string) => ['/email/messages', accountId] as const,
    unread: () => ['/email/unread'] as const,
  },
  
  // System
  system: {
    health: () => ['/health'] as const,
    status: () => ['/status'] as const,
  },
};