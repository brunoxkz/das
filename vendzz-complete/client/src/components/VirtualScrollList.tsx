/**
 * VIRTUAL SCROLL LIST - PERFORMANCE EXTREMA
 * Renderiza apenas itens visíveis para suportar milhares de items
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Itens extras para renderizar fora da viewport
  className?: string;
  onLoadMore?: () => void;
  loadMoreThreshold?: number;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onLoadMore,
  loadMoreThreshold = 10
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular quais itens devem ser renderizados
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    // Adicionar overscan para scroll suave
    const overscanStart = Math.max(0, startIndex - overscan);
    const overscanEnd = Math.min(items.length - 1, endIndex + overscan);

    return {
      start: overscanStart,
      end: overscanEnd,
      startIndex,
      endIndex
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Itens visíveis para renderizar
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange.start, visibleRange.end]);

  // Handle scroll com throttling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);

    // Load more quando próximo do fim
    if (onLoadMore && loadMoreThreshold) {
      const scrollBottom = newScrollTop + containerHeight;
      const totalHeight = items.length * itemHeight;
      const threshold = totalHeight - (loadMoreThreshold * itemHeight);

      if (scrollBottom >= threshold) {
        onLoadMore();
      }
    }
  };

  // Dimensões do container virtual
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  useEffect(() => {
    // Reset scroll quando items mudam drasticamente
    if (containerRef.current && items.length === 0) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container ${className}`}
      style={{ 
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      {/* Container virtual com altura total */}
      <div
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {/* Items visíveis com offset */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, virtualIndex) => {
            const actualIndex = visibleRange.start + virtualIndex;
            return (
              <div
                key={actualIndex}
                style={{
                  height: itemHeight,
                  position: 'relative'
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {onLoadMore && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: visibleRange.end >= items.length - loadMoreThreshold ? 1 : 0,
            transition: 'opacity 0.2s'
          }}
        >
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}

/**
 * HOOK PARA USAR VIRTUAL SCROLL COM PAGINAÇÃO
 */
interface UseVirtualScrollProps<T> {
  initialItems: T[];
  loadMore: (page: number) => Promise<T[]>;
  itemHeight: number;
  containerHeight: number;
}

export function useVirtualScroll<T>({
  initialItems,
  loadMore,
  itemHeight,
  containerHeight
}: UseVirtualScrollProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await loadMore(page + 1);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar mais itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVirtualList = (renderItem: (item: T, index: number) => React.ReactNode) => (
    <VirtualScrollList
      items={items}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderItem}
      onLoadMore={hasMore ? handleLoadMore : undefined}
      loadMoreThreshold={5}
    />
  );

  return {
    items,
    loading,
    hasMore,
    renderVirtualList,
    loadMore: handleLoadMore
  };
}