/**
 * SMART PRELOADING HOOK
 * Preload inteligente baseado no comportamento do usuário
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface PreloadConfig {
  enabled?: boolean;
  mouseHoverDelay?: number;
  intersectionThreshold?: number;
  maxPreloads?: number;
}

interface PreloadableLink {
  href: string;
  queryKey: string[];
  priority: 'high' | 'medium' | 'low';
}

export function useSmartPreload(config: PreloadConfig = {}) {
  const {
    enabled = true,
    mouseHoverDelay = 100,
    intersectionThreshold = 0.1,
    maxPreloads = 10
  } = config;

  const queryClient = useQueryClient();
  const preloadedUrls = useRef<Set<string>>(new Set());
  const hoverTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  // Preload de dados baseado em queryKey
  const preloadData = useCallback(async (queryKey: string[], url: string) => {
    if (!enabled || preloadedUrls.current.has(url)) return;
    
    if (preloadedUrls.current.size >= maxPreloads) {
      // Remover o mais antigo
      const [firstUrl] = preloadedUrls.current;
      preloadedUrls.current.delete(firstUrl);
    }

    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => fetch(url).then(res => res.json()),
        staleTime: 60000, // 1 minuto
      });
      
      preloadedUrls.current.add(url);
      console.log(`🚀 Preloaded: ${url}`);
    } catch (error) {
      console.warn(`⚠️ Preload falhou: ${url}`, error);
    }
  }, [enabled, maxPreloads, queryClient]);

  // Preload baseado em hover do mouse
  const handleMouseEnter = useCallback((link: PreloadableLink) => {
    if (!enabled) return;

    const timeout = setTimeout(() => {
      preloadData(link.queryKey, link.href);
    }, mouseHoverDelay);

    hoverTimeouts.current.set(link.href, timeout);
  }, [enabled, mouseHoverDelay, preloadData]);

  const handleMouseLeave = useCallback((href: string) => {
    const timeout = hoverTimeouts.current.get(href);
    if (timeout) {
      clearTimeout(timeout);
      hoverTimeouts.current.delete(href);
    }
  }, []);

  // Preload baseado em visibilidade (Intersection Observer)
  const observeElement = useCallback((element: HTMLElement, link: PreloadableLink) => {
    if (!enabled || !intersectionObserver.current) return;

    element.dataset.preloadHref = link.href;
    element.dataset.preloadQueryKey = JSON.stringify(link.queryKey);
    element.dataset.preloadPriority = link.priority;

    intersectionObserver.current.observe(element);
  }, [enabled]);

  // Inicializar Intersection Observer
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const href = element.dataset.preloadHref;
            const queryKeyStr = element.dataset.preloadQueryKey;
            const priority = element.dataset.preloadPriority as 'high' | 'medium' | 'low';

            if (href && queryKeyStr) {
              const queryKey = JSON.parse(queryKeyStr);
              
              // Delay baseado na prioridade
              const delay = priority === 'high' ? 0 : priority === 'medium' ? 500 : 1000;
              
              setTimeout(() => {
                preloadData(queryKey, href);
              }, delay);

              // Parar de observar após preload
              intersectionObserver.current?.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: intersectionThreshold,
        rootMargin: '50px' // Preload quando elemento está 50px da viewport
      }
    );

    return () => {
      intersectionObserver.current?.disconnect();
    };
  }, [enabled, intersectionThreshold, preloadData]);

  // Preload de rotas comuns baseado no padrão de navegação
  const preloadCommonRoutes = useCallback(() => {
    if (!enabled) return;

    const commonRoutes = [
      { href: '/api/dashboard', queryKey: ['dashboard'], priority: 'high' as const },
      { href: '/api/quizzes', queryKey: ['quizzes'], priority: 'medium' as const },
      { href: '/api/analytics', queryKey: ['analytics'], priority: 'low' as const }
    ];

    // Preload rotas mais comuns após 2 segundos
    setTimeout(() => {
      commonRoutes.forEach(route => {
        preloadData(route.queryKey, route.href);
      });
    }, 2000);
  }, [enabled, preloadData]);

  // Preload baseado em histórico de navegação
  const preloadBasedOnHistory = useCallback(() => {
    if (!enabled || typeof localStorage === 'undefined') return;

    try {
      const navHistory = JSON.parse(localStorage.getItem('nav-history') || '[]');
      const mostVisited = navHistory
        .reduce((acc: any, path: string) => {
          acc[path] = (acc[path] || 0) + 1;
          return acc;
        }, {});

      // Preload top 3 páginas mais visitadas
      Object.entries(mostVisited)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .forEach(([path]) => {
          if (path.startsWith('/api/')) {
            preloadData([path], path);
          }
        });
    } catch (error) {
      console.warn('Erro ao ler histórico de navegação:', error);
    }
  }, [enabled, preloadData]);

  // Função para registrar navegação no histórico
  const trackNavigation = useCallback((path: string) => {
    if (typeof localStorage === 'undefined') return;

    try {
      const history = JSON.parse(localStorage.getItem('nav-history') || '[]');
      history.push(path);
      
      // Manter apenas últimas 50 navegações
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      localStorage.setItem('nav-history', JSON.stringify(history));
    } catch (error) {
      console.warn('Erro ao salvar histórico:', error);
    }
  }, []);

  // Auto-inicialização
  useEffect(() => {
    if (enabled) {
      preloadCommonRoutes();
      preloadBasedOnHistory();
    }
  }, [enabled, preloadCommonRoutes, preloadBasedOnHistory]);

  // Cleanup
  useEffect(() => {
    return () => {
      hoverTimeouts.current.forEach(timeout => clearTimeout(timeout));
      hoverTimeouts.current.clear();
    };
  }, []);

  return {
    preloadData,
    handleMouseEnter,
    handleMouseLeave,
    observeElement,
    trackNavigation,
    preloadedCount: preloadedUrls.current.size,
    isEnabled: enabled
  };
}

/**
 * COMPONENTE PRELOAD LINK
 */
import React from 'react';

interface PreloadLinkProps {
  href: string;
  queryKey: string[];
  priority?: 'high' | 'medium' | 'low';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function PreloadLink({ 
  href, 
  queryKey, 
  priority = 'medium', 
  children, 
  className = '',
  onClick 
}: PreloadLinkProps) {
  const { handleMouseEnter, handleMouseLeave, observeElement, trackNavigation } = useSmartPreload();
  const elementRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      observeElement(elementRef.current, { href, queryKey, priority });
    }
  }, [href, queryKey, priority, observeElement]);

  const handleClick = () => {
    trackNavigation(href);
    onClick?.();
  };

  return (
    <a
      ref={elementRef}
      href={href}
      className={className}
      onMouseEnter={() => handleMouseEnter({ href, queryKey, priority })}
      onMouseLeave={() => handleMouseLeave(href)}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}