import { QueryClient } from "@tanstack/react-query";

// Query Client independente para Quantum Tasks - SEM redirecionamentos para Vendzz
const quantumQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      refetchOnWindowFocus: false,
      queryFn: async ({ queryKey }: any) => {
        const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
        
        try {
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            // Para Quantum Tasks, NÃO redirecionar - apenas falhar silenciosamente
            console.log(`Quantum API error: ${response.status} - ${url}`);
            return {}; // Retorna objeto vazio em vez de erro
          }
          
          return await response.json();
        } catch (error) {
          console.log(`Quantum API request failed: ${url}`, error);
          return {}; // Retorna objeto vazio em vez de erro
        }
      },
    },
  },
});

export default quantumQueryClient;