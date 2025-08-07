import React, { useState, useRef, ReactNode } from 'react';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { animations, dragDropAnimations } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface DragDropItemProps {
  children: ReactNode;
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  className?: string;
  showArrows?: boolean; // Mantém as setas como fallback
  dragEnabled?: boolean; // Permite desabilitar drag temporariamente
}

interface DragState {
  isDragging: boolean;
  dragIndex: number | null;
  dropIndex: number | null;
}

export function DragDropItem({
  children,
  index,
  onMove,
  canMoveUp = true,
  canMoveDown = true,
  className,
  showArrows = true,
  dragEnabled = true,
}: DragDropItemProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragIndex: null,
    dropIndex: null,
  });
  
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Funções das setas (funcionalidade original mantida)
  const handleMoveUp = () => {
    if (canMoveUp && index > 0) {
      onMove(index, index - 1);
    }
  };

  const handleMoveDown = () => {
    if (canMoveDown) {
      onMove(index, index + 1);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!dragEnabled) return;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    setDragState({
      isDragging: true,
      dragIndex: index,
      dropIndex: null,
    });

    // Adiciona uma pequena transparência ao elemento sendo arrastado
    if (dragRef.current) {
      dragRef.current.style.opacity = '0.5';
    }
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      dragIndex: null,
      dropIndex: null,
    });
    
    if (dragRef.current) {
      dragRef.current.style.opacity = '1';
    }
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!dragEnabled) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!dragEnabled) return;
    
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (draggedIndex !== index) {
      onMove(draggedIndex, index);
    }
    
    setDragState({
      isDragging: false,
      dragIndex: null,
      dropIndex: null,
    });
    setIsDragOver(false);
  };

  return (
    <div
      ref={dragRef}
      draggable={dragEnabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'group relative',
        dragDropAnimations.sortableItem.base,
        dragState.isDragging && dragDropAnimations.sortableItem.dragging,
        isDragOver && dragDropAnimations.sortableContainer.dragOver,
        className
      )}
    >
      {/* Drag Handle + Children Container */}
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        {dragEnabled && (
          <div className={cn(
            'flex flex-col items-center justify-center mt-2',
            dragDropAnimations.dragHandle.base,
            'group-hover:opacity-100',
            'cursor-grab active:cursor-grabbing'
          )}>
            <GripVertical size={16} className="text-gray-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {/* Arrow Controls (mantidos como fallback) */}
        {showArrows && (
          <div className="flex flex-col gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={handleMoveUp}
              disabled={!canMoveUp || index === 0}
              className={cn(
                'p-1 rounded hover:bg-gray-100 transition-colors duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                animations.hoverScale
              )}
              title="Mover para cima"
            >
              <ChevronUp size={14} className="text-gray-500" />
            </button>
            <button
              onClick={handleMoveDown}
              disabled={!canMoveDown}
              className={cn(
                'p-1 rounded hover:bg-gray-100 transition-colors duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                animations.hoverScale
              )}
              title="Mover para baixo"
            >
              <ChevronDown size={14} className="text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Drop Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary-400 bg-primary-50 bg-opacity-50 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}

// Container para múltiplos itens drag & drop
interface DragDropContainerProps {
  children: ReactNode;
  className?: string;
}

export function DragDropContainer({ children, className }: DragDropContainerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  );
}

// Hook para gerenciar lista reordenável
export function useDragDropList<T>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);

  const moveItem = (fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  };

  const canMoveUp = (index: number) => index > 0;
  const canMoveDown = (index: number) => index < items.length - 1;

  return {
    items,
    setItems,
    moveItem,
    canMoveUp,
    canMoveDown,
  };
}