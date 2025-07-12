/**
 * HOOK DE SERVICE WORKER - PWA COM CACHE INTELIGENTE
 * Registra e gerencia service worker para performance extrema
 */

import { useEffect, useState } from 'react';

interface ServiceWorkerStats {
  hits: number;
  misses: number;
  errors: number;
  totalRequests: number;
  hitRate: string;
  uptime: string;
}

interface ServiceWorkerState {
  isRegistered: boolean;
  isActive: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  hasError: boolean;
  stats: ServiceWorkerStats | null;
  error?: string;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isActive: false,
    isInstalling: false,
    isWaiting: false,
    hasError: false,
    stats: null
  });

  useEffect(() => {
    // Verificar suporte a service worker
    if (!('serviceWorker' in navigator)) {
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        error: 'Service Worker não suportado neste navegador' 
      }));
      return;
    }

    registerServiceWorker();
  }, []);

  const registerServiceWorker = async () => {
    try {
      setState(prev => ({ ...prev, isInstalling: true }));
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      setState(prev => ({ 
        ...prev, 
        isRegistered: true, 
        isInstalling: false 
      }));

      // Verificar se já está ativo
      if (registration.active) {
        setState(prev => ({ ...prev, isActive: true }));
      }

      // Listener para mudanças de estado
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          setState(prev => ({ ...prev, isInstalling: true }));
          
          newWorker.addEventListener('statechange', () => {
            switch (newWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, isWaiting: true, isInstalling: false }));
                } else {
                  setState(prev => ({ ...prev, isActive: true, isInstalling: false }));
                }
                break;
              case 'activated':
                setState(prev => ({ ...prev, isActive: true, isWaiting: false }));
                break;
            }
          });
        }
      });

      // Listener para atualizações
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      console.log('🚀 PWA Service Worker registrado');
      
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isInstalling: false 
      }));
    }
  };

  const skipWaiting = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const getCacheStats = async (): Promise<ServiceWorkerStats | null> => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_STATS' },
        [messageChannel.port2]
      );
    });
  };

  const clearCache = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      return false;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  };

  const updateStats = async () => {
    const stats = await getCacheStats();
    if (stats) {
      setState(prev => ({ ...prev, stats }));
    }
  };

  // Atualizar stats a cada 30 segundos quando ativo
  useEffect(() => {
    if (state.isActive) {
      updateStats();
      
      const interval = setInterval(updateStats, 30000);
      return () => clearInterval(interval);
    }
  }, [state.isActive]);

  return {
    ...state,
    skipWaiting,
    getCacheStats,
    clearCache,
    updateStats,
    refresh: registerServiceWorker
  };
}

/**
 * HOOK PARA NOTIFICAÇÕES DE ATUALIZAÇÃO
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
      }
    });

    // Verificar se há update disponível no registro
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setUpdateAvailable(true);
      }
    });
  }, []);

  const applyUpdate = async () => {
    if (!('serviceWorker' in navigator)) return;

    setIsUpdating(true);
    
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    window.location.reload();
  };

  return {
    updateAvailable,
    isUpdating,
    applyUpdate
  };
}

console.log('🔧 Service Worker hooks carregados');