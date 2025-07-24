/**
 * HOOK PARA GERENCIAR SERVICE WORKER PWA
 * Registra e controla o SW sem afetar funcionalidades existentes
 */

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  cacheStats?: any;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isOnline: navigator.onLine,
    updateAvailable: false
  });

  useEffect(() => {
    // Registrar Service Worker apenas se suportado
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Monitor de conexão
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setState(prev => ({ ...prev, isRegistered: true }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, updateAvailable: true }));
            }
          });
        }
      });

      console.log('✅ Service Worker registrado com sucesso');
    } catch (error) {
      console.error('⚠️ Falha ao registrar Service Worker:', error);
      setState(prev => ({ ...prev, isRegistered: false }));
    }
  };

  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
  };

  const getCacheStats = async (): Promise<any> => {
    if (!('serviceWorker' in navigator)) return null;

    const registration = await navigator.serviceWorker.ready;
    const messageChannel = new MessageChannel();

    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      registration.active?.postMessage(
        { type: 'GET_CACHE_STATS' },
        [messageChannel.port2]
      );
    });
  };

  const clearCache = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.ready;
    const messageChannel = new MessageChannel();

    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      registration.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  };

  return {
    ...state,
    updateServiceWorker,
    getCacheStats,
    clearCache
  };
}